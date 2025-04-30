import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');
  await page.getByRole('link', { name: 'Catalogue' }).click({ timeout: 5000 });
});

test('Catalouge/ Search Exact Product Test - 1 @search', async ({ page }) => {
  // check if a product is listed on searching
  await page.getByPlaceholder('Search...').click();
  await page.keyboard.type('DummyProduct', { delay: 100 });
  await expect(page.getByText('DummyProduct')).toBeVisible({ timeout: 5000 });
});

test('Catalouge/ Search Exact Service Test @search', async ({ page }) => {
  // check if a service is listed on searching
  await page.getByPlaceholder('Search...').click();
  await page.keyboard.type('dummyservice', { delay: 100 });
  await expect(page.getByText('dummyservice')).toBeVisible({ timeout: 5000 });
});

test('Catalouge/ Search substring of Product Name Test @search', async ({
  page,
}) => {
  // check if a service is listed on searching
  await page.getByPlaceholder('Search...').click();
  await page.keyboard.type('mmyPro', { delay: 100 });
  await expect(page.getByText('DummyProduct')).toBeVisible({ timeout: 5000 });
});
test('Catalouge/ Search manufacturer Name of a Product Test - 1 @search', async ({
  page,
}) => {
  // check if a service is listed on searching
  await page.getByPlaceholder('Search...').click();
  await page.keyboard.type('Nutella', { delay: 100 });
  await expect(page.getByText('DummyProduct')).toBeVisible({ timeout: 5000 });
});
