import { test, expect, Page } from '@playwright/test';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/en/');
  await page.getByRole('link', { name: 'Clients' }).click({ timeout: 5000 });
});

const search = async (page: Page, value: string, wait = 1500) => {
  const searchBox = page.getByRole('textbox', { name: 'Search' });
  await searchBox.click();
  await searchBox.fill(value);
  await delay(wait);
};

test('Search: full name match (typed) @search', async ({ page }) => {
  await search(page, 'Kamlapuri Services');
  await expect(
    page.getByRole('cell', { name: 'Kamlapuri Services' }).first(),
  ).toBeVisible();
});

test('Search: full name match (pasted) @search', async ({ page }) => {
  await search(page, 'kamlapuri services');
  await expect(
    page.getByRole('cell', { name: 'Kamlapuri Services' }).first(),
  ).toBeVisible();
});

test('Search: exact match from generated client @search', async ({ page }) => {
  await search(page, 'Dummy Client 1742814729344');
  await expect(
    page.getByRole('cell', { name: 'Dummy Client 1742814729344' }),
  ).toBeVisible();
  await expect(page.locator('td')).not.toContainText('No results.');
});

test('Search: partial match (prefix) @search', async ({ page }) => {
  await search(page, 'Kamlapuri');
  await expect(page.getByText('Kamlapuri Services')).toBeVisible();
});

test('Search: partial match (suffix) @search', async ({ page }) => {
  await search(page, 'Services');
  await expect(page.getByText('Kamlapuri Services')).toBeVisible();
});

test('Search: partial match (middle substring) @search', async ({ page }) => {
  await search(page, 'lapuri');
  await expect(
    page.getByRole('cell', { name: 'Kamlapuri Services' }).first(),
  ).toBeVisible();
});

test('Search: case-insensitive match @search', async ({ page }) => {
  await search(page, 'kAMLaPuRi SerVices');
  await expect(
    page.getByRole('cell', { name: 'Kamlapuri Services' }).first(),
  ).toBeVisible();
});

test('Search: input with leading/trailing spaces @search', async ({ page }) => {
  await search(page, '  Kamlapuri Services  ');
  await expect(
    page.getByRole('cell', { name: 'Kamlapuri Services' }).first(),
  ).toBeVisible();
});

test('Search: no match found @search', async ({ page }) => {
  await search(page, 'Nonexistent Client');
  await expect(page.locator('td')).toContainText('No results.');
});

test('Search: numeric-only input match @search', async ({ page }) => {
  await search(page, '1742814729344');
  await expect(page.getByText('Dummy Client 1742814729344')).toBeVisible();
});

test('Search: responds to Enter key @search', async ({ page }) => {
  const searchBox = page.getByRole('textbox', { name: 'Search' });
  await searchBox.click();
  await searchBox.type('Kamlapuri Services');
  await searchBox.press('Enter');
  await delay(1500);
  await expect(
    page.getByRole('cell', { name: 'Kamlapuri Services' }).first(),
  ).toBeVisible();
});

test('Search: handles long input string gracefully @search', async ({
  page,
}) => {
  await search(page, 'a'.repeat(500));
  await expect(page.locator('td')).toContainText('No results.');
});

test('Search: handles XSS/script injection safely @search', async ({
  page,
}) => {
  await search(page, '<script>alert(1)</script>');
  await expect(page.locator('td')).toContainText('No results.');
});
