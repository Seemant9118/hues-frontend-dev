import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');

  // Wait for the 'Sales' link to be available and click
  await page.getByRole('link', { name: 'Sales' }).click();

  // Wait for the 'Invoices' link to be available and click
  await page.getByRole('link', { name: 'Invoices' }).click();

  const tableContainer = page.locator('.infinite-datatable-scrollable-body');
  await expect(tableContainer).toBeVisible();

  // Wait for the content of the page to load after clicking 'Invoices'
  const firstRow = tableContainer.locator('table tbody tr:first-child');
  await expect(firstRow).toBeVisible();
});

test('is Invoice Id Visible Test', async ({ page }) => {
  await page.getByText('INV/G0IO49/2425/0017').click();
  await page.waitForTimeout(2000);
  await expect(page.getByText('INV/G0IO49/2425/0017')).toBeVisible();
  await expect(page.getByText('Rishabh (B2B)')).toBeVisible();
});

const formatCurrentDate = () => {
  const today = new Date();

  // Get day, month, and year
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
  const year = today.getFullYear();

  // Format as DD-MM-YYYY
  return `${day}-${month}-${year}`;
};

test.skip('Can Add New Invoice Test', async ({ page }) => {
  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Invoice', exact: true }).click();
  await page
    .locator(
      'div:nth-child(2) > div > .max-w-xs > .select__control > .select__value-container > .select__input-container',
    )
    .first()
    .click();
  await page.getByRole('option', { name: 'Rishabh', exact: true }).click();
  await page
    .locator(
      'div:nth-child(3) > .max-w-xs > .select__control > .select__value-container > .select__input-container',
    )
    .click();
  await page.getByRole('option', { name: 'Goods' }).click();
  await page
    .locator(
      'div:nth-child(3) > div > div > div > .css-b62m3t-container > .css-457jp6-control > .css-hlgwow > .css-19bb58m',
    )
    .click();
  await page.getByRole('option', { name: 'DummyProduct' }).click();
  await page.getByRole('spinbutton').click();
  await page.getByRole('spinbutton').fill('1');
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByRole('button', { name: 'Create' }).click();
  await page.waitForTimeout(2000);
  await page.goto('http://localhost:3000/en/sales/sales-invoices');
  await expect(
    page
      .getByRole('row', {
        name: 'Select row INV/G0IO49/2425/0008 07-03-2025 B2B Rishabh Payment pending ORD/',
      })
      .locator('div')
      .nth(2),
  ).toBeVisible({ timeout: 5000 });
});
