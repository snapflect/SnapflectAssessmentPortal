import { test, expect } from '@playwright/test';

test.describe('Admin User Management E2E', () => {

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

  test('should create a new Candidate user and verify it appears in the list', async ({ page }) => {
    // 1. Navigate to /governance/users
    await page.goto('/governance/users');
    
    // Wait for the user list to be visible
    await expect(page.locator('table, mat-table, .user-list, .grid').first()).toBeVisible();

    // 2. Click Create/Add User
    const createUserBtn = page.locator('button:has-text("Create User"), button:has-text("Add User"), a:has-text("Create User"), a:has-text("Add User")').first();
    await expect(createUserBtn).toBeVisible();
    await createUserBtn.click();
    
    // Wait for the creation form or modal
    await expect(page.locator('form, mat-dialog-container, .modal')).toBeVisible();

    // 3. Fill out the user creation form
    await page.fill('input[name="first_name"], input[formControlName="first_name"]', 'Test');
    await page.fill('input[name="last_name"], input[formControlName="last_name"]', 'Candidate');
    await page.fill('input[name="email"], input[formControlName="email"]', 'candidate1@snapflect.com');
    
    // Select role CANDIDATE
    const roleSelect = page.locator('select[name="role"], mat-select[formControlName="role"]');
    await roleSelect.click();
    await page.locator('mat-option:has-text("CANDIDATE"), option[value="CANDIDATE"], option:has-text("CANDIDATE")').click();

    // Select or type team Engineering
    const teamInput = page.locator('input[name="team"], input[formControlName="team"]');
    if (await teamInput.isVisible()) {
      await teamInput.fill('Engineering');
    } else {
      const teamSelect = page.locator('select[name="team"], mat-select[formControlName="team"]');
      if (await teamSelect.isVisible()) {
        await teamSelect.click();
        await page.locator('mat-option:has-text("Engineering"), option[value="Engineering"], option:has-text("Engineering")').click();
      }
    }

    // Submit the form
    const submitBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
    await submitBtn.click();

    // Wait for form to close
    await expect(page.locator('form, mat-dialog-container, .modal')).toBeHidden();

    // 4. Verify the new user appears in the active users list
    // Optionally wait for the API call to complete or just wait for the text to appear
    const userRow = page.locator('table tr, mat-row, .user-row, .row').filter({ hasText: 'candidate1@snapflect.com' });
    await expect(userRow).toBeVisible();
    await expect(userRow).toContainText('Test');
    await expect(userRow).toContainText('Candidate');
    await expect(userRow).toContainText(/CANDIDATE/i);
  });
});
