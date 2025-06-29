
import { test, expect } from '@playwright/test';

test.describe('Agent Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', 'agent@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/agent/dashboard');
  });

  test('should navigate agent dashboard', async ({ page }) => {
    // Check dashboard elements
    await expect(page.locator('h1:has-text("Agent Dashboard")')).toBeVisible();
    await expect(page.locator('text=Active Transactions')).toBeVisible();
    await expect(page.locator('text=What\'s Next')).toBeVisible();
  });

  test('should complete agent intake process', async ({ page }) => {
    // Navigate to agent intake
    await page.click('text=Complete Setup');
    await page.waitForURL('/agent/intake');

    // Step 1: Vendor Preferences
    await expect(page.locator('text=Vendor Preferences')).toBeVisible();
    
    // Add a lender
    await page.click('button:has-text("Add Lender")');
    await page.fill('[name="lender_company_name"]', 'Test Lender Inc.');
    await page.fill('[name="lender_contact_name"]', 'John Smith');
    await page.fill('[name="lender_email"]', 'john@testlender.com');
    await page.check('[name="lender_is_primary"]');
    
    await page.click('button:has-text("Next Step")');

    // Step 2: Branding Preferences
    await expect(page.locator('text=Branding Preferences')).toBeVisible();
    
    await page.click('input[value="yes"]'); // Has branded sign
    await page.fill('[name="review_link"]', 'https://reviews.example.com/agent');
    await page.fill('[name="favorite_color"]', '#3B82F6');
    await page.check('[name="drinks_coffee"]');
    
    await page.click('button:has-text("Next Step")');

    // Step 3: Review and Submit
    await expect(page.locator('text=Review and Submit')).toBeVisible();
    
    // Verify data appears in review
    await expect(page.locator('text=Test Lender Inc.')).toBeVisible();
    await expect(page.locator('text=https://reviews.example.com/agent')).toBeVisible();
    
    await page.click('button:has-text("Complete Setup")');

    // Should navigate to dashboard
    await page.waitForURL('/agent/dashboard');
    await expect(page.locator('text=Setup completed successfully')).toBeVisible();
  });

  test('should create and manage transactions', async ({ page }) => {
    // Create new transaction
    await page.click('button:has-text("New Transaction")');
    
    // Fill transaction details
    await page.fill('[name="property_address"]', '456 Test Ave, Norfolk, VA 23502');
    await page.fill('[name="client_name"]', 'Test Client');
    await page.selectOption('[name="transaction_type"]', 'buyer');
    await page.selectOption('[name="service_tier"]', 'buyer_elite');
    
    await page.click('button:has-text("Create Transaction")');
    
    // Verify transaction appears in list
    await expect(page.locator('text=456 Test Ave, Norfolk, VA 23502')).toBeVisible();
    await expect(page.locator('text=Elite Buyer Service')).toBeVisible();
  });

  test('should handle mobile navigation', async ({ page }) => {
    // Simulate mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile menu
    await page.click('button[aria-label="Toggle menu"]');
    await expect(page.locator('nav[aria-label="Mobile navigation"]')).toBeVisible();
    
    // Navigate to transactions
    await page.click('text=Transactions');
    await page.waitForURL('/agent/transactions');
    
    // Verify mobile-optimized layout
    await expect(page.locator('.mobile-transaction-card')).toBeVisible();
  });
});
