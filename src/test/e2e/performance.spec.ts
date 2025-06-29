
import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  test('should load dashboard within performance budgets', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/agent/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check for performance metrics
    const performanceEntries = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    expect(performanceEntries.domContentLoaded).toBeLessThan(1500);
    expect(performanceEntries.firstContentfulPaint).toBeLessThan(2000);
  });

  test('should handle large form data efficiently', async ({ page }) => {
    await page.goto('/offer-drafting');
    
    const startTime = Date.now();
    
    // Fill form with large amounts of data
    await page.fill('[name="property_address"]', '123 Performance Test Ave, Hampton, VA 23661');
    await page.fill('[name="buyer_names"]', 'A'.repeat(100) + ', ' + 'B'.repeat(100));
    await page.fill('[name="extras"]', 'Lorem ipsum '.repeat(1000));
    
    // Measure form response time
    await page.fill('[name="purchase_price"]', '500000');
    
    const responseTime = Date.now() - startTime;
    
    // Form should remain responsive
    expect(responseTime).toBeLessThan(1000);
  });

  test('should maintain performance with many concurrent validations', async ({ page }) => {
    await page.goto('/offer-drafting');
    
    const startTime = Date.now();
    
    // Trigger multiple validations simultaneously
    const promises = [
      page.fill('[name="property_address"]', '123 Concurrent Test'),
      page.fill('[name="buyer_names"]', 'John Doe, Jane Doe'),
      page.fill('[name="purchase_price"]', '350000'),
      page.fill('[name="emd_amount"]', '5000'),
      page.fill('[name="exchange_fee"]', '500'),
    ];
    
    await Promise.all(promises);
    
    // Wait for all validations to complete
    await page.waitForTimeout(1000);
    
    const totalTime = Date.now() - startTime;
    
    // Should handle concurrent validations efficiently
    expect(totalTime).toBeLessThan(2000);
  });
});
