import { test, expect } from '@playwright/test';

test.describe('Author Role - Blueprint Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as an Author
    await page.goto('/auth/login');
    
    // Assuming standard login fields based on the user login flow
    await page.fill('input[name="email"]', 'admin@snapflect.com'); // Adjust to author credentials if different
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Wait for successful login redirect
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should create a new blueprint with sections', async ({ page }) => {
    const blueprintData = {
      title: 'Frontend Developer Blueprint',
      description: 'Blueprint for assessing frontend skills.',
      sections: [
        { name: 'Angular Basics', weight: '60' },
        { name: 'RxJS', weight: '40' }
      ]
    };

    // 1. Navigate to /assessment/blueprints/new
    await page.goto('/assessment/blueprints/new');

    // 2. Enter Blueprint details
    await page.fill('input[name="title"], input[id="title"]', blueprintData.title);
    await page.fill('textarea[name="description"], textarea[id="description"]', blueprintData.description);

    // 3. Define sections
    // Add first section
    await page.fill('input[name="sectionName"], input[aria-label="Section Name"], .section-name-input', blueprintData.sections[0].name);
    await page.fill('input[name="sectionWeight"], input[aria-label="Section Weight"], .section-weight-input', blueprintData.sections[0].weight);
    
    // Assuming there's an "Add Section" button for the second section
    await page.click('button:has-text("Add Section"), button[aria-label="Add Section"]');
    
    // Fill second section (target the last inputs if multiple exist)
    const sectionNameInputs = page.locator('input[name="sectionName"], input[aria-label="Section Name"], .section-name-input');
    const sectionWeightInputs = page.locator('input[name="sectionWeight"], input[aria-label="Section Weight"], .section-weight-input');
    
    await sectionNameInputs.nth(1).fill(blueprintData.sections[1].name);
    await sectionWeightInputs.nth(1).fill(blueprintData.sections[1].weight);

    // 4. Save the Blueprint
    await page.click('button:has-text("Save"), button[type="submit"]');

    // 5. Verify it appears in the list
    // Assuming it redirects to the list view or shows a success message
    await expect(page).toHaveURL(/\/assessment\/blueprints(\/list)?/);
    
    const blueprintLocator = page.locator(`text=${blueprintData.title}`);
    await expect(blueprintLocator).toBeVisible();
  });
});
