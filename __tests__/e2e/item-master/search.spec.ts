import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');
  await page
    .getByRole('link', { name: 'Item Master' })
    .click({ timeout: 5000 });
});

test('Item Master/ Search Good Test - 1 @search', async ({ page }) => {
  await page.getByPlaceholder('Search...').click({ timeout: 5000 });
  await page.keyboard.type('DummyProduct', { delay: 100 });
  await expect(page.getByText('DummyProduct')).toBeVisible({ timeout: 5000 });
});

test('Item Master/ Search Good Test - 2 @search', async ({ page }) => {
  await page.getByPlaceholder('Search...').click({ timeout: 5000 });
  await page.keyboard.type('62f590d2', { delay: 100 });
  await page.waitForTimeout(2000);
  await expect(page.getByText('TEST PRODUCT 62f590d2')).toBeVisible({
    timeout: 5000,
  });
});

test('Item Master/ Search Good Test - 3 @search', async ({ page }) => {
  await page.getByPlaceholder('Search...').click({ timeout: 5000 });
  await page.keyboard.type('DUCT 62f59', { delay: 100 });
  await page.waitForTimeout(2000);
  await expect(page.getByText('TEST PRODUCT 62f590d2')).toBeVisible({
    timeout: 5000,
  });
  await expect(page.getByText('TEST PRODUCT aa3fb2b0')).not.toBeVisible({
    timeout: 5000,
  });
});

test('Item Master/ Search Service Test - 1 @search', async ({ page }) => {
  await page.getByRole('link', { name: 'Services' }).click({ timeout: 5000 });
  await page.waitForTimeout(2000);

  await page.getByPlaceholder('Search...').click();
  await page.keyboard.type('dummyservice', { delay: 100 });
  await expect(page.getByText('dummyservice')).toBeVisible({ timeout: 5000 });
});

test('Item Master/ Search Service Test - 2 @search', async ({ page }) => {
  await page.getByRole('link', { name: 'Services' }).click({ timeout: 5000 });
  await page.waitForTimeout(2000);

  await page.getByPlaceholder('Search...').click();
  await page.keyboard.type('88417b4e', { delay: 100 });
  await expect(page.getByText('Updated Service 88417b4e')).toBeVisible({
    timeout: 5000,
  });
});

test('Item Master/ Search Service Test - 3 @search', async ({ page }) => {
  await page.getByRole('link', { name: 'Services' }).click({ timeout: 5000 });
  await page.waitForTimeout(2000);

  await page.getByPlaceholder('Search...').click();
  await page.keyboard.type('vice 884', { delay: 100 });
  await expect(page.getByText('Updated Service 88417b4e')).toBeVisible({
    timeout: 5000,
  });
  await expect(page.getByText('Test Service 20280ac7')).not.toBeVisible({
    timeout: 5000,
  });
});
