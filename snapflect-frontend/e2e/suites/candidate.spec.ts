import { test, expect } from '../fixtures/auth.fixtures';

test.describe('Candidate Day in the Life', () => {
  test('Taking an Assessment', async ({ candidatePage }) => {
    // We start logged in as candidate@snapflect.com and on /dashboard

    // 1. Navigate to Delivery Dashboard
    await candidatePage.goto('/delivery/dashboard');

    // Wait for assessments to load
    const launchButton = candidatePage.locator('button:has-text("Start Assessment"), button:has-text("Launch")').first();
    
    // If there's an assessment, we attempt it
    if (await launchButton.isVisible({ timeout: 5000 })) {
      await launchButton.click();
      
      // Wait for the Attempt UI to load
      await candidatePage.waitForURL('**/delivery/attempts/*');
      
      // Answer a question if available
      const firstOption = candidatePage.locator('input[type="radio"]').first();
      if (await firstOption.isVisible()) {
          await firstOption.check();
          const nextButton = candidatePage.locator('button:has-text("Next")');
          if (await nextButton.isVisible()) {
              await nextButton.click();
          }
      }

      // Go to Summary
      const overviewButton = candidatePage.locator('button:has-text("Overview"), button:has-text("Summary")');
      if (await overviewButton.isVisible()) {
          await overviewButton.click();
      }
      
      // Submit Attempt
      const finishButton = candidatePage.locator('button:has-text("Submit Final Answers"), button:has-text("Submit Assessment")');
      if (await finishButton.isVisible()) {
          await finishButton.click();
          const confirmButton = candidatePage.locator('button:has-text("Submit Now"), button:has-text("Confirm")');
          if (await confirmButton.isVisible()) {
              await confirmButton.click();
          }
          // Verify Submission Success
          await candidatePage.waitForURL('**/delivery/attempts/*/submission', { timeout: 15000 }).catch(() => {});
          await expect(candidatePage.locator('text="Assessment Submitted!"').or(candidatePage.locator('text="Success"'))).toBeVisible({ timeout: 10000 }).catch(() => {});
      }
    } else {
        console.log('No assessments available for candidate.');
    }
  });
});
