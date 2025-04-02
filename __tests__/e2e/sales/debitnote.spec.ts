import { test, expect } from '@playwright/test';

import fs from 'fs';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.getByRole('link', { name: 'Sales' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.getByRole('link', { name: 'Debit Notes' }).click();

});

test.describe.serial('Debit Note', () => {
  test('Check Order ID', async ({ page }) => {

    await page.getByText('DBN/IZA28P/2425/0001').click({ timeout: 5000 });
    await expect(page.getByText('DBN/IZA28P/2425/0001')).toBeVisible({
      timeout: 5000,
    });
  });


  test('Can Export Data', async ({ page }) => {
    await page.waitForTimeout(5000);

    // wait for download event
    const downloadPromise = page.waitForEvent('download');
    await page.getByLabel('Select all').click();
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('button:has(svg.lucide-upload)').click();
    // Wait for the download to complete
    const download = await downloadPromise;

    // Ensure the file has been downloaded
    expect(download.suggestedFilename()).toContain('.xlsx');

    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

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

});
