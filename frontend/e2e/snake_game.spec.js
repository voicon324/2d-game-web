import { test, expect } from '@playwright/test';

test.describe('Snake Game', () => {
    test('should allow a user to join and play Snake', async ({ page }) => {
        // 1. Register/Login
        const username = `tester_${Date.now()}`;
        await page.goto('http://localhost:5173/login');
        // Switch to Register mode
        await page.getByRole('button', { name: 'Register' }).first().click();
        
        await page.getByPlaceholder('Enter your username').fill(username);
        await page.getByPlaceholder('name@example.com').fill(`${username}@test.com`);
        await page.getByPlaceholder('••••••••').first().fill('password123'); // Password
        await page.getByPlaceholder('••••••••').nth(1).fill('password123'); // Confirm Password
        
        // Agree to terms
        await page.locator('input[name="agreeTerms"]').check();
        
        await page.getByRole('button', { name: 'Create Account' }).click();

        // 2. Create Room
        await expect(page).toHaveURL('http://localhost:5173/');
        await expect(page.getByText(`Welcome back, ${username}`)).toBeVisible();
        await page.getByRole('button', { name: 'Create Custom Room' }).click();
        
        // Select Snake from the modal (button containing "Snake")
        const snakeButton = page.locator('div[role="dialog"] button').filter({ hasText: 'Snake' }).first(); 
        // Or simply button with name if unique
        // Using locator with filter is safer vs 'dialog' role if not explicitly set, checking jsx...
        // Modal has strict structure but maybe not role="dialog"? 
        // It has `fixed inset-0 z-50`.
        // Let's use: page.locator('button').filter({ hasText: 'Snake' })
        // And ensuring we pick the one in the modal (which is likely the last one rendered or visible)
        // But better: change username to not include "snake"
        
        await expect(page.locator('button').filter({ hasText: 'Snake' }).first()).toBeVisible();
        await page.locator('button').filter({ hasText: 'Snake' }).first().click();
        
        // Create
        await page.getByRole('button', { name: 'Create Room' }).click();
        
        // 3. Game Page
        await expect(page).toHaveURL(/\/game\/snake/);
        // 3. Game Page
        await expect(page).toHaveURL(/\/game\/snake/);
        // Check for Room label exactly or check for sidebar
        await expect(page.getByText('Room', { exact: true })).toBeVisible();
        
        // 4. Join/Ready
        // If auto-joined, check ready button
        await expect(page.getByRole('button', { name: 'Ready to Play' })).toBeVisible({ timeout: 10000 });
        await page.getByRole('button', { name: 'Ready to Play' }).click();
        
        // Wait for game start (might need 2nd player? No, minPlayers=1 for Snake)
        // Check if game rendered
        // Snake renderer uses unique class or style
        // We look for snake head/body
        // The game loop starts immediately if minPlayers=1? 
        // Let's check seed config: minPlayers 1.
        // So hitting Ready should start it.
        
        // Wait for board
        await expect(page.locator('.bg-slate-900.border-4.border-slate-700')).toBeVisible(); // Board style
        
        // Check for snake segment
        // First segment color is based on player index, likely green #22c55e
        const snakeSelector = 'div[style*="background-color: rgb(34, 197, 94)"]'; // #22c55e
        // Or cleaner locator
        // We added data-cell, but the snake is rendered INSIDE the cell button
        // The cell is a button.
        
        // Wait for snake to appear
        await page.waitForTimeout(1000); // Give it a sec to spawn
        
        // Verify Snake exists
        // We need to find a cell that contains the snake div
        // The snake div has class "w-full h-full rounded-sm"
        const snakeCell = page.locator('div.w-full.h-full.rounded-sm');
        await expect(snakeCell.first()).toBeVisible();
        
        // Verify Food exists (red pulsing)
        const foodCell = page.locator('.bg-red-500.rounded-full.animate-pulse');
        await expect(foodCell.first()).toBeVisible();
        
        // 5. Test Movement
        // Get initial position implies tracking updates.
        // Let's just send keys and verify no error/crash
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowLeft');
        
        // Check if we are still in game (not crashed/game over immediately)
        // Verify sidebar is present by checking for Leave Room button handle
        await expect(page.getByRole('button', { name: 'Leave Room' })).toBeVisible();
        
        // 6. Leave Room
        await page.getByRole('button', { name: 'Leave Room' }).click();
        // Should return to Join Room form (not Home)
        await expect(page.getByRole('button', { name: 'Join Room' })).toBeVisible();
    });
});
