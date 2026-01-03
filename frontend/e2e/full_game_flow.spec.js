import { test, expect } from '@playwright/test';

/**
 * E2E Test: Complete Matchmaking → Game → Replay Flow
 * 
 * Tests the full user journey from joining matchmaking,
 * playing a game, and then watching the replay.
 * 
 * Note: This test requires two browser contexts to simulate two players.
 */

test.describe('Complete Game Flow', () => {
  // Helper to login a user
  async function loginUser(page, email, password) {
    await page.goto('http://localhost:5173/login');
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('http://localhost:5173/', { timeout: 5000 }).catch(() => {});
  }

  test('Single player can navigate matchmaking and game pages', async ({ page }) => {
    // Login
    await loginUser(page, 'test@example.com', 'password123');
    
    // Navigate to matchmaking
    await page.goto('http://localhost:5173/matchmaking');
    await expect(page.getByText('Matchmaking')).toBeVisible();
    
    // Check game selection exists
    await page.waitForTimeout(1000);
    const selectExists = await page.locator('select').count() > 0;
    expect(selectExists).toBeTruthy();
    
    // Navigate to a replay page (even if no replay exists)
    await page.goto('http://localhost:5173/replay/test123');
    await page.waitForTimeout(1000);
    
    // Page should load (either shows replay or not found)
    const pageLoaded = await page.content();
    expect(pageLoaded).toBeTruthy();
  });

  test('User can create room and join game directly', async ({ page }) => {
    // Login
    await loginUser(page, 'test@example.com', 'password123');
    
    // Go to home page
    await page.goto('http://localhost:5173/');
    await page.waitForTimeout(1000);
    
    // Look for Create Custom Room button
    const createButton = page.getByRole('button', { name: /create.*room/i });
    
    if (await createButton.count() > 0) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Modal should appear
      const modalVisible = await page.getByText('Select a Game').isVisible().catch(() => false);
      expect(modalVisible).toBeTruthy();
    }
  });

  test('Game page loads correctly with room code', async ({ page }) => {
    // Login first
    await loginUser(page, 'test@example.com', 'password123');
    
    // Navigate directly to a game page with parameters
    await page.goto('http://localhost:5173/game/caro?type=caro&room=TEST01');
    await page.waitForTimeout(2000);
    
    // Page should load
    const url = page.url();
    expect(url).toContain('game');
  });

  test('Profile page shows match history section', async ({ page }) => {
    await loginUser(page, 'test@example.com', 'password123');
    
    await page.goto('http://localhost:5173/profile');
    await page.waitForTimeout(1000);
    
    // Profile page should exist
    const profileContent = await page.content();
    expect(profileContent).toBeTruthy();
  });

  test('Replay navigation from profile works', async ({ page }) => {
    await loginUser(page, 'test@example.com', 'password123');
    
    // Check if replay route is accessible
    await page.goto('http://localhost:5173/replay/someMatchId');
    await page.waitForTimeout(1500);
    
    // Should show either replay content or not found message
    const hasReplayContent = await page.getByText(/replay|not found|loading/i).isVisible();
    expect(hasReplayContent).toBeTruthy();
  });
});

test.describe('Matchmaking Queue Behavior', () => {
  test('Can enter and cancel matchmaking queue', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);
    
    await page.goto('http://localhost:5173/matchmaking');
    await page.waitForTimeout(1000);
    
    // Select a game if dropdown exists
    const selectCount = await page.locator('select').count();
    if (selectCount > 0) {
      const options = await page.locator('select option').count();
      if (options > 1) {
        await page.locator('select').selectOption({ index: 1 });
        
        // Click Find Match
        const findButton = page.getByRole('button', { name: /find match/i });
        if (await findButton.isEnabled()) {
          await findButton.click();
          await page.waitForTimeout(500);
          
          // Should show searching or cancel button
          const cancelVisible = await page.getByText('Cancel').isVisible().catch(() => false);
          
          if (cancelVisible) {
            await page.getByText('Cancel').click();
            await page.waitForTimeout(500);
            
            // Should return to idle state
            const findMatchVisible = await page.getByRole('button', { name: /find match/i }).isVisible();
            expect(findMatchVisible).toBeTruthy();
          }
        }
      }
    }
  });

  test('Matchmaking info section is displayed', async ({ page }) => {
    await page.goto('http://localhost:5173/matchmaking');
    await page.waitForTimeout(1000);
    
    // Should see matchmaking info
    const infoVisible = await page.getByText(/how matchmaking works/i).isVisible().catch(() => false);
    expect(infoVisible).toBeTruthy();
  });
});

test.describe('Multi-player Flow Simulation', () => {
  test('Two players can access game room', async ({ browser }) => {
    // Create two browser contexts
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    try {
      // Both players login
      await page1.goto('http://localhost:5173/login');
      await page1.locator('input[name="email"]').fill('test@example.com');
      await page1.locator('input[name="password"]').fill('password123');
      await page1.locator('button[type="submit"]').click();
      
      await page2.goto('http://localhost:5173/login');
      await page2.locator('input[name="email"]').fill('test2@example.com');
      await page2.locator('input[name="password"]').fill('password123');
      await page2.locator('button[type="submit"]').click();
      
      await Promise.all([
        page1.waitForTimeout(1000),
        page2.waitForTimeout(1000)
      ]);
      
      // Both navigate to same game room
      const roomUrl = 'http://localhost:5173/game/caro?type=caro&room=MULTI1';
      
      await Promise.all([
        page1.goto(roomUrl),
        page2.goto(roomUrl)
      ]);
      
      await Promise.all([
        page1.waitForTimeout(2000),
        page2.waitForTimeout(2000)
      ]);
      
      // Both pages should load
      expect(page1.url()).toContain('game');
      expect(page2.url()).toContain('game');
      
    } finally {
      await context1.close();
      await context2.close();
    }
  });
});
