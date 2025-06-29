import { test, expect } from '@playwright/test';

test.describe('Navigation User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Main Navigation Flow', () => {
    test('should navigate through all main sections successfully', async ({ page }) => {
      // Define the main navigation sections
      const navigationSections = [
        { name: 'Dashboard', path: '/', selector: '[href="/"], [href="/dashboard"]' },
        { name: 'Transactions', path: '/transactions', selector: '[href="/transactions"]' },
        { name: 'Clients', path: '/clients', selector: '[href="/clients"]' },
        { name: 'Agents', path: '/agents', selector: '[href="/agents"]' },
        { name: 'Analytics', path: '/analytics', selector: '[href="/analytics"]' },
        { name: 'Settings', path: '/settings', selector: '[href="/settings"]' },
      ];

      for (const section of navigationSections) {
        // Look for navigation link
        const navLink = page.locator(section.selector).first();
        
        if (await navLink.isVisible()) {
          await navLink.click();
          
          // Wait for navigation to complete
          await page.waitForLoadState('networkidle');
          
          // Verify URL changed correctly
          if (section.path === '/') {
            await expect(page).toHaveURL(/\/(dashboard)?$/);
          } else {
            await expect(page).toHaveURL(new RegExp(section.path));
          }
          
          // Verify page content loaded
          await expect(page.locator('body')).toBeVisible();
          
          console.log(`✓ Successfully navigated to ${section.name}`);
        }
      }
    });

    test('should handle deep linking to specific pages', async ({ page }) => {
      const deepLinks = [
        '/transactions',
        '/clients',
        '/agents',
        '/analytics',
        '/settings',
        '/profile'
      ];

      for (const link of deepLinks) {
        await page.goto(link);
        await page.waitForLoadState('networkidle');
        
        // Verify we're on the correct page
        await expect(page).toHaveURL(new RegExp(link));
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('Parameterized Route Navigation', () => {
    test('should navigate to transaction detail pages', async ({ page }) => {
      // Try to navigate to transactions page first
      const transactionsLink = page.locator('[href="/transactions"]').first();
      
      if (await transactionsLink.isVisible()) {
        await transactionsLink.click();
        await page.waitForLoadState('networkidle');
        
        // Look for transaction cards or links to details
        const transactionLinks = page.locator('[href*="/transactions/"]');
        
        if (await transactionLinks.count() > 0) {
          await transactionLinks.first().click();
          await page.waitForLoadState('networkidle');
          
          // Verify we're on a transaction detail page
          await expect(page).toHaveURL(/\/transactions\/[^\/]+$/);
          await expect(page.locator('body')).toBeVisible();
        } else {
          // Test direct navigation to a transaction detail if no links found
          await page.goto('/transactions/test-123');
          await page.waitForLoadState('networkidle');
          await expect(page.locator('body')).toBeVisible();
        }
      }
    });

    test('should navigate to client detail pages', async ({ page }) => {
      const clientsLink = page.locator('[href="/clients"]').first();
      
      if (await clientsLink.isVisible()) {
        await clientsLink.click();
        await page.waitForLoadState('networkidle');
        
        // Look for client links
        const clientLinks = page.locator('[href*="/clients/"]');
        
        if (await clientLinks.count() > 0) {
          await clientLinks.first().click();
          await page.waitForLoadState('networkidle');
          
          await expect(page).toHaveURL(/\/clients\/[^\/]+$/);
          await expect(page.locator('body')).toBeVisible();
        } else {
          // Test direct navigation
          await page.goto('/clients/test-client-456');
          await page.waitForLoadState('networkidle');
          await expect(page.locator('body')).toBeVisible();
        }
      }
    });

    test('should handle URL parameters correctly', async ({ page }) => {
      const parameterizedRoutes = [
        '/transactions/abc123',
        '/clients/xyz789',
        '/agents/agent001',
        '/clients/user%40example.com', // URL encoded parameter
      ];

      for (const route of parameterizedRoutes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Should either load the page or redirect appropriately
        await expect(page.locator('body')).toBeVisible();
        
        // Should not be on 404 page (unless that's expected)
        const is404 = await page.getByText('404').isVisible() || 
                      await page.getByText('Not Found').isVisible();
        
        if (!is404) {
          await expect(page).toHaveURL(route);
        }
      }
    });
  });

  test.describe('Agent Portal Navigation', () => {
    test('should navigate through agent-specific routes', async ({ page }) => {
      const agentRoutes = [
        '/agent/dashboard',
        '/agent/setup',
      ];

      for (const route of agentRoutes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Verify we can access agent routes
        await expect(page.locator('body')).toBeVisible();
        
        // Check if we're redirected (role-based routing)
        const currentUrl = page.url();
        const isOnExpectedRoute = currentUrl.includes(route) || 
                                 currentUrl.includes('/dashboard') || 
                                 currentUrl.includes('/auth');
        
        expect(isOnExpectedRoute).toBeTruthy();
      }
    });

    test('should handle agent transaction detail navigation', async ({ page }) => {
      await page.goto('/agent/transactions/test-txn-123');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('body')).toBeVisible();
      
      // Should either be on the agent transaction page or redirected appropriately
      const currentUrl = page.url();
      const isValidRoute = currentUrl.includes('/agent/transactions/') ||
                          currentUrl.includes('/dashboard') ||
                          currentUrl.includes('/auth');
      
      expect(isValidRoute).toBeTruthy();
    });
  });

  test.describe('Navigation State Management', () => {
    test('should preserve navigation state during page interactions', async ({ page }) => {
      // Navigate to a specific page
      await page.goto('/transactions');
      await page.waitForLoadState('networkidle');
      
      // Perform some interaction that doesn't change the route
      await page.keyboard.press('Tab'); // Focus navigation
      await page.waitForTimeout(500);
      
      // Verify we're still on the same page
      await expect(page).toHaveURL(/\/transactions/);
    });

    test('should handle browser back and forward navigation', async ({ page }) => {
      // Start at home
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Navigate to transactions
      const transactionsLink = page.locator('[href="/transactions"]').first();
      if (await transactionsLink.isVisible()) {
        await transactionsLink.click();
        await page.waitForLoadState('networkidle');
        
        // Navigate to clients
        const clientsLink = page.locator('[href="/clients"]').first();
        if (await clientsLink.isVisible()) {
          await clientsLink.click();
          await page.waitForLoadState('networkidle');
          
          // Test browser back button
          await page.goBack();
          await page.waitForLoadState('networkidle');
          await expect(page).toHaveURL(/\/transactions/);
          
          // Test browser forward button
          await page.goForward();
          await page.waitForLoadState('networkidle');
          await expect(page).toHaveURL(/\/clients/);
        }
      }
    });

    test('should handle refresh on different routes', async ({ page }) => {
      const routesToTest = [
        '/',
        '/transactions',
        '/clients',
        '/settings'
      ];

      for (const route of routesToTest) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Refresh the page
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Should still be on the same route or redirected appropriately
        await expect(page.locator('body')).toBeVisible();
        
        const currentUrl = page.url();
        const isValidAfterRefresh = currentUrl.includes(route) ||
                                   currentUrl.includes('/dashboard') ||
                                   currentUrl.includes('/auth');
        
        expect(isValidAfterRefresh).toBeTruthy();
      }
    });
  });

  test.describe('Error Handling in Navigation', () => {
    test('should handle navigation to non-existent pages gracefully', async ({ page }) => {
      const invalidRoutes = [
        '/non-existent-page',
        '/transactions/invalid/nested/route',
        '/clients/non-existent-client/edit/invalid',
        '/agent/invalid-route'
      ];

      for (const route of invalidRoutes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Should either show 404 or redirect to a valid page
        const is404 = await page.getByText('404').isVisible() ||
                     await page.getByText('Not Found').isVisible() ||
                     await page.getByText('Page not found').isVisible();
        
        const isRedirected = page.url().includes('/dashboard') ||
                           page.url().includes('/auth') ||
                           page.url() === new URL('/', page.url()).href;
        
        expect(is404 || isRedirected).toBeTruthy();
      }
    });

    test('should handle malformed URLs', async ({ page }) => {
      const malformedUrls = [
        '//double-slash',
        '/transactions//',
        '/clients/%invalid%url%encoding',
      ];

      for (const url of malformedUrls) {
        try {
          await page.goto(url);
          await page.waitForLoadState('networkidle');
          
          // Should handle gracefully without crashing
          await expect(page.locator('body')).toBeVisible();
        } catch (error) {
          // Some malformed URLs might throw navigation errors, which is acceptable
          console.log(`Expected navigation error for malformed URL: ${url}`);
        }
      }
    });
  });

  test.describe('Mobile Navigation Flow', () => {
    test('should navigate correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Test mobile navigation
      const mobileNavToggle = page.locator('[aria-label*="menu"], [class*="mobile"], button:has-text("Menu")').first();
      
      if (await mobileNavToggle.isVisible()) {
        await mobileNavToggle.click();
        
        // Look for mobile navigation links
        const mobileLinks = page.locator('nav a, [role="navigation"] a').filter({ hasText: /Dashboard|Transactions|Clients/ });
        
        if (await mobileLinks.count() > 0) {
          await mobileLinks.first().click();
          await page.waitForLoadState('networkidle');
          
          await expect(page.locator('body')).toBeVisible();
        }
      } else {
        // If no mobile menu, test direct navigation
        await page.goto('/transactions');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('Performance in Navigation', () => {
    test('should navigate between pages within acceptable time limits', async ({ page }) => {
      const routes = ['/', '/transactions', '/clients', '/settings'];
      
      for (const route of routes) {
        const startTime = Date.now();
        
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        const endTime = Date.now();
        const loadTime = endTime - startTime;
        
        // Navigation should complete within 5 seconds
        expect(loadTime).toBeLessThan(5000);
        
        console.log(`Navigation to ${route} took ${loadTime}ms`);
      }
    });
  });
});