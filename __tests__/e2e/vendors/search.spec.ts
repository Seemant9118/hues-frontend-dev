// tests/vendors/search.spec.ts
import { test, expect, Page } from '@playwright/test';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');
  await page.getByRole('link', { name: 'Vendors' }).click({ timeout: 5000 });
});

const search = async (page: Page, value: string, wait = 1500) => {
  const searchBox = page.getByRole('textbox', { name: 'Search' });
  await searchBox.click();
  await searchBox.fill(value);
  await delay(wait);
};

test('Search: Full Vendor Name by typing @search', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Search' }).click();
  // await page.getByRole('textbox', { name: 'Search' }).fill('dummy vendor');
  await page.keyboard.type('Dummy Vendor', { delay: 100 });
  await delay(1500);
  await expect(page.getByText('Dummy Vendor')).toBeVisible();
  await expect(page.getByText('No results.')).not.toBeVisible();
});

test('Search: Full Vendor Name by pasting (Kamlapuri Company) @search', async ({
  page,
}) => {
  await search(page, 'Kamlapuri Company');
  await expect(
    page.getByRole('cell', { name: 'Kamlapuri Company' }),
  ).toBeVisible();
});

test('Search: Exact ID-based Vendor Name @search', async ({ page }) => {
  await search(page, 'Dummy Vendor 1742817664675');
  await expect(
    page.getByRole('cell', { name: 'Dummy Vendor 1742817664675' }),
  ).toBeVisible();
});

test('Search: Substring from ID @search', async ({ page }) => {
  await search(page, '1741376118592');
  await expect(
    page.getByRole('cell', { name: 'Dummy Vendor 1741376118592' }),
  ).toBeVisible();
});

test('Search: partial name @search', async ({ page }) => {
  await search(page, 'Kamlapuri');
  await expect(page.getByText('Kamlapuri Company')).toBeVisible();
});

test('Search: suffix match @search', async ({ page }) => {
  await search(page, 'Company');
  await expect(page.getByText('Kamlapuri Company')).toBeVisible();
});

test('Search: middle substring match @search', async ({ page }) => {
  await search(page, 'lapuri');
  await expect(page.getByText('Kamlapuri Company')).toBeVisible();
});

test('Search: case-insensitive @search', async ({ page }) => {
  await search(page, 'kAMLaPuRi cOMPanY');
  await expect(page.getByText('Kamlapuri Company')).toBeVisible();
});

test('Search: leading/trailing spaces @search', async ({ page }) => {
  await search(page, '  Kamlapuri Company  ');
  await expect(page.getByText('Kamlapuri Company')).toBeVisible();
});

test('Search: no results @search', async ({ page }) => {
  await search(page, 'NoSuchVendorXYZ');
  await expect(page.locator('td')).toContainText('No results.');
});

test('Search: long input string @search', async ({ page }) => {
  await search(page, 'x'.repeat(500));
  await expect(page.locator('td')).toContainText('No results.');
});

test('Search: script injection safety @search', async ({ page }) => {
  await search(page, '<script>alert(1)</script>');
  await expect(page.locator('td')).toContainText('No results.');
});
