import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');
  await page.getByRole('link', { name: 'Sales' }).click({ timeout: 5000 });
  await page.getByRole('link', { name: 'Debit Notes' }).click();
});

test.describe.serial('Debit Note', () => {
  test('Check Order ID', async ({ page }) => {
    await page.getByText('DBN/IZA28P/2425/0001').click({ timeout: 5000 });
    await expect(page.getByText('DBN/IZA28P/2425/0001')).toBeVisible({
      timeout: 5000,
    });
  });
});
