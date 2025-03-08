import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');
  await page
    .getByRole('link', { name: 'Item Master' })
    .click({ timeout: 5000 });
});

test('Search Good Test', async ({ page }) => {
  await page.getByPlaceholder('Search...').click({ timeout: 5000 });
  await page.keyboard.type('DummyProduct', { delay: 100 });
  await expect(page.getByText('DummyProduct')).toBeVisible({ timeout: 5000 });
});

test('Search Service Test', async ({ page }) => {
  await page.getByRole('link', { name: 'Services' }).click({ timeout: 5000 });
  await page.waitForTimeout(2000);

  await page.getByPlaceholder('Search...').click();
  await page.keyboard.type('dummyservice', { delay: 100 });
  await expect(page.getByText('dummyservice')).toBeVisible({ timeout: 5000 });
});
