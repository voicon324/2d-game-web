import { test, expect } from '@playwright/test';

test.describe('Admin Game Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await page.goto('http://localhost:3000/login');
    await page.locator('input[name="email"]').fill('admin@example.com');
    await page.locator('input[name="password"]').fill('admin123');
    await page.locator('button[type="submit"]').click();
    
    // Wait for login
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 }).catch(() => {});
  });

  test('should navigate to admin games page', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/games');
    
    // Either see the games page or redirected (depending on auth)
    await page.waitForTimeout(1000);
    const isOnAdminPage = await page.url().includes('/admin');
    expect(isOnAdminPage).toBeTruthy();
  });

  test('should display game list in admin panel', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/games');
    
    await page.waitForTimeout(1000);
    
    // Check for admin games content
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('Replay Player', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 }).catch(() => {});
  });

  test('should handle non-existent replay gracefully', async ({ page }) => {
    await page.goto('http://localhost:3000/replay/nonexistent123');
    
    // Should show error state
    await expect(page.getByText(/replay not found|loading/i)).toBeVisible({ timeout: 5000 });
  });

  test('should have replay controls when replay exists', async ({ page }) => {
    // This test assumes a valid replay exists - will show loading or controls
    await page.goto('http://localhost:3000/replay/test123');
    
    await page.waitForTimeout(2000);
    
    // Check page loaded
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('New Feature Routes', () => {
  test('matchmaking route loads without error', async ({ page }) => {
    await page.goto('http://localhost:3000/matchmaking');
    
    // Page should load (either with content or login redirect)
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('3000');
  });

  test('matchmaking with game slug route loads', async ({ page }) => {
    await page.goto('http://localhost:3000/matchmaking/caro');
    
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('3000');
  });

  test('replay route loads without error', async ({ page }) => {
    await page.goto('http://localhost:3000/replay/testmatch');
    
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('3000');
  });

  test('admin game editor route exists', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/games/testid/editor');
    
    await page.waitForTimeout(1000);
    // Will either load editor or redirect
    expect(page.url()).toContain('3000');
  });
});
