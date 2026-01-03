import { test, expect } from '@playwright/test';

test.describe('Multiplayer Flow', () => {
    test('Two players can play Caro together', async ({ browser }) => {
        // Create two isolated browser contexts
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();
        const page1 = await context1.newPage();
        const page2 = await context2.newPage();



        // ----------------------------------------------------------
        // PREPARE USERS
        // ----------------------------------------------------------
        const suffix = Math.floor(Math.random() * 100000);
        const user1 = { 
            username: `p1_${suffix}`, 
            password: 'Password123!',
            email: `p1_${suffix}@test.com`
        };
        const user2 = { 
            username: `p2_${suffix}`, 
            password: 'Password123!',
            email: `p2_${suffix}@test.com`
        };

        // ----------------------------------------------------------
        // PLAYER 1 FLOW: REGISTER & CREATE ROOM
        // ----------------------------------------------------------
        console.log('Player 1: Registering...');
        await page1.goto('/login');
        await page1.getByRole('button', { name: /Register/i }).click();
        await page1.locator('input[name="username"]').fill(user1.username);
        await page1.locator('input[name="email"]').fill(user1.email);
        await page1.locator('input[name="password"]').fill(user1.password);
        await page1.locator('input[name="confirmPassword"]').fill(user1.password);
        await page1.getByLabel(/I agree/i).check();
        await page1.getByRole('button', { name: /Create Account/i }).click();
        await expect(page1).toHaveURL('/', { timeout: 10000 });

        console.log('Player 1: Creating Room...');
        await page1.getByRole('button', { name: /Create Custom Room/i }).nth(0).click();
        await page1.locator('button').filter({ hasText: /Cờ Caro|Caro/i }).first().click();
        await page1.getByRole('button', { name: /Create Room/i }).click();
        
        // Wait for P1 to be in the room
        await expect(page1).toHaveURL(/\/game\/caro/);
        
        // Extract Room Code
        // We look for the font-mono class that displays the room code
        // The Join Form also has a Room Code label, so be specific.
        const roomCodeElement = page1.locator('span.font-mono.text-pink-500');
        await expect(roomCodeElement).toBeVisible({ timeout: 10000 });
        const roomCode = await roomCodeElement.innerText();
        console.log(`Room Code Created: ${roomCode}`);
        expect(roomCode).toBeTruthy();

        // ----------------------------------------------------------
        // PLAYER 2 FLOW: REGISTER & JOIN ROOM
        // ----------------------------------------------------------
        console.log('Player 2: Registering...');
        await page2.goto('/login');
        await page2.getByRole('button', { name: /Register/i }).click();
        await page2.locator('input[name="username"]').fill(user2.username);
        await page2.locator('input[name="email"]').fill(user2.email);
        await page2.locator('input[name="password"]').fill(user2.password);
        await page2.locator('input[name="confirmPassword"]').fill(user2.password);
        await page2.getByLabel(/I agree/i).check();
        await page2.getByRole('button', { name: /Create Account/i }).click();
        await expect(page2).toHaveURL('/', { timeout: 10000 });

        console.log('Player 2: Joining Room...');
        await page2.goto('/game/caro');
        await expect(page2.getByPlaceholder(/Enter room code/i)).toBeVisible();
        
        await page2.locator('input[placeholder*="room code"]').fill(roomCode);
        await page2.getByRole('button', { name: /Join Room/i }).click();

        // ----------------------------------------------------------
        // VERIFICATION: BOTH IN ROOM
        // ----------------------------------------------------------
        // Check P2 sees P1
        await expect(page2.getByText(user1.username)).toBeVisible();
        // Check P1 sees P2
        await expect(page1.getByText(user2.username)).toBeVisible();

        console.log('Both players connected!');

        // ----------------------------------------------------------
        // GAMEPLAY CHECK
        // ----------------------------------------------------------
        // P1 should change status to Ready (if needed) or P2 needs to be Ready
        // Check GameBoardPage: 
        // {roomInfo.status === 'waiting' && !isPlayerReady && ( Ready Button )}
        
        // P2 clicks Ready
        const p2ReadyBtn = page2.getByRole('button', { name: /Ready to Play/i });
        if (await p2ReadyBtn.isVisible()) {
            await p2ReadyBtn.click();
        }
        
        // P1 (Host) usually auto-ready? Or needs to click Start?
        // Logic in code: "Ready to Play" button if waiting.
        // Let's make P1 ready too if the button exists.
        const p1ReadyBtn = page1.getByRole('button', { name: /Ready to Play/i });
        if (await p1ReadyBtn.isVisible()) {
            await p1ReadyBtn.click();
        }

        // Wait for game start (board visible)
        // The board is a grid of buttons
        const boardGrid = page1.locator('.inline-grid');
        await expect(boardGrid).toBeVisible();
        await expect(page2.locator('.inline-grid')).toBeVisible();

        console.log('Game Started! Testing Gameplay...');

        // Helper to click cell (x, y)
        // Buttons are in order: row 0 (x 0..14), row 1, etc.
        // Index = y * 15 + x provided board is 15x15
        const clickCell = async (page, x, y) => {
            const index = y * 15 + x;
            const button = page.locator('.inline-grid button').nth(index);
            await button.click();
        };

        // ----------------------------------------------------------
        // MOVE 1: Player 1 (X) plays at (0,0)
        // ----------------------------------------------------------
        console.log('P1 making move at (0,0)...');
        await clickCell(page1, 0, 0);

        // Wait a bit for update
        await page1.waitForTimeout(500);

        // Verify "Moves" count = 1
        await expect(page1.getByText('Moves: 1')).toBeVisible({ timeout: 5000 });
        await expect(page2.getByText('Moves: 1')).toBeVisible({ timeout: 5000 });

        // ----------------------------------------------------------
        // MOVE 2: Player 2 (O) plays at (1,1)
        // ----------------------------------------------------------
        console.log('P2 making move at (1,1)...');
        await clickCell(page2, 1, 1);

        // Wait a bit for update
        await page1.waitForTimeout(500);

        // Verify "Moves" count = 2
        await expect(page1.getByText('Moves: 2')).toBeVisible({ timeout: 5000 });
        await expect(page2.getByText('Moves: 2')).toBeVisible({ timeout: 5000 });

        console.log('Gameplay Verified!');
    });
});
