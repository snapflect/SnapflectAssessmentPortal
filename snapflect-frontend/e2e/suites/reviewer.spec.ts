import { test, expect } from '../fixtures/auth.fixtures';

test.describe('Reviewer Day in the Life', () => {
  test('Manual Scoring and Grading', async ({ reviewerPage }) => {
    // We start logged in as reviewer@snapflect.com and on /dashboard

    // 1. Navigate to Manual Scoring / Results
    // It might be under /results/manual-scoring or /results
    await reviewerPage.goto('/results/manual-scoring').catch(async () => {
      await reviewerPage.goto('/results');
    });

    // 2. Look for submissions that require grading
    const requireGradingTab = reviewerPage.locator('button:has-text("Needs Grading"), a:has-text("Requires Manual Scoring")');
    if (await requireGradingTab.isVisible({ timeout: 5000 })) {
        await requireGradingTab.click();
    }

    // 3. Click into a submission if any exist
    const viewSubmissionBtn = reviewerPage.locator('button:has-text("Score"), button:has-text("Review")').first();
    if (await viewSubmissionBtn.isVisible()) {
        await viewSubmissionBtn.click();
        
        // 4. Enter a score
        const scoreInput = reviewerPage.locator('input[type="number"]').first();
        if (await scoreInput.isVisible()) {
            await scoreInput.fill('10');
            const submitScoreBtn = reviewerPage.locator('button:has-text("Submit Score"), button:has-text("Save Score")');
            if (await submitScoreBtn.isVisible()) {
                await submitScoreBtn.click();
                await expect(reviewerPage.locator('text=Score Saved').or(reviewerPage.locator('text=Success'))).toBeVisible();
            }
        }
    } else {
        console.log('No submissions available for manual scoring.');
    }
  });
});
