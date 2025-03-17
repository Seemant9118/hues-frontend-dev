import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');
  await page.waitForTimeout(2000);
  await page.getByRole('link', { name: 'Vendors' }).click({ timeout: 5000 });
  await page.waitForTimeout(3000);
});

test('Vendor list is Visible', async ({ page }) => {
  // Locate the scrollable container
  const scrollableDiv = page.locator('.overflow-auto');

  // Locate the elements to be checked
  const vendorNameCell = page.getByRole('cell', { name: 'Aayush' });
  const phoneCell = page.getByText('+91 7073455252');
  const vendorIdCell = page.getByRole('cell', { name: 'FLVPM8156A' });

  // Scroll the container until the vendor name cell is visible
  await scrollableDiv.scrollIntoViewIfNeeded();
  await vendorNameCell.scrollIntoViewIfNeeded();
  await expect(vendorNameCell).toBeVisible();

  // Scroll the container until the phone number cell is visible
  await phoneCell.scrollIntoViewIfNeeded();
  await expect(phoneCell).toBeVisible();

  // Scroll the container until the vendor ID cell is visible
  await vendorIdCell.scrollIntoViewIfNeeded();
  await expect(vendorIdCell).toBeVisible();
});

const generateFakePAN = () =>
  `${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => c)[(Math.random() * 26) | 0]}${
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      .repeat(4)
      .split('')
      .map((c) => c)[(Math.random() * 26) | 0]
  }${
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      .repeat(3)
      .split('')
      .map((c) => c)[(Math.random() * 26) | 0]
  }${
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      .repeat(2)
      .split('')
      .map((c) => c)[(Math.random() * 26) | 0]
  }${
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      .repeat(1)
      .split('')
      .map((c) => c)[(Math.random() * 26) | 0]
  }${Math.random().toString().slice(2, 6)}${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => c)[(Math.random() * 26) | 0]}`;

const uniqueName = `Dummy Vendor ${Date.now()}`;
const fakeNumber = Math.floor(1000000000 + Math.random() * 9000000000);

test.skip('can Add Vendor', async ({ page }) => {
  console.log(generateFakePAN()); // Example: "AYMBM8566H"

  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByLabel('Identifier Number (PAN) *').click();
  await page
    .getByLabel('Identifier Number (PAN) *')
    .fill(`${generateFakePAN()}`);
  await page.getByText('Continue to add new vendor').click();
  await page.locator('#name').click();
  await page.locator('#name').fill(uniqueName);
  await page.locator('#mobileNumber').click();
  await page.locator('#mobileNumber').fill(`${fakeNumber}`);
  await page.getByRole('button', { name: 'Add' }).click();
  await page.waitForTimeout(3000);
  await expect(page.getByRole('cell', { name: uniqueName })).toBeVisible({
    timeout: 5000,
  });
});
