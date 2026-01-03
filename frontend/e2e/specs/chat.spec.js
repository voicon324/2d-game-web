import { test, expect } from '@playwright/test';

test.describe('In-Game Chat', () => {
    test('Chat component is visible in game', async ({ page }) => {
        // Register a user
        const username = `chat_${Math.floor(Math.random() * 100000)}`;
        await page.goto('/login');
        await page.getByRole('button', { name: 'Register' }).click();
        await page.getByPlaceholder('Enter your username').fill(username);
        await page.getByPlaceholder('name@example.com').fill(`${username}@example.com`);
        await page.getByPlaceholder('••••••••').first().fill('Password123!');
        await page.getByPlaceholder('••••••••').nth(1).fill('Password123!');
        const checkbox = page.locator('input[type="checkbox"]');
        if (await checkbox.isVisible()) await checkbox.check();
        await page.getByRole('button', { name: /Create Account/i }).click();
        await expect(page).toHaveURL('/');
        
        // Create a room
        await page.getByRole('button', { name: /Create Custom Room/i }).first().click();
        const caroBtn = page.locator('button').filter({ hasText: /Cờ Caro|Caro/i }).first();
        await caroBtn.click();
        await page.getByRole('button', { name: /Create Room/i }).click();
        await expect(page).toHaveURL(/\/game\/caro/);
        
        // Wait for game page to load
        await expect(page.getByText('Room').first()).toBeVisible({ timeout: 15000 });
        
        // Verify chat input is present
        await expect(page.getByTestId('chat-input')).toBeVisible();
    });
});
