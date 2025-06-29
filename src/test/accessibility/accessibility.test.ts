
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Testing', () => {
  test('should not have accessibility violations on dashboard', async ({ page }) => {
    await page.goto('/agent/dashboard');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility violations on offer drafting form', async ({ page }) => {
    await page.goto('/offer-drafting');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/offer-drafting');
    
    // Tab through form fields
    await page.keyboard.press('Tab');
    await expect(page.locator('[name="property_address"]:focus')).toBeVisible();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[name="buyer_names"]:focus')).toBeVisible();
    
    // Test form submission with keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/offer-drafting');
    
    // Check for required ARIA attributes
    const requiredFields = page.locator('[required]');
    const count = await requiredFields.count();
    
    for (let i = 0; i < count; i++) {
      const field = requiredFields.nth(i);
      await expect(field).toHaveAttribute('aria-required', 'true');
    }
    
    // Check for error states
    await page.click('button:has-text("Submit Offer Request")');
    
    const errorFields = page.locator('[aria-invalid="true"]');
    const errorCount = await errorFields.count();
    
    expect(errorCount).toBeGreaterThan(0);
  });

  test('should provide screen reader friendly content', async ({ page }) => {
    await page.goto('/agent/dashboard');
    
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    expect(headings.length).toBeGreaterThan(0);
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }
  });
});
