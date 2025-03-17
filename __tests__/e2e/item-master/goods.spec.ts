import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto'; // Node.js built-in module

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');
  await page.waitForTimeout(2000);
  await page.getByText('Item Master').click({ timeout: 10000 });
  await page.waitForTimeout(2000);
});

test.describe.serial('Goods Management', () => {
  const goodName = `Test Product ${randomUUID().substring(0, 8)}`;

  test('Can Add Good Test', async ({ page }) => {
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.waitForTimeout(2000);
    await page.getByRole('combobox').click({ timeout: 50000 });
    await page.getByLabel('Goods').click();
    await page.getByLabel('Product Name *').click();
    await page.getByLabel('Product Name *').fill(goodName);
    await page.getByLabel("Manufacturer's Name *").click();
    await page.getByLabel("Manufacturer's Name *").fill('New Manufacture');
    await page.getByLabel('Description *').click();
    await page.getByLabel('Description *').fill('lorem ipsum');
    await page.getByLabel('HSN Code *').click();
    await page.getByLabel('HSN Code *').fill('1234');
    await page.getByLabel('Rate *').click();
    await page.getByLabel('Rate *').fill('1000');
    await page.getByLabel('GST (%) *').click();
    await page.getByLabel('GST (%) *').fill('18');
    await page.getByLabel('Quantity *').click();
    await page.getByLabel('Quantity *').fill('5');
    await page.getByLabel('Batch').click();
    await page.getByLabel('Batch').fill('20250227');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForURL('http://localhost:3000/en/inventory/goods');
    await expect(
      page.getByRole('cell', { name: goodName }).first(),
    ).toBeVisible();
  });

  test('Can Delete Good Test', async ({ page }) => {
    await page.waitForURL('http://localhost:3000/en/inventory/goods');
    await page.waitForTimeout(1000);
    // Locate the row that contains the specific goodName
    const itemRow = page.getByRole('row', { name: goodName });

    // Click the "Open menu" button within that row
    await itemRow.getByRole('button', { name: 'Open menu' }).click();
    await page.locator('button.text-red-500').click();
    await page.waitForTimeout(1000);
    await page.locator('button.bg-primary').click();
    await page.waitForTimeout(1000);
  });
});
