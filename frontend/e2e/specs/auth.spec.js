import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  const randomId = Math.floor(Math.random() * 100000);
  const TEST_USER = {
    username: `testuser_${randomId}`,
    email: `test_${randomId}@example.com`,
    password: 'Password123!'
  };

  test('Registration Flow', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Register' }).click();

    await page.getByPlaceholder('Enter your username').fill(TEST_USER.username);
    await page.getByPlaceholder('name@example.com').fill(TEST_USER.email);
    await page.getByPlaceholder('••••••••').first().fill(TEST_USER.password);
    await page.getByPlaceholder('••••••••').nth(1).fill(TEST_USER.password);
    
    const termsCheckbox = page.locator('input[type="checkbox"]');
    if (await termsCheckbox.isVisible()) {
        await termsCheckbox.check();
    }

    await page.getByRole('button', { name: /Create Account/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('Login Flow', async ({ page }) => {
     const loginUser = {
        username: `login_${Math.floor(Math.random() * 100000)}`,
        email: `login_${Math.floor(Math.random() * 100000)}@example.com`,
        password: 'Password123!'
     };

     // Register first
     await page.goto('/login');
     await page.getByRole('button', { name: 'Register' }).click();
     await page.getByPlaceholder('Enter your username').fill(loginUser.username);
     await page.getByPlaceholder('name@example.com').fill(loginUser.email);
     await page.getByPlaceholder('••••••••').first().fill(loginUser.password);
     await page.getByPlaceholder('••••••••').nth(1).fill(loginUser.password);
     const checkbox = page.locator('input[type="checkbox"]');
     if (await checkbox.isVisible()) await checkbox.check();
     await page.getByRole('button', { name: /Create Account/i }).click();
     await expect(page).toHaveURL('/');

     // Logout via profile
     await page.goto('/profile');
     await page.getByTestId('logout-button').click();
     await expect(page).toHaveURL('/login');

     // Login again
     await page.getByPlaceholder('Enter your username').fill(loginUser.username);
     await page.getByPlaceholder('••••••••').first().fill(loginUser.password);
     await page.getByRole('button', { name: 'Sign In' }).click();
     
     await expect(page).toHaveURL('/');
  });

  test('Logout Flow', async ({ page }) => {
      const logoutUser = {
        username: `logout_${Math.floor(Math.random() * 100000)}`,
        email: `logout_${Math.floor(Math.random() * 100000)}@example.com`,
        password: 'Password123!'
      };

      // Register
      await page.goto('/login');
      await page.getByRole('button', { name: 'Register' }).click();
      await page.getByPlaceholder('Enter your username').fill(logoutUser.username);
      await page.getByPlaceholder('name@example.com').fill(logoutUser.email);
      await page.getByPlaceholder('••••••••').first().fill(logoutUser.password);
      await page.getByPlaceholder('••••••••').nth(1).fill(logoutUser.password);
      const checkbox = page.locator('input[type="checkbox"]');
      if (await checkbox.isVisible()) await checkbox.check();
      await page.getByRole('button', { name: /Create Account/i }).click();
      await expect(page).toHaveURL('/');

      // Logout using data-testid
      await page.goto('/profile');
      await page.getByTestId('logout-button').click();
      await expect(page).toHaveURL('/login');
  });
});
