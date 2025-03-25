import { test, expect } from '@playwright/test';

//  use only one worker to run this test

test.describe.serial('Catalouge Update Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/en/');
    await page
      .getByRole('link', { name: 'Catalogue' })
      .click({ timeout: 5000 });
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Can Update Catalouge Test', async ({ page }) => {
    await page.getByRole('button', { name: 'Update' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page
      .getByRole('row', { name: 'Select row Upload Product 123' })
      .getByLabel('Select row')
      .click();
    await page
      .getByRole('row', {
        name: 'Select row Test Product 40e47d92 New Manufacture 1234 1000',
      })
      .getByLabel('Select row')
      .click();
    await page.getByRole('button', { name: 'Add to Catalogue' }).click();
    await page.waitForURL('http://localhost:3000/en/catalogue');
    await expect(
      page.getByRole('cell', { name: 'Upload Product' }),
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Test Product 40e47d92' }),
    ).toBeVisible();
  });

  test('Can Delete Catalouge Items Test', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page
      .getByRole('row', { name: 'Select row Upload Product 123' })
      .getByLabel('Select row')
      .click();
    await page
      .getByRole('row', { name: 'Select row Test Product' })
      .getByLabel('Select row')
      .click();
    await page
      .locator('div')
      .filter({ hasText: /^Update$/ })
      .getByRole('button')
      .nth(4)
      .click();
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(
      page.getByRole('cell', { name: 'Upload Product' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Test Product 40e47d92' }),
    ).not.toBeVisible();
  });
});
