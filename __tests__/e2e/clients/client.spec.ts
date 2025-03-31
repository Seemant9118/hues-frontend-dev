// import { test, expect } from '../fixtures.ts';
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';


test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');
  await page.getByRole('link', { name: 'Clients' }).click({ timeout: 5000 });
});

test('Has a Client', async ({ page }) => {
  await page.waitForTimeout(3000);
  await expect(page.locator('tbody')).toContainText('Rishabh', {
    timeout: 5000,
  });
  await expect(page.getByText('+91 6614359399')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'BWAJK7603U' })).toBeVisible();
});

const generateFakePAN = () =>

  `${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => c)[(Math.random() * 26) | 0]}${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    .repeat(4)
    .split('')
    .map((c) => c)[(Math.random() * 26) | 0]
  }${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    .repeat(3)
    .split('')
    .map((c) => c)[(Math.random() * 26) | 0]
  }${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    .repeat(2)
    .split('')
    .map((c) => c)[(Math.random() * 26) | 0]
  }${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    .repeat(1)
    .split('')
    .map((c) => c)[(Math.random() * 26) | 0]
  }${Math.random().toString().slice(2, 6)}${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => c)[(Math.random() * 26) | 0]}`;

const uniqueName = `Dummy Client ${Date.now()}`;
const fakeNumber = Math.floor(1000000000 + Math.random() * 9000000000);

test('can add new Client', async ({ page }) => {

  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByLabel('Identifier Number (PAN) *').click();
  await page
    .getByLabel('Identifier Number (PAN) *')
    .fill(`${generateFakePAN()}`);
  await page.getByText('Continue to add new client').click();
  await page.locator('#name').click();
  await page.locator('#name').fill(uniqueName);
  await page.locator('#mobileNumber').click();
  await page.locator('#mobileNumber').fill(`${fakeNumber}`);
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(
    page.getByRole('cell', { name: uniqueName, exact: true }),
  ).toBeVisible();
});


test('can edit Client', async ({ page }) => {
  await page.waitForTimeout(2000);

  // Locate the client row
  const clientRow = page.getByRole('row', { name: uniqueName });

  // Open the edit menu
  await clientRow.getByRole('button', { name: 'open menu' }).click();
  await page.getByText('Edit').click();

  // Wait for edit form
  await page.waitForSelector('form');

  // Modify client details
  const newMobileNumber = Math.floor(1000000000 + Math.random() * 9000000000);
  const newUniqueName = `Updated Dummy Client ${Date.now()}`;
  await page.locator('#name').click();
  await page.locator('#name').fill(newUniqueName);
  await page.locator('#mobileNumber').click();
  await page.locator('#mobileNumber').fill(`${newMobileNumber}`);


  // Save changes
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.waitForTimeout(2000);

  // Verify that the changes are reflected in the table
  await expect(
    page.getByRole('cell', { name: newUniqueName, exact: true }),
  ).toBeVisible();
});

test('can download client list', async ({ page }) => {
  // Navigate to Clients page
  await page.goto('http://localhost:3000/en/clients');
  await page.waitForLoadState('networkidle');

  // Wait for the download event and click the download button
  const [download] = await Promise.all([
    page.waitForEvent('download'), // Wait for the file to start downloading
    page.locator('button.border-input').click()
  ]);

  // Verify that the file download is triggered
  expect(download).not.toBeNull();

  // Define a path to save the file
  const downloadPath = path.join(__dirname, 'downloads', download.suggestedFilename());
  await download.saveAs(downloadPath);

  // Ensure the file exists in the system
  expect(fs.existsSync(downloadPath)).toBeTruthy();

  // Optional: Validate file type
  expect(download.suggestedFilename()).toMatch(/\.(xlsx|xls|csv)$/);
});


test('Can Download Sample File', async ({ page }) => {
  await page.waitForURL('http://localhost:3000/en/clients');
  await page.waitForTimeout(1000);

  // Click on upload button
  await page.getByRole('button', { name: 'Upload' }).click();
  await page.waitForTimeout(1000);

  // Click on download sample file button
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByText('Sample').click()
  ]);

  // Verify that the file download is triggered
  expect(download).not.toBeNull();

  // Define a path to save the file
  const downloadPath = path.join(__dirname, 'downloads', 'clientSample.xlsx');
  await download.saveAs(downloadPath);

  // Ensure the file exists in the system
  expect(fs.existsSync(downloadPath)).toBeTruthy();

  // Optional: Validate file type
  expect(download.suggestedFilename()).toMatch(/\.(xlsx|xls|csv)$/);
});

test('Can Upload File', async ({ page }) => {
  await page.waitForURL('http://localhost:3000/en/clients');
  await page.waitForTimeout(1000);

  // Click on upload button
  await page.getByRole('button', { name: 'Upload' }).click();
  await page.waitForTimeout(1000);

  // Upload file
  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles('./__tests__/e2e/clients/downloads/clientSample.xlsx');
  await page.waitForTimeout(2000);

  await page.getByText('View').click();
  await page.waitForTimeout(2000);

  // Verify uploaded items are visible in table
  await expect(
    page.getByRole('cell', { name: 'Upload Client 123' }).first(),
  ).toBeVisible();
});

