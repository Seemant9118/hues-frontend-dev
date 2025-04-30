import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');
  await page.getByRole('link', { name: 'Vendors' }).click({ timeout: 5000 });
});

test('Vendors/ Search Full Vendor Name by typing Test @search', async ({
  page,
}) => {
  await page.getByPlaceholder('Search...').click({ timeout: 5000 });
  await page.keyboard.type('Dummy Vendor', { delay: 100 });
  await expect(page.getByText('Dummy Vendor')).toBeVisible({ timeout: 5000 });
});

test('Vendors/ Search Full Vendor Name by typing Test - 1 @search', async ({
  page,
}) => {
  await page.getByRole('textbox', { name: 'Search' }).click();
  await page.getByRole('textbox', { name: 'Search' }).fill('Kamlapuri Company');
  await expect(
    page.getByRole('cell', { name: 'Kamlapuri Company' }),
  ).toBeVisible();
});

test('Vendors/ Search Full Vendor Name by typing Test - 2 @search', async ({
  page,
}) => {
  await page.getByRole('textbox', { name: 'Search' }).click();
  await page
    .getByRole('textbox', { name: 'Search' })
    .fill('Dummy Vendor 1741376118592');
  await page.waitForTimeout(2000);
  await expect(
    page.getByRole('cell', { name: 'Dummy Vendor 1741376118592' }),
  ).toBeVisible();
});

test('Vendors/ Search Vendor Name by typing substring Test - 3 @search', async ({
  page,
}) => {
  await page.getByRole('textbox', { name: 'Search' }).click();
  await page.getByRole('textbox', { name: 'Search' }).fill('1741376118592');
  await page.waitForTimeout(2000);
  await expect(
    page.getByRole('cell', { name: 'Dummy Vendor 1741376118592' }),
  ).toBeVisible();
});
