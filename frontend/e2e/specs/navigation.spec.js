import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {

  test('Public Pages are accessible', async ({ page }) => {
    const publicRoutes = [
      { path: '/', title: /Welcome|Home/i },
      { path: '/leaderboard', title: /Leaderboard/i },
      { path: '/tournaments', title: /Tournaments/i },
      { path: '/about', title: /About/i },
      { path: '/help', title: /Help/i },
      { path: '/rules', title: /Rules/i },
    ];

    for (const route of publicRoutes) {
      await page.goto(route.path);
      // Check for title or key element
      // Using a generous selector strategy to find page content
      await expect(page.locator('h1, h2, h3').first()).toBeVisible(); 
      // Optional: more specific check
      // await expect(page).toHaveTitle(route.title); 
    }
  });

  test('Navigate using Navbar', async ({ page }) => {
    await page.goto('/');
    
    // Assume there is a navigation bar. 
    // Click on Leaderboard
    await page.getByRole('link', { name: /Leaderboard/i }).first().click();
    await expect(page).toHaveURL('/leaderboard');
    
    // Click on Tournaments
    await page.getByRole('link', { name: /Tournaments/i }).first().click();
    await expect(page).toHaveURL('/tournaments');
  });

  test('404 Page', async ({ page }) => {
    await page.goto('/non-existent-page-xyz');
    // Should redirect to Home as per App.jsx: <Route path="*" element={<Navigate to="/" replace />} />
    await expect(page).toHaveURL('/');
  });

});
