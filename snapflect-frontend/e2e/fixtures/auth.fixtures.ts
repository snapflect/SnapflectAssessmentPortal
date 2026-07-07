import { test as base, Page, BrowserContext } from '@playwright/test';

type Personas = {
  adminPage: Page;
  authorPage: Page;
  candidatePage: Page;
  reviewerPage: Page;
  readOnlyPage: Page;
};

// Define base test with fixtures
export const test = base.extend<Personas>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, 'admin@snapflect.com', 'ChangeMeImmediately');
    await use(page);
    await context.close();
  },
  authorPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, 'content_creator@snapflect.com', 'ChangeMeImmediately');
    await use(page);
    await context.close();
  },
  candidatePage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, 'candidate@snapflect.com', 'ChangeMeImmediately');
    await use(page);
    await context.close();
  },
  reviewerPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, 'reviewer@snapflect.com', 'ChangeMeImmediately');
    await use(page);
    await context.close();
  },
  readOnlyPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, 'read_only@snapflect.com', 'ChangeMeImmediately');
    await use(page);
    await context.close();
  }
});

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for the dashboard to load indicating successful login
  await page.waitForURL('**/dashboard');
}

export { expect } from '@playwright/test';
