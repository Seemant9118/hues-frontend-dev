import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');
  await page.getByRole('link', { name: 'Clients' }).click({ timeout: 5000 });
});

test('Search Client Test @search', async ({ page }) => {
  await page.getByPlaceholder('Search ...').click({ timeout: 5000 });
  await page.keyboard.type('Kamlapuri Services', { delay: 100 });
  await expect(page.getByText('Kamlapuri Services')).toBeVisible({
    timeout: 5000,
  });
});

test('Search Client Test - 1 @search', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Search' }).click();
  await page
    .getByRole('textbox', { name: 'Search' })
    .fill('kamlapuri services');
  await expect(
    page.getByRole('cell', { name: 'Kamlapuri Services' }).first(),
  ).toBeVisible();
});

test('Search Client Test - 2 @search', async ({ page }) => {
  await page
    .getByRole('textbox', { name: 'Search' })
    .fill('Dummy Client 1742814729344');
  await expect(
    page.getByRole('cell', { name: 'Dummy Client 1742814729344' }),
  ).toBeVisible();
  await expect(page.locator('td')).not.toContainText('No results.');
});

test('Search Client Test - 3 @search', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Search' }).fill('Client 174281472');
  await expect(
    page.getByRole('cell', { name: 'Dummy Client 1742814729344' }),
  ).toBeVisible();
  await expect(page.locator('td')).not.toContainText('No results.');
});
