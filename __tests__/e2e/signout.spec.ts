import { test as base, expect } from '@playwright/test';

const test = base.extend({
  // Override any global setup for auth if it exists
  storageState: undefined,
});


test('test', async ({ page }) => {
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

  // logout
  await page.getByText('Profile').click();
  await page.getByText('Logout').click();
  await page.waitForURL('http://localhost:3000/en/login')
  await expect(
    page.getByText('Welcome to Hues')
  ).toBeVisible();
});