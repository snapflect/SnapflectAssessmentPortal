import { test, expect } from '@playwright/test';

test.describe('Author Role - Assessment Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as an Author
    await page.goto('/auth/login');
    
    await page.fill('input[name="email"]', 'admin@snapflect.com'); // Adjust to author credentials if different
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Wait for successful login redirect
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should create and publish a new assessment linked to a blueprint', async ({ page }) => {
    const assessmentData = {
      title: 'Q3 Frontend Assessment',
      description: 'Quarterly evaluation for frontend engineers.',
      blueprintTitle: 'Frontend Developer Blueprint', // From the blueprint spec
      passingScore: '75'
    };

    // 1. Navigate to /assessment/new
    await page.goto('/assessment/new');

    // 2. Fill in the assessment title and description
    await page.fill('input[name="title"], input[id="title"]', assessmentData.title);
    await page.fill('textarea[name="description"], textarea[id="description"]', assessmentData.description);

    // 3. Link it to the previously created Blueprint
    // Assuming a select dropdown or combobox for blueprint selection
    await page.selectOption('select[name="blueprintId"], select[id="blueprint"]', { label: assessmentData.blueprintTitle }).catch(async () => {
        // Fallback for custom select components
        await page.click('div:has-text("Select Blueprint"), .blueprint-select');
        await page.click(`text=${assessmentData.blueprintTitle}`);
    });

    // 4. Set a passing score
    await page.fill('input[name="passingScore"], input[id="passingScore"]', assessmentData.passingScore);

    // 5. Publish the assessment
    await page.click('button:has-text("Publish"), button:has-text("Create Assessment")');

    // 6. Verify success (redirected to assessment list or shows success toast)
    // Adjust the URL expectation based on your app's actual routing
    await expect(page).toHaveURL(/\/assessment(\/list)?/);
    
    const assessmentLocator = page.locator(`text=${assessmentData.title}`);
    await expect(assessmentLocator).toBeVisible();
  });
});
