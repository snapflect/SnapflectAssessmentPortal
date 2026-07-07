import { test, expect } from '@playwright/test';

test.describe('Admin Analytics E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('/auth/login');
    
    // Perform Login as Admin
    await page.fill('input[type="email"], input[name="email"], input[formControlName="email"]', 'admin@snapflect.com');
    await page.fill('input[type="password"], input[name="password"], input[formControlName="password"]', 'Password123!');
    await page.click('button[type="submit"], button:has-text("Login")');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');
  });

  test('should view analytics, filter by assessment, and verify charts render', async ({ page }) => {
    // 1. Navigate to /analytics
    await page.goto('/analytics');
    
    // Check that the analytics dashboard title or header loads
    await expect(page.locator('h1, h2, .title, .header').filter({ hasText: /Analytics|Dashboard|Reports/i }).first()).toBeVisible();

    // 2. Filter the dashboard for "Q3 Frontend Assessment"
    const assessmentFilter = page.locator('select[name="assessment"], mat-select[formControlName="assessment"], input[placeholder*="assessment" i], input[aria-label*="assessment" i]');
    
    if (await assessmentFilter.isVisible()) {
      const tagName = await assessmentFilter.evaluate(node => node.tagName.toLowerCase());
      if (tagName === 'input') {
        await assessmentFilter.fill('Q3 Frontend Assessment');
        // Press Enter or click a search button if needed
        await assessmentFilter.press('Enter');
      } else {
        await assessmentFilter.click();
        await page.locator('mat-option:has-text("Q3 Frontend Assessment"), option:has-text("Q3 Frontend Assessment")').click();
      }
    }

    // 3. Verify that the charts render
    // Usually charts use canvas or SVG elements
    const chart = page.locator('canvas, svg.chart, .chart-container, p-chart, base-chart').first();
    await expect(chart).toBeVisible();

    // 4. Verify the newly completed candidate result is listed in the recent activity table
    const activityTable = page.locator('table, mat-table, .activity-table, .results-table').first();
    await expect(activityTable).toBeVisible();

    // We check that some text related to the assessment or candidate appears in the table
    // For example, "Q3 Frontend Assessment" or candidate's email/name if displayed
    await expect(activityTable).toContainText(/Q3 Frontend Assessment|candidate1@snapflect\.com/i);
  });
});
