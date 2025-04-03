import { test, expect } from '@playwright/test';

import fs from 'fs';


test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');
  await page.getByRole('link', { name: 'Sales' }).click();
  await page.getByRole('link', { name: 'Orders' }).click();
  await page.waitForTimeout(2000);
});

test('Is Order Present Test', async ({ page }) => {
  const tableContainer = page.locator('div.overflow-y-scroll').first();

  // await tableContainer.evaluate((container) => {
  // Scroll all the way down to ensure we can find elements at the bottom
  // container.scrollTop = container.scrollHeight;
  // });



  await page.waitForTimeout(10000);

  const orderElement = await page.getByRole('cell', {
    name: 'ORD/G0IO49/2425/0022',
  });

  // First locate the element (without asserting visibility)
  // = page.getByText('G0IO49/2425/0022');


  // Now check if it's visible
  await expect(orderElement).toBeVisible();

  // Click it after ensuring it's visible
  await orderElement.click();
  await page.waitForTimeout(2000);

  // Check for other elements
  await expect(page.getByText('Rishabh (B2B)')).toBeVisible();
});


test('Can filter Test', async ({ page }) => {
  await page.getByRole('button', { name: 'Filter' }).click();
  await page.getByPlaceholder('From').click();
  await page.getByRole('combobox').nth(1).selectOption('February');
  await page.getByLabel('Choose Wednesday, February 26th,').click();
  await page.getByPlaceholder('To').click();
  await page.getByRole('combobox').nth(1).selectOption('February');
  await page.getByLabel('Choose Wednesday, February 26th,').click();
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(
    page.getByRole('cell', { name: 'ORD/G0IO49/2425/' }),
  ).toBeVisible();
});

test('CSV export should contain data', async ({ page }) => {
  await page
    .getByRole('row', {
      name: 'Select row ORD/G0IO49/2425/0084 19-03-2025 B2B Dummy Vendor 1741376093942',
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

test('Can click on Tabs Test', async ({ page }) => {
  await page.getByRole('tab', { name: 'Under Review' }).click();
  await expect(page.getByText('ORD/G0IO49/2425/0004')).toBeVisible();
  await page.getByRole('tab', { name: 'Confirmed Orders' }).click();
  await expect(
    page.getByRole('heading', { name: 'Seamlessly manage sales, from' }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Receivables' }).click();
  await expect(page.getByText('ORD/G0IO49/2425/0084')).toBeVisible();
});


test.describe.serial('Offer Management', () => {
  test.skip('Can Create Offer Test', async ({ page }) => {
    await page.getByRole('button', { name: 'Offer' }).click();
    await page
      .locator('div')
      .filter({ hasText: /^Client\*Select Client\.\.\.$/ })
      .locator('svg')
      .click();
    await page.getByRole('option', { name: 'Rishabh', exact: true }).click();

    await page
      .locator(
        'div:nth-child(2) > div:nth-child(2) > .max-w-xs > .select__control > .select__indicators > .select__indicator',
      )
      .click();
    await page.getByRole('option', { name: 'Goods' }).click();
    await page
      .locator(
        'div:nth-child(3) > div > div > div > .css-b62m3t-container > .css-457jp6-control > .css-1wy0on6 > .css-1xc3v61-indicatorContainer',
      )
      .click();
    await page.getByRole('option', { name: 'DummyProduct' }).click();
    await page.getByRole('spinbutton').click();
    await page.getByRole('spinbutton').fill('1');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForURL('http://localhost:3000/en/sales/sales-orders');
  });

  test.skip('Can Delete Offer Test', async ({ page }) => {
    await page.getByRole('cell', { name: 'Open menu' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
  });
});
