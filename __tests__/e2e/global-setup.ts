import { Browser, chromium, Page } from '@playwright/test';

async function globalSetup() {
  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page: Page = await context.newPage();

  try {
    // Navigate to locale-specific login
    await page.goto('http://localhost:3000/en/login', {
      waitUntil: 'networkidle',
      timeout: 30_000,
    });

    // Wait for the login form to be ready
    await page
      .getByPlaceholder('Enter your Aadhaar-linked mobile number')
      .waitFor({ state: 'visible', timeout: 20_000 });

    // 1. Enter Phone
    await page
      .getByPlaceholder('Enter your Aadhaar-linked mobile number')
      .fill('7317414274');
    await page.getByRole('button', { name: /Get OTP/i }).click();

    // 2. Wait for OTP screen
    await page.waitForSelector("text=Let", { state: 'visible', timeout: 15_000 });

    // 3. Enter OTP
    await page.getByRole('textbox').fill('8080');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Confirm/i }).click();

    // 4. Wait for redirect after login
    await page.waitForURL(/.*(dashboard|login|confirmation|selection).*/, {
      timeout: 20_000,
    });

    // 5. Wait for tokens to land in localStorage (retry up to 8s)
    const tokensFound = await page
      .waitForFunction(
        () =>
          localStorage.getItem('token') !== null &&
          localStorage.getItem('refreshtoken') !== null,
        { timeout: 8_000 },
      )
      .then(() => true)
      .catch(() => false);

    if (!tokensFound) {
      console.warn(
        '[global-setup] WARNING: Tokens not found in localStorage after redirect. Auth state may be stale.',
      );
    }

    // 6. Allow background permission/enterprise checks to settle
    await page.waitForTimeout(1_500);

    // 7. Save state
    await page.context().storageState({ path: './login-auth.json' });
    console.log('[global-setup] Auth state saved to login-auth.json');
  } catch (err) {
    console.error('[global-setup] Login flow failed:', err);
    throw err; // Fail fast — don't proceed with broken auth
  } finally {
    await browser.close();
  }
}

export default globalSetup;
