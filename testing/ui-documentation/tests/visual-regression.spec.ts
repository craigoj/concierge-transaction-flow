import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for any loading states to complete
    await page.waitForLoadState('networkidle');
  });

  test('homepage visual comparison - desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Wait for page to fully load
    await page.waitForTimeout(2000);
    
    // Take screenshot and compare
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('homepage visual comparison - tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Wait for responsive changes
    await page.waitForTimeout(1000);
    
    // Take screenshot and compare
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('homepage visual comparison - mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for responsive changes
    await page.waitForTimeout(1000);
    
    // Take screenshot and compare
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('dashboard stats visual comparison', async ({ page }) => {
    // Look for dashboard stats section
    const statsSection = page.locator('[class*="grid"], [class*="stats"]').first();
    
    if (await statsSection.isVisible()) {
      await expect(statsSection).toHaveScreenshot('dashboard-stats.png', {
        threshold: 0.1,
      });
    }
  });

  test('navigation visual comparison', async ({ page }) => {
    // Find navigation elements
    const navigation = page.locator('nav, [role="navigation"], [class*="nav"]').first();
    
    if (await navigation.isVisible()) {
      await expect(navigation).toHaveScreenshot('navigation.png', {
        threshold: 0.1,
      });
    }
  });

  test('transaction cards visual comparison', async ({ page }) => {
    // Navigate to transactions if link exists
    const transactionsLink = page.locator('[href="/transactions"]').first();
    if (await transactionsLink.isVisible()) {
      await transactionsLink.click();
      await page.waitForLoadState('networkidle');
      
      // Look for transaction cards
      const transactionCards = page.locator('[class*="card"]').first();
      
      if (await transactionCards.isVisible()) {
        await expect(transactionCards).toHaveScreenshot('transaction-card.png', {
          threshold: 0.1,
        });
      }
    }
  });

  test('color scheme consistency', async ({ page }) => {
    // Test light mode
    await page.screenshot({ 
      path: 'test-results/color-scheme-light.png',
      fullPage: true 
    });
    
    // Try to toggle to dark mode if available
    const darkModeToggle = page.locator('[class*="dark"], [data-theme="dark"], button:has-text("Dark")').first();
    
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'test-results/color-scheme-dark.png',
        fullPage: true 
      });
    }
  });

  test('form elements visual comparison', async ({ page }) => {
    // Look for forms on the page
    const forms = page.locator('form, [class*="form"]');
    
    if (await forms.count() > 0) {
      const firstForm = forms.first();
      if (await firstForm.isVisible()) {
        await expect(firstForm).toHaveScreenshot('form-elements.png', {
          threshold: 0.1,
        });
      }
    }
    
    // Look for common form inputs
    const inputs = page.locator('input, select, textarea, button');
    if (await inputs.count() > 0) {
      const inputSection = page.locator('div:has(input), div:has(button)').first();
      if (await inputSection.isVisible()) {
        await expect(inputSection).toHaveScreenshot('input-elements.png', {
          threshold: 0.1,
        });
      }
    }
  });

  test('responsive breakpoints visual comparison', async ({ page }) => {
    const breakpoints = [
      { name: 'sm', width: 640, height: 480 },
      { name: 'md', width: 768, height: 576 },
      { name: 'lg', width: 1024, height: 768 },
      { name: 'xl', width: 1280, height: 800 },
    ];
    
    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot(`responsive-${breakpoint.name}.png`, {
        fullPage: false,
        threshold: 0.2,
      });
    }
  });
});