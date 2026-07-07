import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import * as path from 'path';

test.describe('Candidate Delivery E2E Flow', () => {

  const candidateEmail = 'candidate@snapflect.com';
  const candidatePassword = 'ChangeMeImmediately';

  test.beforeAll(() => {
    // Reset database to ensure clean state
    console.log('Resetting backend database...');
    try {
      execSync('php artisan migrate:fresh --seed', { 
        cwd: path.resolve(__dirname, '../../../snapflect_backend'),
        stdio: 'inherit'
      });
      console.log('Database reset successful.');
    } catch (e) {
      console.error('Failed to reset database:', e);
    }
  });

  test('should access dashboard, start assessment, answer questions, and submit', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes timeout for E2E flow
    
    // 1. Login as Candidate
    await page.goto('/auth/login');
    
    // Setup API logging for dashboard to see what backend returns
    page.on('response', async response => {
      if (response.url().includes('/delivery/my-assessments') && response.request().method() === 'GET') {
        const json = await response.json().catch(() => null);
        console.log('GET /delivery/my-assessments response:', JSON.stringify(json, null, 2));
      }
    });

    // Fill credentials
    const emailLocator = page.locator('input[type="email"], input[formcontrolname="email"], input[name="email"]');
    await emailLocator.fill(candidateEmail);
    
    const passwordLocator = page.locator('input[type="password"], input[formcontrolname="password"], input[name="password"]');
    await passwordLocator.fill(candidatePassword);
    
    await page.locator('button[type="submit"]').click();

    // 2. Navigate to the Candidate Dashboard `/delivery`
    // Wait for the redirect after login
    await page.waitForURL('**/delivery/dashboard', { timeout: 15000 }).catch(() => {});
    
    // If not auto-redirected to delivery/dashboard, navigate explicitly
    if (!page.url().includes('/delivery/dashboard')) {
      await page.goto('/delivery/dashboard');
    }

    // 3. Locate the "E2E Demo Assessment" and click "Start"
    console.log("PAGE HTML DUMP:", await page.content());
    const assessmentCard = page.locator('text="E2E Demo Assessment"').locator('xpath=ancestor::div[contains(@class, "card") or contains(@class, "assessment") or contains(@class, "glass-card")]|ancestor::tr').first();
    
    // Fallback if structured card isn't found
    const startButton = assessmentCard.locator('button:has-text("Start"), a:has-text("Start"), button:has-text("Start Assessment")').first();
    
    if (await startButton.isVisible()) {
      await startButton.click();
    } else {
      // Direct click on any Start button if layout differs
      await page.locator('button:has-text("Start"), a:has-text("Start"), button:has-text("Start Assessment")').first().click();
    }

    // 4. Accept the instructions and begin the timer (if applicable)
    // We just check if the accept checkbox is there. If it is, we are on the start page.
    const acceptCheckbox = page.locator('input[type="checkbox"]');
    const beginButton = page.locator('button:has-text("Begin"), button:has-text("Start Timer"), button:has-text("Accept"), button:has-text("Start Assessment Now")').first();
    
    // Use Promise.race or a smart locator wait to see if we hit the Start page or Question page directly
    const questionText = page.locator('text="What is 2+2?"');
    
    // Wait for either the begin button OR the question text to appear
    await expect(beginButton.or(questionText)).toBeVisible({ timeout: 15000 });

    if (await beginButton.isVisible()) {
      if (await acceptCheckbox.isVisible()) {
        await acceptCheckbox.check();
      }
      await beginButton.click();
      // Wait for question page to load
      await expect(questionText).toBeVisible({ timeout: 15000 });
    }

    // 5. Read the first question and select an option
    // Select the "4" option
    const optionLabel = page.locator('text="4"').first();
    await optionLabel.click();

    // Navigate to the next question / summary
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Overview")').first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // 6. Submit the assessment
    const submitButton = page.locator('button:has-text("Submit Final Answers"), button:has-text("Submit Assessment")').first();
    try {
      await submitButton.waitFor({ state: 'visible', timeout: 15000 });
      await submitButton.click();
    } catch (e) {
      console.log("Submit button not visible", e);
    }

    // 6. Confirm Submission Dialog
    page.on('response', async response => {
      if (response.url().includes('/submit')) {
        console.log('SUBMIT RESPONSE:', await response.text());
      }
    });

    const confirmButton = page.locator('button:has-text("Submit Now")');
    try {
      await confirmButton.waitFor({ state: 'visible', timeout: 5000 });
      await confirmButton.click();
    } catch (e) {
      console.log("Confirm button not visible", e);
    }

    // 7. Verify submission page or results page
    const successText = page.locator('text="Assessment Submitted!"').or(page.locator('text="100%"')).or(page.locator('text="Score"')).or(page.locator('text="Thank you"')).first();
    await expect(successText).toBeVisible({ timeout: 15000 });
  });
});
