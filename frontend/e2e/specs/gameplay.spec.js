import { test, expect } from '@playwright/test';

test.describe('Gameplay - Caro', () => {
  test('Player can create a game room', async ({ page }) => {
    // Register a user
    const username = `player_${Math.floor(Math.random() * 100000)}`;
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
    
    // Find and click Create Room button
    await page.getByRole('button', { name: /Create Custom Room/i }).first().click();
    
    // Select Caro game
    const caroBtn = page.locator('button').filter({ hasText: /Cờ Caro|Caro/i }).first();
    await expect(caroBtn).toBeVisible();
    await caroBtn.click();
    
    // Create room
    await page.getByRole('button', { name: /Create Room/i }).click();
    
    // Should navigate to game page
    await expect(page).toHaveURL(/\/game\/caro/);
    
    // Verify page has loaded with room info
    await expect(page.getByText('Room').first()).toBeVisible({ timeout: 15000 });
  });
});
