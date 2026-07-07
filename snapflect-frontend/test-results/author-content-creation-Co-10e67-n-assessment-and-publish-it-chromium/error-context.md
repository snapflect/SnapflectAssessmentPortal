# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: author-content-creation.spec.ts >> Content Creation and Publishing Workflow >> Author can create a bank, question, assessment, and publish it
- Location: e2e\author-content-creation.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Content Creation and Publishing Workflow', () => {
  4  |   test('Author can create a bank, question, assessment, and publish it', async ({ page }) => {
  5  |     // 1. Login
  6  |     await page.goto('/login');
> 7  |     await page.fill('input[type="email"]', 'author@testorg.com');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  8  |     await page.fill('input[type="password"]', 'password123');
  9  |     await page.click('button[type="submit"]');
  10 |     
  11 |     // Wait for dashboard to load
  12 |     await expect(page).toHaveURL(/\/authoring\/dashboard|\/dashboard/);
  13 |     
  14 |     // 2. Create Question Bank
  15 |     await page.click('text=Question Banks');
  16 |     await page.click('button:has-text("Create Bank")');
  17 |     const bankCode = `BANK-${Date.now()}`;
  18 |     await page.fill('input[formControlName="bank_code"]', bankCode);
  19 |     await page.fill('input[formControlName="bank_name"]', 'Playwright Test Bank');
  20 |     await page.click('button:has-text("Save Bank")');
  21 |     await expect(page.locator('text=Bank Saved')).toBeVisible();
  22 | 
  23 |     // 3. Create Question
  24 |     await page.click('text=Questions');
  25 |     await page.click('button:has-text("Add Question")');
  26 |     const questionCode = `Q-${Date.now()}`;
  27 |     await page.selectOption('select[formControlName="question_bank_uuid"]', { label: 'Playwright Test Bank' });
  28 |     await page.fill('input[formControlName="question_code"]', questionCode);
  29 |     await page.selectOption('select[formControlName="question_type"]', { label: 'Multiple Choice' });
  30 |     // Fill quill editor
  31 |     await page.locator('.ql-editor').fill('What is the capital of testing?');
  32 |     // Options
  33 |     await page.locator('input[formControlName="option_text"]').nth(0).fill('Playwright');
  34 |     await page.locator('input[formControlName="is_correct"]').nth(0).check();
  35 |     await page.locator('input[formControlName="option_text"]').nth(1).fill('Jest');
  36 |     await page.click('button:has-text("Save Question")');
  37 |     await expect(page.locator('text=Question Created')).toBeVisible();
  38 | 
  39 |     // 4. Create Assessment
  40 |     await page.click('text=Assessments');
  41 |     await page.click('button:has-text("New Assessment")');
  42 |     const assessmentCode = `TEST-${Date.now()}`;
  43 |     await page.fill('input[formControlName="assessment_code"]', assessmentCode);
  44 |     await page.fill('input[formControlName="assessment_name"]', 'Playwright E2E Assessment');
  45 |     await page.selectOption('select[formControlName="assessment_type_uuid"]', { index: 1 });
  46 |     await page.selectOption('select[formControlName="assessment_category_uuid"]', { index: 1 });
  47 |     await page.click('button:has-text("Save Assessment")');
  48 |     await expect(page.locator('text=Assessment Saved')).toBeVisible();
  49 | 
  50 |     // 5. Open Blueprint Designer
  51 |     // Click Designer button on the newly created assessment
  52 |     await page.locator(`text=${assessmentCode}`).locator('..').locator('..').locator('..').locator('button:has-text("Designer")').click();
  53 |     await expect(page).toHaveURL(/authoring\/blueprints/);
  54 |     
  55 |     // Create Section
  56 |     await page.click('button:has-text("Add Section")');
  57 |     await page.fill('input[formControlName="title"]', 'Section 1');
  58 |     await page.selectOption('select[formControlName="selection_strategy"]', { label: 'Random Selection' });
  59 |     await page.click('button:has-text("Add Section")');
  60 |     
  61 |     // Add Rule
  62 |     await page.click('button:has-text("+ Add Rule")');
  63 |     await page.fill('input[formControlName="question_count"]', '1');
  64 |     await page.click('button:has-text("Save Rule")');
  65 | 
  66 |     // 6. Transition State: Submit -> Approve -> Publish
  67 |     await page.click('text=Assessments');
  68 |     
  69 |     // Submit
  70 |     await page.locator(`text=${assessmentCode}`).locator('..').locator('..').locator('..').locator('button:has-text("Submit")').click();
  71 |     await expect(page.locator('text=Submitted for Review')).toBeVisible();
  72 |     
  73 |     // Approve
  74 |     await page.locator(`text=${assessmentCode}`).locator('..').locator('..').locator('..').locator('button:has-text("Approve")').click();
  75 |     await expect(page.locator('text=Assessment Approved')).toBeVisible();
  76 |     
  77 |     // Publish
  78 |     await page.locator(`text=${assessmentCode}`).locator('..').locator('..').locator('..').locator('button:has-text("Publish")').click();
  79 |     await expect(page.locator('text=Assessment Published')).toBeVisible();
  80 |   });
  81 | });
  82 | 
```