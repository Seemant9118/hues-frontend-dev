import { test as base, expect } from '@playwright/test';

// Override global auth state — signin tests start from a fresh (unauthenticated) context
const test = base.extend({
  storageState: { cookies: [], origins: [] },
});

test.beforeEach(async ({ page }) => {
  await page.goto('/en/login');
  // Wait for the login page heading to confirm the page loaded
  await expect(page.getByRole('heading', { name: /Welcome to Hues/i })).toBeVisible({
    timeout: 15_000,
  });
});

test('Can Sign In with right Creds', async ({ page }) => {
  // Fill mobile number with the Aadhaar-linked placeholder text (current UI)
  await page
    .getByPlaceholder('Enter your Aadhaar-linked mobile number')
    .fill('7317414274');

  await page.getByRole('button', { name: /Get OTP/i }).click();

  // Wait for OTP screen
  await expect(
    page.getByRole('heading', { name: /verify your number/i }),
  ).toBeVisible({ timeout: 15_000 });

  // Fill OTP
  await page.getByRole('textbox').fill('8080');
  await page.getByRole('button', { name: /Confirm/i }).click();

  // Should redirect to dashboard or selection screen after valid OTP
  await page.waitForURL(/.*(dashboard|confirmation|selection).*/, {
    timeout: 20_000,
  });
});

test('Cannot Sign In with Wrong OTP', async ({ page }) => {
  await page
    .getByPlaceholder('Enter your Aadhaar-linked mobile number')
    .fill('7317414274');

  await page.getByRole('button', { name: /Get OTP/i }).click();

  await expect(
    page.getByRole('heading', { name: /verify your number/i }),
  ).toBeVisible({ timeout: 15_000 });

  // Enter a wrong OTP
  await page.getByRole('textbox').fill('0000');
  await page.getByRole('button', { name: /Confirm/i }).click();

  // Should show an error message (OTP invalid)
  await expect(page.getByText(/OTP didn't work|Invalid OTP|incorrect/i)).toBeVisible({
    timeout: 10_000,
  });
});
