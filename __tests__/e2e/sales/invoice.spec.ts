import { test, expect } from '@playwright/test';

import fs from 'fs';


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


test('Can Click on Tabs Test', async ({ page }) => {
  await page.getByRole('tab', { name: 'All' }).click();
  await expect(page.getByText('INV/G0IO49/2425/0019')).toBeVisible();
  await page.getByRole('tab', { name: 'Outstanding' }).click();
  await expect(page.getByText('INV/G0IO49/2425/0019')).toBeVisible();
  await page.getByRole('tab', { name: 'Disputed' }).click();
  await expect(page.getByText('INV/G0IO49/2425/0001')).toBeVisible();
});

test('CSV export should contain data', async ({ page }) => {
  await page.getByRole('tab', { name: 'All' }).click();
  await page
    .getByRole('row', {
      name: 'Select row INV/G0IO49/2425/0019 25-03-2025 B2B Kamlapuri Enterprises Payment',
    })
    .getByLabel('Select row')
    .click();

  // wait for download event
  const downloadPromise = page.waitForEvent('download');
  await page.locator('button:has(svg.lucide-upload)').click();
  // Wait for the download to complete
  const download = await downloadPromise;

  // Ensure the file has been downloaded
  expect(download.suggestedFilename()).toContain('.xlsx');

  // Save the file locally
  const filePath = `./e/Download/${download.suggestedFilename()}`;
  await download.saveAs(filePath);

  // Read the file contents
  const content = fs.readFileSync(filePath, 'utf-8').trim();

  // Ensure the file has data (not just headers)
  expect(content).not.toBe('');
  expect(content.split('\n').length).toBeGreaterThan(1); // More than just a header

  // Optionally, delete the file after the test
  fs.unlinkSync(filePath);
});

