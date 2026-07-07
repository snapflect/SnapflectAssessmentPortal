import { test, expect } from '../fixtures/auth.fixtures';

test.describe('Read-Only Day in the Life', () => {
  test('Navigates platform safely without edit access', async ({ readOnlyPage }) => {
    // We start logged in as read_only@snapflect.com and on /dashboard

    // 1. Visit Governance (e.g. Organizations)
    await readOnlyPage.goto('/governance/organizations');
    // Ensure no 403 or crash
    await expect(readOnlyPage.locator('text=403').or(readOnlyPage.locator('text=Forbidden'))).not.toBeVisible();
    // Ensure 'Add' or 'Create' button is not visible
    const createOrgBtn = readOnlyPage.locator('button:has-text("Create Organization"), button:has-text("Add")');
    await expect(createOrgBtn).not.toBeVisible();

    // 2. Visit Assessment Authoring (e.g. Question Banks)
    await readOnlyPage.goto('/authoring/question-banks');
    await expect(readOnlyPage.locator('text=403').or(readOnlyPage.locator('text=Forbidden'))).not.toBeVisible();
    const createBankBtn = readOnlyPage.locator('button:has-text("Create Bank"), button:has-text("New Bank")');
    await expect(createBankBtn).not.toBeVisible();

    // 3. View a Question Bank if it exists
    const viewBtn = readOnlyPage.locator('button:has-text("View")').first();
    if (await viewBtn.isVisible()) {
        await viewBtn.click();
        await expect(readOnlyPage.locator('text=403')).not.toBeVisible();
        // Edit button should not exist
        const editBtn = readOnlyPage.locator('button:has-text("Edit"), button:has-text("Save")');
        await expect(editBtn).not.toBeVisible();
    }
  });
});
