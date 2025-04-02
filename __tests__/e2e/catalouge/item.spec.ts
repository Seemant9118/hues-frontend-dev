// import { test, expect } from '../fixtures.ts';
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');
});

test('Is Item Visible Test', async ({ page }) => {
  await page.waitForTimeout(2000);
  await page.getByRole('link', { name: 'Catalogue' }).click();
  await page.waitForTimeout(2000);

  const product = page.getByText('DummyProduct');
  const service = page.getByText('dummyservice');
  await expect(product).toBeVisible();
  await expect(service).toBeVisible();
});
