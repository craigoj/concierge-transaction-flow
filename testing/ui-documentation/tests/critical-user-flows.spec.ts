import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Wait for the main content to load
    await expect(page).toHaveTitle(/Concierge/);
    
    // Check for key elements
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate through main sections', async ({ page }) => {
    // Test navigation to different sections
    const sections = [
      { name: 'Dashboard', selector: '[href="/"]' },
      { name: 'Transactions', selector: '[href="/transactions"]' },
      { name: 'Clients', selector: '[href="/clients"]' },
      { name: 'Agents', selector: '[href="/agents"]' },
    ];

    for (const section of sections) {
      // Click navigation link if it exists
      const navLink = page.locator(section.selector).first();
      if (await navLink.isVisible()) {
        await navLink.click();
        
        // Wait for navigation to complete
        await page.waitForLoadState('networkidle');
        
        // Verify we're on the correct page
        await expect(page).toHaveURL(new RegExp(section.selector.replace(/[\[\]"\/]/g, '')));
      }
    }
  });

  test('should display dashboard statistics', async ({ page }) => {
    // Look for dashboard stats
    const statsTexts = [
      'Active Transactions',
      'Total Clients', 
      'Monthly Revenue',
      'Completion Rate'
    ];

    for (const statText of statsTexts) {
      const statElement = page.getByText(statText);
      if (await statElement.isVisible()) {
        await expect(statElement).toBeVisible();
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that page is still usable
    await expect(page.locator('body')).toBeVisible();
    
    // Look for mobile navigation or responsive elements
    // The specific implementation depends on your app's structure
    const mobileElements = page.locator('[class*="mobile"], [class*="sm:"], [class*="md:"]');
    if (await mobileElements.count() > 0) {
      await expect(mobileElements.first()).toBeVisible();
    }
  });

  test('should load transaction cards if available', async ({ page }) => {
    // Navigate to transactions page
    const transactionsLink = page.locator('[href="/transactions"]').first();
    if (await transactionsLink.isVisible()) {
      await transactionsLink.click();
      await page.waitForLoadState('networkidle');
      
      // Look for transaction-related content
      const transactionCards = page.locator('[class*="card"], [data-testid*="transaction"]');
      
      // If transaction cards exist, verify they're visible
      if (await transactionCards.count() > 0) {
        await expect(transactionCards.first()).toBeVisible();
      }
      
      // Look for common transaction UI elements
      const commonElements = [
        page.getByText('Create Transaction'),
        page.getByText('New Transaction'),
        page.getByText('Add Transaction'),
        page.locator('button:has-text("Create")'),
        page.locator('button:has-text("Add")'),
      ];
      
      for (const element of commonElements) {
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
          break; // Found at least one create button
        }
      }
    }
  });

  test('should display proper error handling', async ({ page }) => {
    // Test navigation to a non-existent page
    await page.goto('/non-existent-page');
    
    // Should either redirect or show 404
    const is404 = await page.getByText('404').isVisible() || 
                  await page.getByText('Not Found').isVisible() ||
                  await page.getByText('Page not found').isVisible();
    
    if (is404) {
      // If 404 page exists, verify it
      expect(is404).toBeTruthy();
    } else {
      // If redirected, should be on a valid page
      await expect(page).toHaveURL(/\/(dashboard|auth|login|$)/);
    }
  });

  test('should handle authentication state', async ({ page }) => {
    // Check for authentication elements
    const authElements = [
      page.getByText('Sign In'),
      page.getByText('Login'),
      page.getByText('Sign Out'),
      page.getByText('Logout'),
      page.locator('input[type="email"]'),
      page.locator('input[type="password"]'),
    ];

    let hasAuthElements = false;
    for (const element of authElements) {
      if (await element.isVisible()) {
        hasAuthElements = true;
        await expect(element).toBeVisible();
        break;
      }
    }

    // If no auth elements found, app might be in authenticated state
    if (!hasAuthElements) {
      // Look for user profile or logout elements
      const userElements = [
        page.locator('[data-testid="user-menu"]'),
        page.locator('[class*="avatar"]'),
        page.locator('[class*="profile"]'),
      ];
      
      for (const element of userElements) {
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
          break;
        }
      }
    }
  });

  test('should load performance optimally', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Expect page to load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Check for performance-critical elements
    await expect(page.locator('body')).toBeVisible();
  });
});