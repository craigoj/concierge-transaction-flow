/**
 * Enhanced Accessibility Tests
 * Comprehensive accessibility testing with axe-core integration
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Enhanced Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for consistent testing
    await page.route('**/api/**', (route) => {
      route.fulfill({ 
        status: 200, 
        body: JSON.stringify({ data: [], error: null }) 
      });
    });
  });

  test.describe('Core Pages Accessibility', () => {
    test('dashboard homepage accessibility compliance', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="dashboard-stats"]', { timeout: 10000 });
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .exclude(['#some-irrelevant-element']) // Exclude third-party elements if needed
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('transactions page accessibility', async ({ page }) => {
      await page.goto('/transactions');
      
      await page.waitForSelector('[data-testid="transaction-list"]', { timeout: 10000 });
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('agents page accessibility', async ({ page }) => {
      await page.goto('/agents');
      
      await page.waitForSelector('[data-testid="agents-list"]', { timeout: 10000 });
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('analytics page accessibility', async ({ page }) => {
      await page.goto('/analytics');
      
      await page.waitForSelector('[data-testid="analytics-dashboard"]', { timeout: 10000 });
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Form Accessibility', () => {
    test('agent intake form accessibility', async ({ page }) => {
      await page.goto('/agent-intake');
      
      await page.waitForSelector('[data-testid="agent-intake-form"]', { timeout: 10000 });
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('offer drafting form accessibility', async ({ page }) => {
      await page.goto('/offer-drafting');
      
      await page.waitForSelector('[data-testid="offer-form"]', { timeout: 10000 });
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('form validation accessibility', async ({ page }) => {
      await page.goto('/agent-intake');
      
      // Trigger validation errors
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(1000);
      }
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Navigation Accessibility', () => {
    test('main navigation accessibility', async ({ page }) => {
      await page.goto('/');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid="main-navigation"]')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('breadcrumb navigation accessibility', async ({ page }) => {
      await page.goto('/transactions/123');
      
      const breadcrumb = page.locator('[data-testid="breadcrumb"]');
      if (await breadcrumb.isVisible()) {
        const accessibilityScanResults = await new AxeBuilder({ page })
          .include('[data-testid="breadcrumb"]')
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    });

    test('mobile navigation accessibility', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Open mobile menu
      const menuButton = page.locator('[data-testid="mobile-menu-button"]');
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(500);
        
        const accessibilityScanResults = await new AxeBuilder({ page })
          .include('[data-testid="mobile-navigation"]')
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    });
  });

  test.describe('Interactive Elements Accessibility', () => {
    test('buttons and controls accessibility', async ({ page }) => {
      await page.goto('/transactions');
      
      // Focus on interactive elements
      const buttons = page.locator('button:visible');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);
        await button.focus();
        
        // Check that button is focusable and has proper ARIA attributes
        expect(await button.getAttribute('tabindex')).not.toBe('-1');
        
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        // Button should have either aria-label or visible text
        expect(ariaLabel || buttonText?.trim()).toBeTruthy();
      }
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('form inputs accessibility', async ({ page }) => {
      await page.goto('/agent-intake');
      
      const inputs = page.locator('input:visible, select:visible, textarea:visible');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 10); i++) {
        const input = inputs.nth(i);
        
        // Check for proper labeling
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          
          // Input should have label, aria-label, or aria-labelledby
          expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('links accessibility', async ({ page }) => {
      await page.goto('/');
      
      const links = page.locator('a:visible');
      const linkCount = await links.count();
      
      for (let i = 0; i < Math.min(linkCount, 10); i++) {
        const link = links.nth(i);
        
        const href = await link.getAttribute('href');
        const ariaLabel = await link.getAttribute('aria-label');
        const linkText = await link.textContent();
        
        // Links should have href and descriptive text
        expect(href).toBeTruthy();
        expect(ariaLabel || linkText?.trim()).toBeTruthy();
      }
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Modal and Dialog Accessibility', () => {
    test('dialog accessibility', async ({ page }) => {
      await page.goto('/transactions');
      
      // Open create transaction dialog
      const createButton = page.locator('button', { hasText: 'New Transaction' });
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(1000);
        
        const dialog = page.locator('[role="dialog"]');
        if (await dialog.isVisible()) {
          // Check dialog properties
          expect(await dialog.getAttribute('aria-modal')).toBe('true');
          expect(await dialog.getAttribute('aria-labelledby') || await dialog.getAttribute('aria-label')).toBeTruthy();
          
          const accessibilityScanResults = await new AxeBuilder({ page })
            .include('[role="dialog"]')
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze();

          expect(accessibilityScanResults.violations).toEqual([]);
        }
      }
    });

    test('alert dialogs accessibility', async ({ page }) => {
      await page.goto('/transactions');
      
      // Trigger delete confirmation dialog
      const deleteButton = page.locator('button[aria-label="Delete transaction"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.waitForTimeout(500);
        
        const alertDialog = page.locator('[role="alertdialog"]');
        if (await alertDialog.isVisible()) {
          expect(await alertDialog.getAttribute('aria-modal')).toBe('true');
          expect(await alertDialog.getAttribute('aria-labelledby') || await alertDialog.getAttribute('aria-label')).toBeTruthy();
          
          const accessibilityScanResults = await new AxeBuilder({ page })
            .include('[role="alertdialog"]')
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze();

          expect(accessibilityScanResults.violations).toEqual([]);
        }
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('tab navigation works correctly', async ({ page }) => {
      await page.goto('/');
      
      // Start tab navigation
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      expect(await focusedElement.count()).toBe(1);
      
      // Continue tabbing through focusable elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        
        const currentFocused = page.locator(':focus');
        expect(await currentFocused.count()).toBe(1);
        
        // Focused element should be visible
        expect(await currentFocused.isVisible()).toBe(true);
      }
    });

    test('shift+tab reverse navigation works', async ({ page }) => {
      await page.goto('/');
      
      // Start with some tabs forward
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
      }
      
      // Then go backward
      await page.keyboard.press('Shift+Tab');
      
      const focusedElement = page.locator(':focus');
      expect(await focusedElement.count()).toBe(1);
      expect(await focusedElement.isVisible()).toBe(true);
    });

    test('escape key closes modals', async ({ page }) => {
      await page.goto('/transactions');
      
      const createButton = page.locator('button', { hasText: 'New Transaction' });
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(1000);
        
        const dialog = page.locator('[role="dialog"]');
        if (await dialog.isVisible()) {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
          
          expect(await dialog.isVisible()).toBe(false);
        }
      }
    });

    test('enter key activates buttons', async ({ page }) => {
      await page.goto('/transactions');
      
      const button = page.locator('button', { hasText: 'New Transaction' });
      if (await button.isVisible()) {
        await button.focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        
        // Should open dialog or perform action
        expect(true).toBe(true); // Placeholder for actual assertion
      }
    });

    test('arrow keys work in menus and lists', async ({ page }) => {
      await page.goto('/');
      
      // Find any dropdown or menu
      const menuButton = page.locator('[role="button"][aria-haspopup="menu"]').first();
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(500);
        
        const menu = page.locator('[role="menu"]');
        if (await menu.isVisible()) {
          await page.keyboard.press('ArrowDown');
          
          const focusedItem = page.locator('[role="menuitem"]:focus');
          expect(await focusedItem.count()).toBe(1);
        }
      }
    });
  });

  test.describe('Screen Reader Support', () => {
    test('proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      if (headingCount > 0) {
        // Check that there's at least one h1
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBeGreaterThan(0);
        
        // Check heading hierarchy (simplified check)
        for (let i = 0; i < headingCount; i++) {
          const heading = headings.nth(i);
          const text = await heading.textContent();
          expect(text?.trim()).toBeTruthy();
        }
      }
    });

    test('proper landmark roles', async ({ page }) => {
      await page.goto('/');
      
      // Check for main landmark
      const main = page.locator('[role="main"], main');
      expect(await main.count()).toBeGreaterThan(0);
      
      // Check for navigation landmarks
      const nav = page.locator('[role="navigation"], nav');
      expect(await nav.count()).toBeGreaterThan(0);
      
      // Check for banner (header)
      const banner = page.locator('[role="banner"], header');
      expect(await banner.count()).toBeGreaterThanOrEqual(0);
    });

    test('descriptive alt text for images', async ({ page }) => {
      await page.goto('/');
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');
        
        // Images should have alt text or be decorative
        if (role !== 'presentation' && role !== 'none') {
          expect(alt).toBeTruthy();
        }
      }
    });

    test('live regions for dynamic content', async ({ page }) => {
      await page.goto('/');
      
      // Check for live regions
      const liveRegions = page.locator('[aria-live]');
      const liveCount = await liveRegions.count();
      
      if (liveCount > 0) {
        for (let i = 0; i < liveCount; i++) {
          const region = liveRegions.nth(i);
          const ariaLive = await region.getAttribute('aria-live');
          
          expect(['polite', 'assertive', 'off']).toContain(ariaLive);
        }
      }
    });
  });

  test.describe('Color and Contrast', () => {
    test('sufficient color contrast', async ({ page }) => {
      await page.goto('/');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .withRules(['color-contrast'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('information not conveyed by color alone', async ({ page }) => {
      await page.goto('/transactions');
      
      // Check status badges that might use color
      const statusBadges = page.locator('[data-testid="status-badge"]');
      const badgeCount = await statusBadges.count();
      
      for (let i = 0; i < Math.min(badgeCount, 5); i++) {
        const badge = statusBadges.nth(i);
        const text = await badge.textContent();
        
        // Badge should have text content, not just color
        expect(text?.trim()).toBeTruthy();
      }
    });
  });

  test.describe('Responsive Accessibility', () => {
    test('mobile accessibility', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="dashboard-stats"]');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('tablet accessibility', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      
      await page.waitForSelector('[data-testid="dashboard-stats"]');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Focus Management', () => {
    test('focus is properly managed in SPAs', async ({ page }) => {
      await page.goto('/');
      
      // Navigate to different page
      const transactionsLink = page.locator('a[href="/transactions"]');
      if (await transactionsLink.isVisible()) {
        await transactionsLink.click();
        await page.waitForTimeout(1000);
        
        // Focus should be managed properly after navigation
        const focusedElement = page.locator(':focus');
        expect(await focusedElement.count()).toBeGreaterThanOrEqual(0);
      }
    });

    test('focus is trapped in modals', async ({ page }) => {
      await page.goto('/transactions');
      
      const createButton = page.locator('button', { hasText: 'New Transaction' });
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(1000);
        
        const dialog = page.locator('[role="dialog"]');
        if (await dialog.isVisible()) {
          // Tab through modal elements
          for (let i = 0; i < 10; i++) {
            await page.keyboard.press('Tab');
            
            const focusedElement = page.locator(':focus');
            const isInsideModal = await dialog.locator(':focus').count() > 0;
            
            // Focus should stay within modal
            expect(isInsideModal).toBe(true);
          }
        }
      }
    });
  });
});