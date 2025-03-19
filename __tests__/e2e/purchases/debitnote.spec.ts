import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');
  await page.getByRole('link', { name: 'Purchases' }).click();
  await page.getByRole('link', { name: 'Debit Notes' }).click();
});

test('should first', async ({ page }) => {
  await page.getByText('DBN/G0IO49/2425/').click();
  await page.getByPlaceholder('Type your comment here...').click();
  await page.getByPlaceholder('Type your comment here...').fill('comment');
  await page
    .locator('div')
    .filter({ hasText: /^comment$/ })
    .getByRole('img')
    .nth(2)
    .click();
  await expect(page.getByText('comment').nth(1)).toBeVisible();
});
