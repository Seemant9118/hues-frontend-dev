import { Browser, chromium, expect, Page } from '@playwright/test';

async function globalSetup() {
  const browser: Browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page: Page = await context.newPage();

  // Authentication steps
  await page.goto('http://localhost:3000/en/login');
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Enter a Aadhar linked phone').fill('9532751771');
  await page.getByRole('button', { name: 'Send OTP' }).click();

  await page.waitForSelector('text=Verify your number', { state: 'visible' });

  await page.getByRole('textbox').fill('8080');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(
    page.getByRole('heading', { name: 'Dashboard', exact: true }),
  ).toBeVisible();

  //  save auth satte
  await page.context().storageState({ path: './login-auth.json' });

  await browser.close();
}

export default globalSetup;
