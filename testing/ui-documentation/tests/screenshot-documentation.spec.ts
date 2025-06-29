import { test, expect, Page } from '@playwright/test';
import fs from 'fs-extra';
import path from 'path';

// Screenshot utility function
async function captureScreenshot(page: Page, name: string, fullPage = true) {
  const screenshotPath = `screenshots/${name}.png`;
  await page.screenshot({ 
    path: screenshotPath, 
    fullPage,
    animations: 'disabled'
  });
  return screenshotPath;
}

// Mock authentication for testing
async function mockAuth(page: Page) {
  // Add auth token to localStorage to bypass login
  await page.addInitScript(() => {
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      user: { id: 'test-user', email: 'test@example.com' }
    }));
  });
}

test.describe('Concierge Transaction Flow - UI Documentation', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
  });

  test('Landing Page Screenshots @screenshot @desktop', async ({ page }) => {
    await page.goto('/landing');
    
    // Full page screenshot
    await captureScreenshot(page, 'landing-page-full');
    
    // Header section
    await page.locator('header').screenshot({ path: 'screenshots/landing-header.png' });
    
    // Hero section
    await page.locator('.hero-section, [data-testid="hero"]').first().screenshot({ 
      path: 'screenshots/landing-hero.png' 
    });
  });

  test('Authentication Pages @screenshot @desktop', async ({ page }) => {
    await page.goto('/auth');
    
    await captureScreenshot(page, 'auth-login-page');
    
    // Try to capture different auth states
    await page.fill('input[type="email"]', 'test@example.com');
    await captureScreenshot(page, 'auth-with-email');
  });

  test('Dashboard Screenshots @screenshot @desktop', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="dashboard"], .dashboard-container', { timeout: 10000 });
    
    await captureScreenshot(page, 'dashboard-main');
    
    // Dashboard stats section
    await page.locator('[data-testid="dashboard-stats"], .dashboard-stats').first().screenshot({ 
      path: 'screenshots/dashboard-stats.png' 
    });
    
    // Active transactions panel
    await page.locator('[data-testid="active-transactions"], .active-coordination').first().screenshot({ 
      path: 'screenshots/dashboard-active-transactions.png' 
    });
  });

  test('Transactions Page @screenshot @desktop', async ({ page }) => {
    await page.goto('/transactions');
    
    await page.waitForSelector('[data-testid="transactions"], .transactions-container', { timeout: 10000 });
    await captureScreenshot(page, 'transactions-list');
    
    // Transaction tabs
    await page.locator('[data-testid="transaction-tabs"], .tabs-list').first().screenshot({ 
      path: 'screenshots/transaction-tabs.png' 
    });
    
    // Switch to different tabs and capture
    const tabs = ['active', 'pending', 'completed', 'all'];
    for (const tab of tabs) {
      try {
        await page.click(`[data-value="${tab}"], button:has-text("${tab.toUpperCase()}")`);
        await page.waitForTimeout(1000);
        await captureScreenshot(page, `transactions-${tab}-tab`);
      } catch (e) {
        console.log(`Tab ${tab} not found or clickable`);
      }
    }
  });

  test('Clients Management @screenshot @desktop', async ({ page }) => {
    await page.goto('/clients');
    
    await page.waitForSelector('[data-testid="clients"], .clients-container', { timeout: 10000 });
    await captureScreenshot(page, 'clients-list');
    
    // Navigate to create client
    await page.goto('/clients/new');
    await captureScreenshot(page, 'create-client-form');
  });

  test('Agent Portal @screenshot @desktop', async ({ page }) => {
    await page.goto('/agent/dashboard');
    
    await page.waitForSelector('[data-testid="agent-dashboard"], .agent-dashboard', { timeout: 10000 });
    await captureScreenshot(page, 'agent-dashboard');
    
    // Agent-specific components
    await page.locator('[data-testid="agent-metrics"], .agent-metrics').first().screenshot({ 
      path: 'screenshots/agent-metrics.png' 
    });
  });

  test('Settings and Configuration @screenshot @desktop', async ({ page }) => {
    await page.goto('/settings');
    
    await captureScreenshot(page, 'settings-page');
    
    // Profile page
    await page.goto('/profile');
    await captureScreenshot(page, 'profile-page');
  });

  test('Workflows and Automation @screenshot @desktop', async ({ page }) => {
    await page.goto('/workflows');
    await captureScreenshot(page, 'workflows-page');
    
    await page.goto('/workflow-templates');
    await captureScreenshot(page, 'workflow-templates');
    
    await page.goto('/automation');
    await captureScreenshot(page, 'automation-dashboard');
  });

  test('Mobile Responsive Views @screenshot @mobile', async ({ page }) => {
    // Dashboard mobile view
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="dashboard"], .dashboard-container', { timeout: 10000 });
    await captureScreenshot(page, 'mobile-dashboard');
    
    // Transactions mobile view
    await page.goto('/transactions');
    await page.waitForSelector('[data-testid="transactions"], .transactions-container', { timeout: 10000 });
    await captureScreenshot(page, 'mobile-transactions');
    
    // Mobile navigation
    try {
      await page.click('[data-testid="mobile-menu"], button:has([data-testid="menu-icon"])');
      await page.waitForTimeout(500);
      await captureScreenshot(page, 'mobile-navigation-open');
    } catch (e) {
      console.log('Mobile menu not found');
    }
  });

  test('Component States Documentation @screenshot @desktop', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Loading states - simulate by intercepting requests
    await page.route('**/transactions*', route => {
      // Delay the response to capture loading state
      setTimeout(() => route.continue(), 3000);
    });
    
    await page.reload();
    await page.waitForTimeout(1000);
    await captureScreenshot(page, 'loading-state-dashboard');
    
    // Clear route interception
    await page.unroute('**/transactions*');
  });

  test('Form States and Interactions @screenshot @desktop', async ({ page }) => {
    await page.goto('/clients/new');
    
    // Empty form
    await captureScreenshot(page, 'form-empty-state');
    
    // Filled form
    await page.fill('input[name="full_name"], input[placeholder*="name"]', 'John Doe');
    await page.fill('input[name="email"], input[type="email"]', 'john@example.com');
    await captureScreenshot(page, 'form-filled-state');
    
    // Form validation (try to submit without required fields)
    await page.click('button[type="submit"], button:has-text("Create"), button:has-text("Save")');
    await page.waitForTimeout(500);
    await captureScreenshot(page, 'form-validation-errors');
  });
});

test.describe('Accessibility Testing', () => {
  test('Keyboard Navigation @accessibility', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    await captureScreenshot(page, 'keyboard-focus-1');
    
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    await captureScreenshot(page, 'keyboard-focus-2');
  });

  test('Color Contrast and Readability @accessibility', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test with high contrast mode simulation
    await page.emulateMedia({ colorScheme: 'dark' });
    await captureScreenshot(page, 'dark-mode-simulation');
    
    await page.emulateMedia({ colorScheme: 'light' });
    await captureScreenshot(page, 'light-mode-default');
  });
});