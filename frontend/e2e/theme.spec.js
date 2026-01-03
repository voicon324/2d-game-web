import { test, expect } from '@playwright/test';

test.describe('Theme Switching and Persistence', () => {
    test.beforeEach(async ({ page }) => {
        // Start from home page
        await page.goto('/');
    });

    test('should switch between light and dark mode', async ({ page }) => {
        const html = page.locator('html');
        const themeToggle = page.getByLabel('Toggle Dark Mode');

        // Initial state should be light (or based on system)
        const initialClass = await html.getAttribute('class') || '';
        const isInitialDark = initialClass.includes('dark');

        await themeToggle.click();
        
        if (isInitialDark) {
            await expect(html).not.toHaveClass(/dark/);
            // Wait for transition to complete
            // Light background: #f8fafc (rgb(248, 250, 252))
            await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 250, 252)', { timeout: 3000 });
        } else {
            await expect(html).toHaveClass(/dark/);
            // Wait for transition to complete
            // Dark background: #0f172a (rgb(15, 23, 42))
            await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(15, 23, 42)', { timeout: 3000 });
        }
    });

    test('should persist theme across page navigation', async ({ page }) => {
        const themeToggle = page.getByLabel('Toggle Dark Mode');
        const html = page.locator('html');

        // Ensure we are in dark mode
        const initialClass = await html.getAttribute('class') || '';
        if (!initialClass.includes('dark')) {
            await themeToggle.click();
        }
        await expect(html).toHaveClass(/dark/);
        await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(15, 23, 42)', { timeout: 3000 });

        // Navigate to Login page
        await page.goto('/login');
        
        // Should still be in dark mode
        await expect(html).toHaveClass(/dark/);
        await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(15, 23, 42)', { timeout: 3000 });
    });

    test('should persist theme after page reload', async ({ page }) => {
        const themeToggle = page.getByLabel('Toggle Dark Mode');
        const html = page.locator('html');

        // Ensure we are in dark mode
        const initialClass = await html.getAttribute('class') || '';
        if (!initialClass.includes('dark')) {
            await themeToggle.click();
        }
        await expect(html).toHaveClass(/dark/);
        await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(15, 23, 42)', { timeout: 3000 });

        // Reload page
        await page.reload();
        
        // Should still be in dark mode
        await expect(html).toHaveClass(/dark/);
        await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(15, 23, 42)', { timeout: 3000 });
    });
});
