import { test, expect } from '@playwright/test';

test.describe('Social Features', () => {
    const randomId = Math.floor(Math.random() * 100000);
    const USER = { 
        username: `socialUser${randomId}`, 
        password: 'Password123!', 
        email: `social${randomId}@example.com` 
    };

    test('View Profile', async ({ page }) => {
        // Register directly in this test for isolation
        await page.goto('/login');
        await page.getByRole('button', { name: 'Register' }).click();
        await page.getByPlaceholder('Enter your username').fill(USER.username);
        await page.getByPlaceholder('name@example.com').fill(USER.email);
        await page.getByPlaceholder('••••••••').first().fill(USER.password);
        await page.getByPlaceholder('••••••••').nth(1).fill(USER.password);
        const checkbox = page.locator('input[type="checkbox"]');
        if (await checkbox.isVisible()) await checkbox.check();
        await page.getByRole('button', { name: /Create Account/i }).click();
        await expect(page).toHaveURL('/');
        
        // Now go to profile
        await page.goto('/profile');
        await expect(page.getByText('Statistics')).toBeVisible();
    });

    test('Friends Page', async ({ page }) => {
        // Register directly in this test for isolation
        const friendUser = {
            username: `friendUser${Math.floor(Math.random() * 100000)}`,
            password: 'Password123!',
            email: `friend${Math.floor(Math.random() * 100000)}@example.com`
        };
        await page.goto('/login');
        await page.getByRole('button', { name: 'Register' }).click();
        await page.getByPlaceholder('Enter your username').fill(friendUser.username);
        await page.getByPlaceholder('name@example.com').fill(friendUser.email);
        await page.getByPlaceholder('••••••••').first().fill(friendUser.password);
        await page.getByPlaceholder('••••••••').nth(1).fill(friendUser.password);
        const checkbox = page.locator('input[type="checkbox"]');
        if (await checkbox.isVisible()) await checkbox.check();
        await page.getByRole('button', { name: /Create Account/i }).click();
        await expect(page).toHaveURL('/');

        await page.goto('/friends');
        await expect(page.locator('h1, h2').filter({ hasText: /Friends/i })).toBeVisible();
        await expect(page.getByPlaceholder('Search friends...')).toBeVisible();
    });
});
