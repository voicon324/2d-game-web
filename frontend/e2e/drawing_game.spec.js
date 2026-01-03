import { test, expect } from '@playwright/test';

// Helper to register and return page
async function registerAndLogin(browser, usernamePrefix) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const username = `${usernamePrefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    console.log(`[${username}] Starting registration...`);

    // Register
    await page.goto('http://localhost:5173/login');
    await page.locator('button:text("Register")').first().click();
    
    await page.locator('input[name="username"]').fill(username);
    await page.locator('input[name="email"]').fill(`${username}@test.com`);
    await page.locator('input[name="password"]').fill('password');
    await page.locator('input[name="confirmPassword"]').fill('password');
    await page.locator('input[name="agreeTerms"]').check();
    
    await page.getByRole('button', { name: "Create Account" }).click();
    
    // Wait for redirect to home
    await expect(page).toHaveURL('http://localhost:5173/', { timeout: 15000 });
    console.log(`[${username}] Registered and logged in.`);
    
    return { page, username };
}

async function createDrawingRoom(page) {
    // Click Create Custom Room
    const createBtn = page.getByRole('button', { name: 'add Create Custom Room' });
    await expect(createBtn).toBeVisible();
    await createBtn.click();
    
    // Select Drawing Game
    await expect(page.getByText('Select a Game')).toBeVisible();
    await page.locator('button', { hasText: 'Free Drawing' }).click();
    
    // Click Create Room
    await page.getByRole('button', { name: "Create Room" }).click();
    
    // Verify Lobby
    const roomCodeElement = page.locator('span.font-mono.text-pink-500.font-bold');
    await expect(roomCodeElement).toBeVisible();
    const roomCode = await roomCodeElement.innerText();
    console.log(`Room created: ${roomCode}`);
    
    return roomCode;
}

test.describe('Drawing Game Detailed E2E', () => {
    
    test('Detailed Single Player Flow', async ({ browser }) => {
        const { page, username } = await registerAndLogin(browser, 'DrawSolo');
        
        await createDrawingRoom(page);
        
        // Wait for player list
        await expect(page.getByText(username + ' (You)')).toBeVisible();
        
        // Click Ready
        const readyBtn = page.getByRole('button', { name: "Ready to Play" });
        await expect(readyBtn).toBeVisible();
        await readyBtn.click();
        
        // Verify Game Start UI
        await expect(page.getByText('Click to paint pixels.')).toBeVisible({ timeout: 15000 });
        
        // Interact with the Board
        // Select top-left cell (0,0)
        const cell = page.locator('[data-cell="true"][data-x="0"][data-y="0"]').first();
        await expect(cell).toBeVisible();
        
        // Initial state check (should be white/empty)
        // Note: The renderer sets backgroundColor to '#FFFFFF' if null/empty for drawing game
        // OR checks the computed style. Let's rely on visual feedback via logic.
        
        // Click to paint
        console.log('Clicking cell (0,0) to paint...');
        await cell.click();
        
        // Verify color change
        // The GameRenderer uses inline style for drawing: style={{ backgroundColor: value || '#FFFFFF' }}
        // Black is default color in frontend logic for now
        const blackPixel = page.locator('[data-cell="true"][data-x="0"][data-y="0"] div').first();
        await expect(blackPixel).toHaveCSS('background-color', 'rgb(0, 0, 0)', { timeout: 5000 });
        
        console.log('Test Passed: Cell color changed to black.');
    });

    test('Multiplayer Synchronization', async ({ browser }) => {
        // Player 1 sets up room
        const { page: p1, username: u1 } = await registerAndLogin(browser, 'DrawP1');
        const roomCode = await createDrawingRoom(p1);
        
        // Player 2 joins
        const { page: p2, username: u2 } = await registerAndLogin(browser, 'DrawP2');
        
        // P2 enters room code
        await expect(p2.getByPlaceholder('Enter room code...')).toBeVisible();
        await p2.getByPlaceholder('Enter room code...').fill(roomCode);
        await p2.getByRole('button', { name: "Join Room" }).click();
        
        // Verify both players visible in both sessions
        await expect(p1.getByText(u2)).toBeVisible();
        await expect(p2.getByText(u1)).toBeVisible(); // u1 might be shown as 'Player' or username depending on logic, but checking for u1 name ideally
        
        // Both click Ready
        await p1.getByRole('button', { name: "Ready to Play" }).first().click();
        await p2.getByRole('button', { name: "Ready to Play" }).first().click();
        
        // Wait for game start on both
        await expect(p1.getByText('Click to paint pixels.')).toBeVisible({ timeout: 15000 });
        await expect(p2.getByText('Click to paint pixels.')).toBeVisible({ timeout: 15000 });
        
        // P1 paints (0,0)
        console.log('P1 painting (0,0)...');
        await p1.locator('[data-cell="true"][data-x="0"][data-y="0"]').first().click();
        
        // Verify P1 sees it
        const p1Cell = p1.locator('[data-cell="true"][data-x="0"][data-y="0"] div').first();
        await expect(p1Cell).toHaveCSS('background-color', 'rgb(0, 0, 0)');
        
        // Verify P2 sees it
        console.log('Verifying P2 sees P1 move...');
        const p2Cell = p2.locator('[data-cell="true"][data-x="0"][data-y="0"] div').first();
        await expect(p2Cell).toHaveCSS('background-color', 'rgb(0, 0, 0)', { timeout: 5000 });
        
        // P2 paints (1,1)
        console.log('P2 painting (1,1)...');
        await p2.locator('[data-cell="true"][data-x="1"][data-y="1"]').first().click();
        
        // Verify P2 sees it
        const p2Cell2 = p2.locator('[data-cell="true"][data-x="1"][data-y="1"] div').first();
        await expect(p2Cell2).toHaveCSS('background-color', 'rgb(0, 0, 0)');
        
        // Verify P1 sees it
        console.log('Verifying P1 sees P2 move...');
        const p1Cell2 = p1.locator('[data-cell="true"][data-x="1"][data-y="1"] div').first();
        await expect(p1Cell2).toHaveCSS('background-color', 'rgb(0, 0, 0)', { timeout: 5000 });
    });
});
