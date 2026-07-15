const { chromium } = require('playwright');
const path = require('path');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function captureRest() {
  const browser = await chromium.launch({ headless: true });
  
  const baseUrl = 'http://localhost:4200';
  const outDir = path.join(__dirname, 'screenshots');
  const fs = require('fs');
  if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
  }

  // Context 1: Screen 1 (Login)
  console.log('Capturing Screen 1...');
  const ctx1 = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page1 = await ctx1.newPage();
  await page1.goto(`${baseUrl}/auth/login`);
  await delay(2000);
  await page1.screenshot({ path: path.join(outDir, 'screen1.png') });
  
  // Context 2: Screen 5 (Candidate Delivery)
  console.log('Capturing Screen 5...');
  await page1.fill('input[formControlName="email"], input[type="email"]', 'candidate@snapflect.com');
  await page1.fill('input[formControlName="password"], input[type="password"]', 'ChangeMeImmediately');
  await page1.click('button[type="submit"]');
  await page1.waitForURL('**/*');
  await delay(3000);
  
  // Need to navigate to a specific assessment for the candidate delivery experience
  await page1.goto(`${baseUrl}/delivery/dashboard`);
  await delay(2000);
  await page1.screenshot({ path: path.join(outDir, 'screen5.png') });
  
  await browser.close();
  console.log('Done!');
}

captureRest().catch(err => {
    console.error(err);
    process.exit(1);
});
