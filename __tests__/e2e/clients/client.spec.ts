// import { test, expect } from '../fixtures.ts';
import { test, expect } from '@playwright/test';

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

test.skip('can add new Client', async ({ page }) => {
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
