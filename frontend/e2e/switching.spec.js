import { test, expect } from '@playwright/test';

test.describe('Game Switching Flow', () => {
    test('User can switch from Caro to Tank game correctly', async ({ page }) => {
        const username = `switcher_${Date.now()}`;
        const password = 'Password123!';
        
        // 1. Register
        await test.step('Register', async () => {
            await page.goto('/login');
            await page.getByRole('button', { name: /Register/i }).click();
            await page.locator('input[name="username"]').fill(username);
            await page.locator('input[name="email"]').fill(`${username}@test.com`);
            await page.locator('input[name="password"]').fill(password);
            await page.locator('input[name="confirmPassword"]').fill(password);
            await page.getByLabel(/I agree/i).check();
            await page.getByRole('button', { name: /Create Account/i }).click();
            await expect(page).toHaveURL('/', { timeout: 10000 });
        });

        // 2. Play Caro
        await test.step('Play Caro', async () => {
            console.log('Creating Caro room...');
            await page.getByRole('button', { name: /Create Custom Room/i }).nth(0).click();
            await page.locator('button').filter({ hasText: /Caro/i }).first().click();
            await page.getByRole('button', { name: /Create Room/i }).click();
            
            await expect(page).toHaveURL(/\/game\/caro/);
            
            // Wait for socket connection
            await expect(page.getByText('Connected')).toBeVisible();

            // Verify Caro Board (15x15 = 225 cells)
            // The grid might take a moment to render after "Waiting for players" if that appears.
            // But since we created the room, we are in the room. 
            // GameRenderer renders if gameState exists.
            // Initially gameState might be null? 
            // TankGame/CaroGame on backend initializes state immediately on room creation?
            // "Waiting for players..." is shown if !gameState.
            // Backend sends `game:start` or `game:state`?
            // Usually need 2 players to START.
            // BUT, `GameRenderer` is rendered if `gameState?.board` exists.
            
            // If the game hasn't started, do we see the board?
            // In `GameBoardPage.jsx`:
            // `{gameState?.board ? ( <GameRenderer ... /> ) : ( "Waiting for players..." )}`
            
            // So if I am alone in the room, I see "Waiting for players...".
            // I CANNOT verify the board size if I don't see the board!
            
            // I need to start the game to see the board.
            // Or I need to verify that I am in the correct ROOM context.
            // The sidebar shows "Room ...". 
            // Ideally, I should see "Cờ Caro" title in the Waiting screen.
            
            await expect(page.getByText('Cờ Caro')).toBeVisible();
            await expect(page.getByText('Waiting for players...')).toBeVisible();
        });

        // 3. Leave Room
        await test.step('Leave Room', async () => {
             console.log('Leaving Caro room...');
             // Click "Leave Room" button in sidebar
             await page.getByRole('button', { name: /Leave Room/i }).click();
             
             // Should go back to Home
             // `leaveRoom` function in `GameBoardPage` does NOT navigate. 
             // It just emits socket event.
             // Wait, `leaveRoom` in `useWebSocket` clears state.
             // `GameBoardPage` just stays there?
             // If `roomInfo` becomes null, `GameBoardPage` renders the "Join Room" form.
             // It does NOT redirect to home automatically in `GameBoardPage.jsx`.
             
             // Let's check `GameBoardPage.jsx` L254: `{!roomInfo ? ( <Join Form> ) ...`
             // So if I accept that, I am still on `/game/caro` URL!
             // Because URL param didn't change.
             
             // User says "join qua phòng tank".
             // Maybe they go back to Home first? 
             // Or they use the Join Form present on the page?
             
             // Let's assume they go to Home to Create New Room.
             await page.getByRole('link', { name: /PixelHeart/i }).first().click();
             await expect(page).toHaveURL('/');
        });

        // 4. Play Tank
        await test.step('Play Tank', async () => {
            console.log('Creating Tank room...');
            await page.getByRole('button', { name: /Create Custom Room/i }).nth(0).click();
            await page.locator('button').filter({ hasText: /Tank/i }).first().click();
            await page.getByRole('button', { name: /Create Room/i }).click();
            
            // We expect URL to change to /game/tank...
            await expect(page).toHaveURL(/\/game\/tank/);
            
            // Verify Tank context via Help Link
            await expect(page.getByRole('link', { name: /How to play Tank Battle/i })).toBeVisible();
        });
    });
});
