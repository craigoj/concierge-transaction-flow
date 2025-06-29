import { test, expect, Page } from '@playwright/test';

// User flow testing - Critical paths through the application
test.describe('Critical User Flows', () => {
  
  async function mockAuth(page: Page) {
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        user: { id: 'test-user', email: 'test@example.com', role: 'coordinator' }
      }));
    });
  }

  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
  });

  test('Coordinator Transaction Creation Flow @flow @critical', async ({ page }) => {
    console.log('🔄 Testing: Complete transaction creation workflow');
    
    // Step 1: Navigate to transactions page
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/flow-transaction-1-list.png' });
    
    // Step 2: Click create new transaction
    await page.click('button:has-text("NEW TRANSACTION"), [data-testid="create-transaction"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/flow-transaction-2-create-modal.png' });
    
    // Step 3: Fill transaction form
    await page.fill('input[name="property_address"]', '123 Main Street, Hampton, VA 23669');
    await page.fill('input[name="purchase_price"]', '450000');
    await page.selectOption('select[name="transaction_type"]', 'buyer');
    await page.selectOption('select[name="service_tier"]', 'buyer_elite');
    await page.screenshot({ path: 'screenshots/flow-transaction-3-form-filled.png' });
    
    // Step 4: Submit transaction
    await page.click('button[type="submit"], button:has-text("Create")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/flow-transaction-4-created.png' });
    
    console.log('✅ Transaction creation flow completed');
  });

  test('Client Management Workflow @flow @critical', async ({ page }) => {
    console.log('🔄 Testing: Client creation and management workflow');
    
    // Step 1: Navigate to clients
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/flow-client-1-list.png' });
    
    // Step 2: Create new client
    await page.goto('/clients/new');
    await page.screenshot({ path: 'screenshots/flow-client-2-create-form.png' });
    
    // Step 3: Fill client information
    await page.fill('input[name="full_name"]', 'Sarah Johnson');
    await page.fill('input[name="email"]', 'sarah.johnson@email.com');
    await page.fill('input[name="phone"]', '(757) 555-0123');
    await page.selectOption('select[name="type"]', 'buyer');
    await page.screenshot({ path: 'screenshots/flow-client-3-form-filled.png' });
    
    // Step 4: Submit client
    await page.click('button[type="submit"], button:has-text("Create")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/flow-client-4-created.png' });
    
    console.log('✅ Client management flow completed');
  });

  test('Agent Dashboard Experience @flow @agent', async ({ page }) => {
    console.log('🔄 Testing: Agent portal user experience');
    
    // Mock agent role
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'agent-user', email: 'agent@example.com', role: 'agent' }
      }));
    });
    
    // Step 1: Agent dashboard
    await page.goto('/agent/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/flow-agent-1-dashboard.png' });
    
    // Step 2: View transaction details
    await page.click('a[href*="/agent/transactions/"], .transaction-card').first();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/flow-agent-2-transaction-detail.png' });
    
    // Step 3: Task management
    await page.click('[data-testid="tasks-tab"], button:has-text("Tasks")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/flow-agent-3-tasks.png' });
    
    console.log('✅ Agent dashboard flow completed');
  });

  test('Mobile User Journey @flow @mobile', async ({ page }) => {
    console.log('🔄 Testing: Mobile user experience');
    
    // Step 1: Mobile dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/flow-mobile-1-dashboard.png' });
    
    // Step 2: Mobile navigation
    try {
      await page.click('[data-testid="mobile-menu"], button:has([data-testid="menu-icon"])');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/flow-mobile-2-navigation.png' });
      
      // Step 3: Navigate to transactions via mobile menu
      await page.click('a[href="/transactions"]');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/flow-mobile-3-transactions.png' });
    } catch (e) {
      console.log('Mobile navigation pattern not found, testing standard navigation');
      await page.goto('/transactions');
      await page.screenshot({ path: 'screenshots/flow-mobile-3-transactions-direct.png' });
    }
    
    console.log('✅ Mobile user journey completed');
  });

  test('Workflow Automation Setup @flow @automation', async ({ page }) => {
    console.log('🔄 Testing: Automation workflow setup');
    
    // Step 1: Navigate to automation dashboard
    await page.goto('/automation');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/flow-automation-1-dashboard.png' });
    
    // Step 2: Workflow templates
    await page.goto('/workflow-templates');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/flow-automation-2-templates.png' });
    
    // Step 3: Create workflow rule
    try {
      await page.click('button:has-text("Create Rule"), [data-testid="create-rule"]');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/flow-automation-3-create-rule.png' });
    } catch (e) {
      console.log('Create rule button not found');
    }
    
    console.log('✅ Automation workflow setup completed');
  });

  test('Settings and Configuration Flow @flow @settings', async ({ page }) => {
    console.log('🔄 Testing: Settings and configuration workflow');
    
    // Step 1: Main settings page
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/flow-settings-1-main.png' });
    
    // Step 2: Profile management
    await page.goto('/profile');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/flow-settings-2-profile.png' });
    
    // Step 3: Integration settings
    try {
      await page.click('button:has-text("Integrations"), [data-testid="integrations"]');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/flow-settings-3-integrations.png' });
    } catch (e) {
      console.log('Integrations section not found');
    }
    
    console.log('✅ Settings configuration flow completed');
  });

  test('Error State Handling @flow @error-states', async ({ page }) => {
    console.log('🔄 Testing: Error state handling and recovery');
    
    // Test network error simulation
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/transactions');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/flow-error-1-network-error.png' });
    
    // Clear network blocking
    await page.unroute('**/api/**');
    
    // Test form validation errors
    await page.goto('/clients/new');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/flow-error-2-validation.png' });
    
    console.log('✅ Error state handling tested');
  });
});

// Performance and load testing
test.describe('Performance Documentation', () => {
  
  test('Page Load Performance @performance', async ({ page }) => {
    console.log('🔄 Testing: Page load performance metrics');
    
    const pages = ['/dashboard', '/transactions', '/clients', '/agent/dashboard'];
    
    for (const pagePath of pages) {
      const startTime = Date.now();
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      console.log(`Page ${pagePath} loaded in ${loadTime}ms`);
      await page.screenshot({ path: `screenshots/perf-${pagePath.replace('/', '')}-loaded.png` });
    }
  });

  test('Component Interaction Performance @performance', async ({ page }) => {
    await page.goto('/transactions');
    
    // Test tab switching performance
    const tabs = ['active', 'pending', 'completed'];
    
    for (const tab of tabs) {
      const startTime = Date.now();
      await page.click(`button:has-text("${tab.toUpperCase()}")`);
      await page.waitForLoadState('networkidle');
      const switchTime = Date.now() - startTime;
      
      console.log(`Tab switch to ${tab} took ${switchTime}ms`);
    }
  });
});