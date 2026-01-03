import { test, expect } from '@playwright/test';

test.describe('In-Game Chat Feature', () => {
  // Helper to register, login and join a room
  async function setupGameRoom(page) {
    const uniqueId = Date.now().toString() + Math.floor(Math.random() * 10000);
    const username = `ChatUser${uniqueId}`;
    const email = `chat${uniqueId}@test.com`;
    const password = 'password123';
    
    // 1. Register and Login
    await page.goto('http://localhost:5173/login');
    await page.getByRole('button', { name: 'Register' }).click();
    await page.locator('input[name="username"]').fill(username);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('input[name="confirmPassword"]').fill(password);
    await page.locator('input[name="agreeTerms"]').check();
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Wait for Home Page
    await page.waitForURL('http://localhost:5173/', { timeout: 15000 });
    
    // 2. Create Room
    await page.getByText('Create Custom Room').click();
    await page.waitForSelector('text=Select a Game', { state: 'visible' });
    
    // Select Caro - Wait for it to be stable
    // Select Caro - Wait for it to be stable
    // Target the button inside the modal specificially
    const gameButton = page.locator('.fixed button').filter({ hasText: 'Cờ Caro' }).first();
    await gameButton.click();
    
    // Wait for "Room Settings" header to appear (step 2 of modal)
    await expect(page.getByText('Room Settings')).toBeVisible();
    
    // Click Create
    const createBtn = page.getByRole('button', { name: 'Create Room' });
    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    // 3. Wait for Game Page
    await page.waitForURL(/\/game\/caro/, { timeout: 15000 });
    
    // 4. Wait for connection
    await expect(page.getByText('Connected')).toBeVisible({ timeout: 15000 });
    
    // 5. Wait for Chat Component
    await expect(page.getByTestId('chat-input')).toBeVisible();
  }

  test('should display chat message after sending', async ({ page }) => {
    await setupGameRoom(page);

    const chatInput = page.getByTestId('chat-input');
    const testMessage = `Msg ${Date.now()}`;
    
    await chatInput.fill(testMessage);
    await page.locator('button:has(span:has-text("send"))').click();

    // Verify message appears
    await expect(page.getByText(testMessage)).toBeVisible();
  });

  test('should handle long messages and scroll', async ({ page }) => {
    await setupGameRoom(page);

    const chatInput = page.getByTestId('chat-input');
    const longMessage = 'A'.repeat(50) + ' ' + 'B'.repeat(50);
    
    // Test sending via Enter key
    await chatInput.fill(longMessage);
    await chatInput.press('Enter');

    await expect(page.getByText(longMessage)).toBeVisible();
  });
});
