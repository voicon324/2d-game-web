import { test, expect } from '@playwright/test';

// Helper to register and create room
async function setupGame(browser, gameSlug, usernamePrefix) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const username = `${usernamePrefix}_${Date.now()}`;
    
    console.log(`Setting up game for ${username} (${gameSlug})`);
    
    // Register
    await page.goto('http://localhost:5173/login');
    
    // Click Register Toggle specifically
    await page.locator('button:text("Register")').first().click();
    
    await page.locator('input[name="username"]').fill(username);
    await page.locator('input[name="email"]').fill(`${username}@test.com`);
    await page.locator('input[name="password"]').fill('password');
    await page.locator('input[name="confirmPassword"]').fill('password');
    
    // Check Agree Terms
    await page.locator('input[name="agreeTerms"]').check();
    
    await page.getByRole('button', { name: "Create Account" }).click();
    
    // Wait for redirect to home
    await expect(page).toHaveURL('http://localhost:5173/', { timeout: 10000 });
    
    // Click Create Custom Room
    const createBtn = page.getByRole('button', { name: 'add Create Custom Room' });
    await expect(createBtn).toBeVisible({ timeout: 10000 });
    await createBtn.click();
    
    // Wait for Modal
    await expect(page.getByText('Select a Game')).toBeVisible();
    
    // Select Game by Name
    const gameNames = {
        'tictactoe': 'Tic Tac Toe',
        'connect4': 'Connect 4',
        'match3': 'Candy Rush',
        'memory': 'Memory Chess',
        'drawing': 'Free Drawing'
    };
    const gameName = gameNames[gameSlug];
    
    // Find the game card - search for the text inside the button
    await page.locator('button', { hasText: gameName }).click();
    
    // Click Create Room in Modal
    await page.getByRole('button', { name: "Create Room" }).click();
    
    console.log(`Room created for ${username}`);
    return page;
}

test.describe('New Games Functionality', () => {
    test('Tic Tac Toe - Join (Multiplayer)', async ({ browser }) => {
        const p1 = await setupGame(browser, 'tictactoe', 'TicPlayer');
        
        // Multiplayer games require 2 players. We verifies it enters Lobby.
        // Also verify Correct Game Name is displayed to ensure no "Caro" fallback.
        await expect(p1.getByText('Waiting for players...')).toBeVisible();
        
        // Verify Game Title in Help or Header
        // The snapshot showed "How to play Cờ Caro" which is suspicious.
        // We assert "Tic Tac Toe" is visible somewhere (e.g. Header or Help).
        // If this fails, we have a backend/frontend mapping issue.
        await expect(p1.getByText('Tic Tac Toe')).toBeVisible(); 
    });

    test('Connect 4 - Join (Multiplayer)', async ({ browser }) => {
        const p1 = await setupGame(browser, 'connect4', 'C4Player');
        await expect(p1.getByText('Waiting for players...')).toBeVisible();
        await expect(p1.getByText('Connect 4')).toBeVisible();
    });

    test('Match 3 - Join (Multiplayer)', async ({ browser }) => {
        const p1 = await setupGame(browser, 'match3', 'M3Player');
        await expect(p1.getByText('Waiting for players...')).toBeVisible();
        await expect(p1.getByText('Candy Rush')).toBeVisible();
    });

    test('Memory - Join (Multiplayer)', async ({ browser }) => {
        const p1 = await setupGame(browser, 'memory', 'MemPlayer');
        await expect(p1.getByText('Waiting for players...')).toBeVisible();
        await expect(p1.getByText('Memory Chess')).toBeVisible();
    });

    test('Drawing - Join and Paint (Singleplayer)', async ({ browser }) => {
        const p1 = await setupGame(browser, 'drawing', 'DrawPlayer');
        
        // Drawing minPlayers=1. We must click READY.
        await expect(p1.getByText('Ready to Play')).toBeVisible();
        await p1.getByRole('button', { name: "Ready to Play" }).click();
        
        // Now it should start.
        await expect(p1.getByText('Click to paint pixels.')).toBeVisible({ timeout: 15000 });
        
        // Small wait for board to stabilize and event listeners to attach
        await p1.waitForTimeout(2000);

        // Be very specific about which cell to click to avoid ambiguity
        const cell = p1.locator('[data-cell="true"][data-x="0"][data-y="0"]').first();
        await expect(cell).toBeVisible();
        await cell.click({ force: true });
        
        const pixel = cell.locator('div').first();
        // Wait for state to sync and color to change
        await expect(pixel).toHaveCSS('background-color', 'rgb(0, 0, 0)', { timeout: 15000 });
    });
});
