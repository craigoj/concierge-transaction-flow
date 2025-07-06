/**
 * Visual Regression Tests
 * Automated screenshot testing to detect UI changes
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for consistent screenshots
    await page.route('**/api/**', (route) => {
      route.fulfill({ 
        status: 200, 
        body: JSON.stringify({ data: [], error: null }) 
      });
    });
  });

  test.describe('Dashboard Components', () => {
    test('dashboard homepage layout', async ({ page }) => {
      await page.goto('/');
      
      // Wait for content to load
      await page.waitForSelector('[data-testid="dashboard-stats"]', { timeout: 10000 });
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot('dashboard-homepage.png', {
        fullPage: true,
        threshold: 0.2, // Allow 20% difference for minor rendering changes
      });
    });

    test('dashboard stats component variations', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="dashboard-stats"]');
      
      // Screenshot different states
      const dashboardStats = page.locator('[data-testid="dashboard-stats"]');
      
      // Default state
      await expect(dashboardStats).toHaveScreenshot('dashboard-stats-default.png');
      
      // Mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(dashboardStats).toHaveScreenshot('dashboard-stats-mobile.png');
      
      // Tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(dashboardStats).toHaveScreenshot('dashboard-stats-tablet.png');
    });

    test('transaction cards grid layout', async ({ page }) => {
      await page.goto('/transactions');
      
      await page.waitForSelector('[data-testid="transaction-card"]', { timeout: 10000 });
      
      // Screenshot transaction list
      await expect(page.locator('.transactions-grid')).toHaveScreenshot('transactions-grid.png');
      
      // Individual transaction card
      const firstCard = page.locator('[data-testid="transaction-card"]').first();
      await expect(firstCard).toHaveScreenshot('transaction-card.png');
    });
  });

  test.describe('Form Components', () => {
    test('agent intake form steps', async ({ page }) => {
      await page.goto('/agent-intake');
      
      // Wait for form to load
      await page.waitForSelector('[data-testid="agent-intake-form"]', { timeout: 10000 });
      
      // Step 1: Initial form
      await expect(page).toHaveScreenshot('agent-intake-step1.png');
      
      // Navigate through steps
      const nextButton = page.locator('button', { hasText: 'Next' });
      
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot('agent-intake-step2.png');
        
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(1000);
          await expect(page).toHaveScreenshot('agent-intake-step3.png');
        }
      }
    });

    test('offer drafting form layout', async ({ page }) => {
      await page.goto('/offer-drafting');
      
      await page.waitForSelector('[data-testid="offer-form"]', { timeout: 10000 });
      
      // Full form screenshot
      await expect(page).toHaveScreenshot('offer-drafting-form.png', {
        fullPage: true,
      });
      
      // Form validation states
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(500);
        
        // Screenshot with validation errors
        await expect(page).toHaveScreenshot('offer-form-validation-errors.png');
      }
    });
  });

  test.describe('Navigation Components', () => {
    test('main navigation layouts', async ({ page }) => {
      await page.goto('/');
      
      // Desktop navigation
      await page.waitForSelector('[data-testid="main-navigation"]', { timeout: 10000 });
      const navigation = page.locator('[data-testid="main-navigation"]');
      await expect(navigation).toHaveScreenshot('navigation-desktop.png');
      
      // Mobile navigation
      await page.setViewportSize({ width: 375, height: 667 });
      const mobileNav = page.locator('[data-testid="mobile-navigation"]');
      if (await mobileNav.isVisible()) {
        await expect(mobileNav).toHaveScreenshot('navigation-mobile.png');
      }
      
      // Mobile menu open
      const menuButton = page.locator('[data-testid="mobile-menu-button"]');
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot('navigation-mobile-open.png');
      }
    });

    test('breadcrumb navigation', async ({ page }) => {
      await page.goto('/transactions/123');
      
      const breadcrumb = page.locator('[data-testid="breadcrumb"]');
      if (await breadcrumb.isVisible()) {
        await expect(breadcrumb).toHaveScreenshot('breadcrumb-navigation.png');
      }
    });
  });

  test.describe('Modal and Dialog Components', () => {
    test('create transaction dialog', async ({ page }) => {
      await page.goto('/transactions');
      
      // Open create dialog
      const createButton = page.locator('button', { hasText: 'New Transaction' });
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(1000);
        
        const dialog = page.locator('[data-testid="create-transaction-dialog"]');
        if (await dialog.isVisible()) {
          await expect(dialog).toHaveScreenshot('create-transaction-dialog.png');
        }
      }
    });

    test('edit transaction dialog', async ({ page }) => {
      await page.goto('/transactions');
      
      // Open edit dialog (simulate clicking on a transaction)
      const editButton = page.locator('button[aria-label="Edit transaction"]').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForTimeout(1000);
        
        const dialog = page.locator('[data-testid="edit-transaction-dialog"]');
        if (await dialog.isVisible()) {
          await expect(dialog).toHaveScreenshot('edit-transaction-dialog.png');
        }
      }
    });

    test('confirmation dialogs', async ({ page }) => {
      await page.goto('/transactions');
      
      // Open delete confirmation
      const deleteButton = page.locator('button[aria-label="Delete transaction"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.waitForTimeout(500);
        
        const confirmDialog = page.locator('[data-testid="confirm-dialog"]');
        if (await confirmDialog.isVisible()) {
          await expect(confirmDialog).toHaveScreenshot('delete-confirmation-dialog.png');
        }
      }
    });
  });

  test.describe('Service Tier Variations', () => {
    test('core tier interface', async ({ page }) => {
      // Mock user with core tier
      await page.addInitScript(() => {
        window.localStorage.setItem('user-tier', 'core');
      });
      
      await page.goto('/');
      await page.waitForSelector('[data-testid="dashboard-stats"]');
      
      await expect(page).toHaveScreenshot('core-tier-dashboard.png');
    });

    test('elite tier interface', async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem('user-tier', 'elite');
      });
      
      await page.goto('/');
      await page.waitForSelector('[data-testid="dashboard-stats"]');
      
      await expect(page).toHaveScreenshot('elite-tier-dashboard.png');
    });

    test('white glove tier interface', async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem('user-tier', 'white_glove');
      });
      
      await page.goto('/');
      await page.waitForSelector('[data-testid="dashboard-stats"]');
      
      await expect(page).toHaveScreenshot('white-glove-tier-dashboard.png');
    });
  });

  test.describe('Responsive Design Verification', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'large-desktop', width: 1920, height: 1080 },
    ];

    viewports.forEach(({ name, width, height }) => {
      test(`dashboard layout - ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');
        
        await page.waitForSelector('[data-testid="dashboard-stats"]');
        
        await expect(page).toHaveScreenshot(`dashboard-${name}.png`, {
          fullPage: true,
        });
      });

      test(`transactions page - ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/transactions');
        
        await page.waitForSelector('[data-testid="transaction-list"]', { timeout: 10000 });
        
        await expect(page).toHaveScreenshot(`transactions-${name}.png`, {
          fullPage: true,
        });
      });
    });
  });

  test.describe('Dark Mode Support', () => {
    test('dashboard in dark mode', async ({ page }) => {
      // Enable dark mode
      await page.addInitScript(() => {
        document.documentElement.classList.add('dark');
        window.localStorage.setItem('theme', 'dark');
      });
      
      await page.goto('/');
      await page.waitForSelector('[data-testid="dashboard-stats"]');
      
      await expect(page).toHaveScreenshot('dashboard-dark-mode.png', {
        fullPage: true,
      });
    });

    test('forms in dark mode', async ({ page }) => {
      await page.addInitScript(() => {
        document.documentElement.classList.add('dark');
        window.localStorage.setItem('theme', 'dark');
      });
      
      await page.goto('/agent-intake');
      await page.waitForSelector('[data-testid="agent-intake-form"]');
      
      await expect(page).toHaveScreenshot('agent-intake-dark-mode.png');
    });
  });

  test.describe('Loading and Error States', () => {
    test('loading states', async ({ page }) => {
      // Intercept API calls to delay response
      await page.route('**/api/**', async (route) => {
        await page.waitForTimeout(2000);
        route.fulfill({ 
          status: 200, 
          body: JSON.stringify({ data: [], error: null }) 
        });
      });
      
      await page.goto('/');
      
      // Screenshot loading state
      await expect(page.locator('[data-testid="loading-spinner"]')).toHaveScreenshot('loading-state.png');
    });

    test('error states', async ({ page }) => {
      // Mock API error
      await page.route('**/api/**', (route) => {
        route.fulfill({ 
          status: 500, 
          body: JSON.stringify({ error: 'Internal server error' }) 
        });
      });
      
      await page.goto('/transactions');
      
      // Wait for error state
      await page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 });
      
      await expect(page).toHaveScreenshot('error-state.png');
    });

    test('empty states', async ({ page }) => {
      // Mock empty data response
      await page.route('**/api/**', (route) => {
        route.fulfill({ 
          status: 200, 
          body: JSON.stringify({ data: [], error: null }) 
        });
      });
      
      await page.goto('/transactions');
      
      await page.waitForSelector('[data-testid="empty-state"]', { timeout: 10000 });
      
      await expect(page).toHaveScreenshot('empty-state.png');
    });
  });

  test.describe('Animation and Transition States', () => {
    test('hover states on interactive elements', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="transaction-card"]');
      
      const card = page.locator('[data-testid="transaction-card"]').first();
      
      // Normal state
      await expect(card).toHaveScreenshot('card-normal.png');
      
      // Hover state
      await card.hover();
      await page.waitForTimeout(500);
      await expect(card).toHaveScreenshot('card-hover.png');
      
      // Focus state
      await card.focus();
      await page.waitForTimeout(500);
      await expect(card).toHaveScreenshot('card-focus.png');
    });

    test('button states', async ({ page }) => {
      await page.goto('/transactions');
      
      const button = page.locator('button', { hasText: 'New Transaction' });
      
      if (await button.isVisible()) {
        // Normal button
        await expect(button).toHaveScreenshot('button-normal.png');
        
        // Hover button
        await button.hover();
        await page.waitForTimeout(300);
        await expect(button).toHaveScreenshot('button-hover.png');
        
        // Active/pressed button
        await button.click({ force: true });
        await expect(button).toHaveScreenshot('button-active.png');
      }
    });

    test('form input states', async ({ page }) => {
      await page.goto('/agent-intake');
      
      const input = page.locator('input[type="text"]').first();
      
      if (await input.isVisible()) {
        // Empty input
        await expect(input).toHaveScreenshot('input-empty.png');
        
        // Focused input
        await input.focus();
        await page.waitForTimeout(300);
        await expect(input).toHaveScreenshot('input-focused.png');
        
        // Filled input
        await input.fill('Test Value');
        await expect(input).toHaveScreenshot('input-filled.png');
        
        // Invalid input (if validation exists)
        await input.fill('');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(500);
        await expect(input).toHaveScreenshot('input-invalid.png');
      }
    });
  });

  test.describe('Component Variations', () => {
    test('badge component variations', async ({ page }) => {
      await page.goto('/transactions');
      
      // Find different badge types
      const badges = page.locator('[data-testid="status-badge"]');
      const count = await badges.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const badge = badges.nth(i);
        await expect(badge).toHaveScreenshot(`badge-variant-${i}.png`);
      }
    });

    test('card component layouts', async ({ page }) => {
      await page.goto('/');
      
      // Different card types on dashboard
      const cards = page.locator('[data-testid="metric-card"]');
      const count = await cards.count();
      
      for (let i = 0; i < Math.min(count, 4); i++) {
        const card = cards.nth(i);
        await expect(card).toHaveScreenshot(`metric-card-${i}.png`);
      }
    });
  });
});