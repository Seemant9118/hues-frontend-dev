import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/en/');
    await page
        .getByRole('link', { name: 'Clients' })
        .click({ timeout: 5000 });
});

test('Search Client Test', async ({ page }) => {
    await page.getByPlaceholder('Search ...').click({ timeout: 5000 });
    await page.keyboard.type('Kamlapuri Services', { delay: 100 });
    await expect(page.getByText('Kamlapuri Services')).toBeVisible({ timeout: 5000 });
});

