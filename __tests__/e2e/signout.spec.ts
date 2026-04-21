import { test as base, expect } from '@playwright/test';

// Override global auth state — signout test starts from fresh (unauthenticated) context
const test = base.extend({
  storageState: { cookies: [], origins: [] },
});

test('Sign out clears session and redirects to login page', async ({ page }) => {
  // ── 1. Login first ─────────────────────────────────────────────────────────
  await page.goto('/en/login');

  await expect(page.getByRole('heading', { name: /Welcome to Hues/i })).toBeVisible({
    timeout: 15_000,
  });

  await page
    .getByPlaceholder('Enter your Aadhaar-linked mobile number')
    .fill('7317414274');

  await page.getByRole('button', { name: /Get OTP/i }).click();

  await expect(
    page.getByRole('heading', { name: /verify your number/i }),
  ).toBeVisible({ timeout: 15_000 });

  await page.getByRole('textbox').fill('8080');
  await page.getByRole('button', { name: /Confirm/i }).click();

  // Wait for the post-login redirect (dashboard or enterprise selection)
  await page.waitForURL(/.*(dashboard|confirmation|selection).*/, { timeout: 20_000 });

  // ── 2. Logout ──────────────────────────────────────────────────────────────
  // Open profile menu (typically in sidebar/topbar)
  await page.getByText('Profile').click();

  // Click Logout
  await page.getByText('Logout').click();

  // After logout, should redirect to login page
  await page.waitForURL('**/en/login', { timeout: 15_000 });

  await expect(page.getByText(/Welcome to Hues/i)).toBeVisible({ timeout: 10_000 });
});