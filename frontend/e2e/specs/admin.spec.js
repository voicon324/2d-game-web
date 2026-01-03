import { test, expect } from '@playwright/test';

test.describe('Admin Features', () => {
    const ADMIN_USER = { username: 'admin', password: 'admin123' };

    test('Admin Dashboard Access', async ({ page }) => {
        // Login as Admin
        await page.goto('/login');
        await page.getByPlaceholder('Enter your username').fill(ADMIN_USER.username);
        await page.getByPlaceholder('••••••••').first().fill(ADMIN_USER.password);
        await page.getByRole('button', { name: 'Sign In' }).click();
        
        // Wait for login to complete
        await expect(page).toHaveURL('/');

        // Navigate to Admin Dashboard
        await page.goto('/admin');
        
        // Check we are on admin page
        await expect(page).toHaveURL(/\/admin/);
        
        // Check Sidebar link is visible (confirming layout loaded)
        await expect(page.getByText('User Management')).toBeVisible();
    });

    test('View User List', async ({ page }) => {
         // Login as Admin
         await page.goto('/login');
         await page.getByPlaceholder('Enter your username').fill(ADMIN_USER.username);
         await page.getByPlaceholder('••••••••').first().fill(ADMIN_USER.password);
         await page.getByRole('button', { name: 'Sign In' }).click();
 
         // Wait for login
         await expect(page).toHaveURL('/');
         await page.goto('/admin/users');
         
         // Expect a table or list
         await expect(page.locator('table, .user-list, ul').first()).toBeVisible();
         // Expect to see 'admin' in the list
         await expect(page.getByText('admin').first()).toBeVisible();
    });
});
