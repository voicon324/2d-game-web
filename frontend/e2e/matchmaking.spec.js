import { test, expect } from '@playwright/test';

test.describe('Matchmaking Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    
    // Wait for redirect or handle login
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 }).catch(() => {});
  });

  test('should navigate to matchmaking page', async ({ page }) => {
    await page.goto('http://localhost:3000/matchmaking');
    
    await expect(page.getByText('Matchmaking')).toBeVisible();
  });

  test('should display game selection dropdown', async ({ page }) => {
    await page.goto('http://localhost:3000/matchmaking');
    
    await expect(page.getByText('Select Game')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
  });

  test('should show Find Match button initially disabled', async ({ page }) => {
    await page.goto('http://localhost:3000/matchmaking');
    
    const button = page.getByRole('button', { name: /find match/i });
    await expect(button).toBeVisible();
    await expect(button).toBeDisabled();
  });

  test('should enable Find Match after selecting a game', async ({ page }) => {
    await page.goto('http://localhost:3000/matchmaking');
    
    // Wait for games to load
    await page.waitForTimeout(1000);
    
    // Select a game
    const select = page.locator('select');
    const options = await select.locator('option').all();
    
    if (options.length > 1) {
      await select.selectOption({ index: 1 });
      
      const button = page.getByRole('button', { name: /find match/i });
      await expect(button).toBeEnabled();
    }
  });

  test('should show searching state after clicking Find Match', async ({ page }) => {
    await page.goto('http://localhost:3000/matchmaking');
    
    await page.waitForTimeout(1000);
    
    const select = page.locator('select');
    const options = await select.locator('option').all();
    
    if (options.length > 1) {
      await select.selectOption({ index: 1 });
      await page.getByRole('button', { name: /find match/i }).click();
      
      await expect(page.getByText(/searching for opponent/i)).toBeVisible({ timeout: 2000 });
      await expect(page.getByText('Cancel')).toBeVisible();
    }
  });

  test('should display how matchmaking works info', async ({ page }) => {
    await page.goto('http://localhost:3000/matchmaking');
    
    await expect(page.getByText('How Matchmaking Works')).toBeVisible();
    await expect(page.getByText(/skill rating/i)).toBeVisible();
  });
});
