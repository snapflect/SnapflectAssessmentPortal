const { chromium } = require('playwright');
const path = require('path');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  const baseUrl = 'http://localhost:4200';
  const outDir = path.join(__dirname, 'screenshots');
  const fs = require('fs');
  if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
  }

  console.log('Logging in as admin...');
  await page.goto(`${baseUrl}/auth/login`);
  await page.fill('input[formControlName="email"], input[type="email"]', 'admin@snapflect.com');
  await page.fill('input[formControlName="password"], input[type="password"]', 'ChangeMeImmediately');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  
  // Wait a bit for charts/data to load
  await delay(3000);
  
  // Screen 2: Admin Dashboard Home
  console.log('Capturing Screen 2...');
  await page.screenshot({ path: path.join(outDir, 'screen2.png') });
  
  // Screen 3: Blueprint Designer
  console.log('Capturing Screen 3...');
  await page.goto(`${baseUrl}/authoring/blueprints`);
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, 'screen3.png') });
  
  // Screen 4: Question Bank & Competency Mapping
  console.log('Capturing Screen 4...');
  await page.goto(`${baseUrl}/authoring/question-banks`);
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, 'screen4.png') });
  
  // Screen 6: Session Monitor
  console.log('Capturing Screen 6...');
  await page.goto(`${baseUrl}/delivery/monitor`);
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, 'screen6.png') });

  // Screen 7: Reviewer Dashboard & Manual Review
  console.log('Capturing Screen 7...');
  await page.goto(`${baseUrl}/scoring/manual`);
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, 'screen7.png') });
  
  // Screen 8: Results Dashboard & Candidate Score Card
  // Not entirely sure which route, let's try /results/analytics or /results/dashboard if it exists
  console.log('Capturing Screen 8...');
  await page.goto(`${baseUrl}/results/analytics`);
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, 'screen8.png') });
  
  // Screen 9: Analytics Dashboard
  console.log('Capturing Screen 9...');
  await page.goto(`${baseUrl}/analytics/heatmaps`);
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, 'screen9.png') });
  
  // Screen 10: Certificates
  console.log('Capturing Screen 10...');
  await page.goto(`${baseUrl}/certificates`);
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, 'screen10.png') });
  
  // Screen 11: Governance & Billing
  console.log('Capturing Screen 11...');
  await page.goto(`${baseUrl}/governance/billing`);
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, 'screen11.png') });
  
  console.log('Logging out...');
  await context.clearCookies();
  
  console.log('Logging in as candidate...');
  await page.goto(`${baseUrl}/auth/login`);
  await page.fill('input[formControlName="email"], input[type="email"]', 'candidate@snapflect.com');
  await page.fill('input[formControlName="password"], input[type="password"]', 'ChangeMeImmediately');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/*');
  
  // Capture Screen 1: Login
  // Wait, I should capture Login screen while logged out.
  
  // Screen 5: Candidate Delivery Experience
  console.log('Capturing Screen 5...');
  await page.goto(`${baseUrl}/delivery/dashboard`);
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, 'screen5.png') });
  
  console.log('Logging out...');
  await context.clearCookies();
  
  // Screen 1: Login & Multi-Tenant Access
  console.log('Capturing Screen 1...');
  await page.goto(`${baseUrl}/auth/login`);
  await delay(2000);
  await page.screenshot({ path: path.join(outDir, 'screen1.png') });
  
  await browser.close();
  console.log('Done!');
}

capture().catch(err => {
    console.error(err);
    process.exit(1);
});
