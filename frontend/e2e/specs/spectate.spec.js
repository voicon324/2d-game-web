import { test, expect } from '@playwright/test';

test.describe('Spectate Mode', () => {
  test('User can access spectate page', async ({ page }) => {
    // Register a user
    const username = `spectator_${Math.floor(Math.random() * 100000)}`;
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
    
    // Navigate to spectate page
    await page.goto('/spectate');
    
    // Check page loaded with expected content
    await expect(page.locator('h1, h2').filter({ hasText: /Spectate|Live|Watch/i }).first()).toBeVisible();
  });
});
