import { test, expect } from '@playwright/test';

test.describe('Full Stack Flow', () => {
  // Use a predictable user from seed data
  const USER = { username: 'admin', password: 'password123' };

  test('User can register and create a room', async ({ page }) => {
    // Debug logging
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    page.on('dialog', async dialog => {
      console.log(`BROWSER DIALOG: ${dialog.message()}`);
      await dialog.dismiss();
    });

    const randomSuffix = Math.floor(Math.random() * 10000);
    const NEW_USER = { 
      username: `testuser${randomSuffix}`, 
      password: 'Password123!',
      confirmPassword: 'Password123!'
    };

    // 1. Go to Login page
    await page.goto('/login');
    
    // 2. Switch to Register
    await page.getByRole('button', { name: /Register/i }).click();

    // 3. Fill registration form
    await page.locator('input[name="username"]').fill(NEW_USER.username);
    await page.locator('input[name="email"]').fill(`${NEW_USER.username}@example.com`);
    await page.locator('input[name="password"]').fill(NEW_USER.password);
    await page.locator('input[name="confirmPassword"]').fill(NEW_USER.confirmPassword);
    
    // 4. Agree to terms (checkbox)
    await page.getByLabel(/I agree to the/i).check();

    // 5. Submit
    await page.getByRole('button', { name: /Create Account/i }).click();
    
    // 6. Verify Redirect to Home
    await expect(page).toHaveURL('/', { timeout: 10000 });
    await expect(page.getByText(`Welcome back, ${NEW_USER.username}!`)).toBeVisible();
    
    // 5. Open Create Room Modal
    await page.getByRole('button', { name: /Create Custom Room/i }).nth(0).click();
    
    // 6. Select "Cờ Caro"
    // Finding the card/button for Caro. It might contain text "Cờ Caro"
    const pixelDotsBtn = page.locator('button').filter({ hasText: /Cờ Caro|Caro/i }).first();
    await pixelDotsBtn.click();
    
    // 7. Click Create Room
    await page.getByRole('button', { name: /Create Room/i }).click();
    
    // 8. Verify Navigation to Game Page
    // URL should contain /game/caro
    await expect(page).toHaveURL(/\/game\/caro/);
    
    // 9. Verify Game Page Content (Room loaded)
    await expect(page.getByRole('button', { name: /Leave Room/i })).toBeVisible({ timeout: 10000 });
  });
});
