import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto'; // Node.js built-in module

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');
  await page.waitForTimeout(2000);
  await page.getByRole('link', { name: 'Item Master' }).click();
  await page.waitForTimeout(2000);
  await page.getByRole('link', { name: 'Services' }).click();
});

test.describe.serial('Services Management', () => {
  const serviceName = `Test Service ${randomUUID().substring(0, 8)}`;

  test('Can Add Service Test', async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByRole('combobox').click();
    await page.getByLabel('Services').click();
    await page.getByLabel('Service Name *').click();
    await page.getByLabel('Service Name *').fill(serviceName);
    await page.getByLabel('Description *').click();
    await page.getByLabel('Description *').fill('lorem ipsum');
    await page.getByLabel('SAC *').click();
    await page.getByLabel('SAC *').fill('1234');
    await page.getByLabel('Rate *').click();
    await page.getByLabel('Rate *').fill('1000');
    await page.getByLabel('GST (%) *').click();
    await page.getByLabel('GST (%) *').fill('18');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForURL('http://localhost:3000/en/inventory/services');
    await page.reload();
    await expect(
      page.getByRole('cell', { name: serviceName }).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test('Can Delete Service Test', async ({ page }) => {
    await page.waitForURL('http://localhost:3000/en/inventory/services');
    await page.waitForTimeout(1000);
    // Locate the row that contains the specific serviceName
    const itemRow = page.getByRole('row', { name: serviceName });

    // Click the "Open menu" button within that row
    await itemRow.getByRole('button', { name: 'Open menu' }).click();
    await page.locator('button.text-red-500').click();
    await page.waitForTimeout(1000);
    await page.locator('button.bg-primary').click();
    await page.waitForTimeout(1000);
  });
});
