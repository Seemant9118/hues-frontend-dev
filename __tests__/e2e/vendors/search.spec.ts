import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/en/');
    await page
        .getByRole('link', { name: 'Vendors' })
        .click({ timeout: 5000 });
});

test('Search Vendor Test', async ({ page }) => {
    await page.getByPlaceholder('Search...').click({ timeout: 5000 });
    await page.keyboard.type('Dummy Vendor', { delay: 100 });
    await expect(page.getByText('Dummy Vendor')).toBeVisible({ timeout: 5000 });
});

