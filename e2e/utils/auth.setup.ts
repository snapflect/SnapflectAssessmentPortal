import { Page, expect } from '@playwright/test';

/**
 * Utility function to login a user.
 * Assumes the presence of standard email and password input fields.
 * Validates redirection to the /dashboard page after a successful login.
 */
export async function loginAsUser(page: Page, email: string, password: string = 'Password123!') {
  await page.goto('/auth/login');
  
  // Use generic locators to accommodate different angular implementations 
  // (e.g. formControlName, name, or id)
  const emailInput = page.locator('input[type="email"], input[name="email"], input[formControlName="email"], #email').first();
  await emailInput.fill(email);
  
  const passwordInput = page.locator('input[type="password"], input[name="password"], input[formControlName="password"], #password').first();
  await passwordInput.fill(password);
  
  const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
  await submitButton.click();
  
  // Verify redirection to the dashboard
  await expect(page).toHaveURL(/.*\/dashboard/);
}
