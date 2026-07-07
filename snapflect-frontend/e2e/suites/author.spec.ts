import { test, expect } from '../fixtures/auth.fixtures';

test.describe('Content Creator / Assessment Manager Day in the Life', () => {
  test('Building an Assessment Flow', async ({ authorPage }) => {
    // We start already logged in as content_creator@snapflect.com and on /dashboard

    // 1. Create Question Bank
    await authorPage.goto('/authoring/question-banks');
    const bankCode = `BANK-${Date.now()}`;
    await authorPage.click('button:has-text("Create Bank"), button:has-text("New Bank")');
    await authorPage.fill('input[formControlName="bank_code"], input[name="bank_code"]', bankCode);
    await authorPage.fill('input[formControlName="bank_name"], input[name="bank_name"]', 'Playwright E2E Bank');
    await authorPage.click('button:has-text("Save"), button:has-text("Create")');
    // Assuming a success toast or navigation
    await expect(authorPage.locator('text=Bank Saved').or(authorPage.locator(`text=${bankCode}`))).toBeVisible();

    // 2. Create Question
    await authorPage.goto('/authoring/questions');
    await authorPage.click('button:has-text("Add Question"), button:has-text("New Question")');
    const questionCode = `Q-${Date.now()}`;
    // Select the bank if applicable
    const bankSelect = authorPage.locator('select[formControlName="question_bank_uuid"], select[name="question_bank_id"]');
    if (await bankSelect.isVisible()) {
      await bankSelect.selectOption({ label: 'Playwright E2E Bank' });
    }
    await authorPage.fill('input[formControlName="question_code"], input[name="question_code"]', questionCode);
    await authorPage.selectOption('select[formControlName="question_type"], select[name="question_type"]', { label: 'Multiple Choice' });
    
    // Fill quill editor or textarea
    const editor = authorPage.locator('.ql-editor');
    if (await editor.isVisible()) {
      await editor.fill('What is the capital of testing?');
    } else {
      await authorPage.fill('textarea[formControlName="question_text"], textarea[name="question_text"]', 'What is the capital of testing?');
    }

    // Options
    await authorPage.locator('input[formControlName="option_text"], input[name="option_text"]').nth(0).fill('Playwright');
    await authorPage.locator('input[formControlName="is_correct"], input[type="checkbox"]').nth(0).check();
    await authorPage.locator('input[formControlName="option_text"], input[name="option_text"]').nth(1).fill('Jest');
    await authorPage.click('button:has-text("Save"), button:has-text("Create")');
    await expect(authorPage.locator('text=Question Created').or(authorPage.locator(`text=${questionCode}`))).toBeVisible();

    // 3. Create Assessment
    await authorPage.goto('/authoring/assessments');
    await authorPage.click('button:has-text("New Assessment"), button:has-text("Create Assessment")');
    const assessmentCode = `TEST-${Date.now()}`;
    await authorPage.fill('input[formControlName="assessment_code"], input[name="assessment_code"]', assessmentCode);
    await authorPage.fill('input[formControlName="assessment_name"], input[name="assessment_name"]', 'Playwright E2E Assessment');
    
    // Attempt to select category and type (assuming they exist from seeders)
    await authorPage.selectOption('select[formControlName="assessment_category_uuid"], select[name="assessment_category_uuid"]', { index: 1 }).catch(() => {});
    await authorPage.selectOption('select[formControlName="assessment_type_uuid"], select[name="assessment_type_uuid"]', { index: 1 }).catch(() => {});
    
    await authorPage.click('button:has-text("Save"), button:has-text("Create")');
    
    // 4. Edit Blueprint
    // The previous test navigated to designer
    await authorPage.locator(`text=${assessmentCode}`).locator('..').locator('..').locator('..').locator('button:has-text("Designer")').click().catch(async () => {
       // fallback if the locator is different
       await authorPage.goto('/authoring/blueprints');
    });
    
    const addSectionBtn = authorPage.locator('button:has-text("Add Section")');
    if (await addSectionBtn.isVisible()) {
        await addSectionBtn.click();
        await authorPage.fill('input[formControlName="title"], input[name="title"]', 'E2E Section 1');
        await authorPage.selectOption('select[formControlName="selection_strategy"], select[name="selection_strategy"]', { label: 'Random Selection' }).catch(() => {});
        await authorPage.click('button:has-text("Save Section"), button:has-text("Add Section")');
    }
  });
});
