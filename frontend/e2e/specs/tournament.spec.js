import { test, expect } from '@playwright/test';

test.describe('Tournaments', () => {

    test('Tournament List is visible', async ({ page }) => {
        await page.goto('/tournaments');
        
        // Verify Title
        await expect(page.getByRole('heading', { name: /Tournaments/i })).toBeVisible();

        // Verify content (List OR Empty Message)
        const tournamentList = page.locator('.grid'); 
        const emptyMsg = page.getByText(/No tournaments found/i);
        
        // Wait for either
        await expect(tournamentList.or(emptyMsg).first()).toBeVisible();
    });

});
