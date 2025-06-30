
import { test, expect } from '@playwright/test';

test.describe('Offer Drafting E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/auth');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/agent/dashboard');
  });

  test('should complete offer drafting workflow', async ({ page }) => {
    // Navigate to offer drafting
    await page.click('text=Create Offer');
    await page.waitForURL('/offer-drafting');

    // Fill property information
    await page.fill('[name="property_address"]', '123 Test St, Hampton, VA 23661');
    await page.fill('[name="buyer_names"]', 'John Doe, Jane Doe');

    // Fill contact information
    await page.click('button:has-text("Add Phone")');
    await page.fill('[name="buyer_phones.0"]', '(757) 123-4567');
    
    await page.click('button:has-text("Add Email")');
    await page.fill('[name="buyer_emails.0"]', 'buyer@example.com');

    // Fill offer terms
    await page.fill('[name="purchase_price"]', '350000');
    await page.selectOption('[name="loan_type"]', 'conventional');
    await page.fill('[name="lending_company"]', 'Test Lender');
    await page.fill('[name="emd_amount"]', '5000');
    await page.fill('[name="exchange_fee"]', '500');

    // Fill settlement information
    await page.fill('[name="settlement_company"]', 'Test Settlement Company');
    await page.fill('[name="projected_closing_date"]', '2024-06-01');

    // Submit form
    await page.click('button:has-text("Submit Offer Request")');

    // Verify success
    await expect(page.locator('text=Offer request submitted successfully')).toBeVisible();
    await page.waitForURL('/transactions/*');
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/offer-drafting');

    // Try to submit empty form
    await page.click('button:has-text("Submit Offer Request")');

    // Check for validation errors
    await expect(page.locator('text=Property address is required')).toBeVisible();
    await expect(page.locator('text=Buyer names are required')).toBeVisible();
    await expect(page.locator('text=Purchase price is required')).toBeVisible();
  });

  test('should auto-save form data', async ({ page }) => {
    await page.goto('/offer-drafting');

    // Fill some data
    await page.fill('[name="property_address"]', '123 Auto Save Test');
    
    // Wait for auto-save
    await page.waitForTimeout(2000);
    
    // Refresh page
    await page.reload();
    
    // Check if data persisted
    await expect(page.locator('[name="property_address"]')).toHaveValue('123 Auto Save Test');
  });

  test('should handle form cancellation', async ({ page }) => {
    await page.goto('/offer-drafting');

    // Fill some data
    await page.fill('[name="property_address"]', '123 Cancel Test');
    
    // Cancel form
    await page.click('button:has-text("Cancel")');
    
    // Should navigate back
    await page.waitForURL('/agent/dashboard');
  });
});
