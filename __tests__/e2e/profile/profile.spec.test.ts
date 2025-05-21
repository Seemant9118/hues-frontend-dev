import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/en/');
    await page.getByRole('button', { name: 'Profile' }).click({ timeout: 5000 });
    await page.getByText('View Profile').click({ timeout: 5000 });
});

test.describe('Profile Section Tabs', () => {
    test('Tab Switching', async ({ page }) => {
        // Verify default tab is Overview
        await expect(page.getByText('Profile Picture')).toBeVisible();

        // Click on Enterprise Overview tab
        await page.getByRole('tab', { name: 'Enterprise Overview' }).click();

        // Verify Enterprise Logo appears in Enterprise Overview tab
        await expect(page.getByText('Enterprise Logo')).toBeVisible();

        // Click on Languages tab
        await page.getByRole('tab', { name: 'Languages' }).click();

        // Verify Languages dropdown appear
        await expect(page.getByText('Select Preferred Language')).toBeVisible();

        // Click on Permissions tab
        await page.getByRole('tab', { name: 'Permissions' }).click();

        // Verify Languages dropdown appear
        await expect(page.getByText('Coming Soon...')).toBeVisible();
    });

    test('Enterprise Update Details', async ({ page }) => {
        // Click on Enterprise Overview tab
        await page.getByRole('tab', { name: 'Enterprise Overview' }).click();

        // Ensure Enterprise Logo appears in Enterprise Overview tab
        await expect(page.getByText('Enterprise Logo')).toBeVisible();

        // Click on pencil icon to update GST
        await page.locator('[data-testid="edit-gst"]').click();

        // Ensure input field appears
        const gstInput = page.getByPlaceholder('Update GST IN');
        await expect(gstInput).toBeVisible();

        // Fill the input field - need correct data for test
        await gstInput.fill('IYBPK0035Gf12545');

        // Click Update button
        await page.getByRole('button', { name: 'Update' }).click();
    });

    test('Switch Language for Platform', async ({ page }) => {
        // Click on the Languages tab
        await page.getByRole('tab', { name: 'Languages' }).click();

        // Verify the Languages dropdown appears
        await expect(page.getByText('Select Preferred Language')).toBeVisible();

        // Click on the dropdown to open language options
        const languageDropdown = page.getByRole('combobox');
        await languageDropdown.click();

        // Ensure Hindi is available before selecting
        await expect(page.getByRole('option', { name: 'Hindi' })).toBeVisible();

        // Select Hindi using keyboard navigation
        await languageDropdown.press('ArrowDown'); // Navigate to Hindi
        await languageDropdown.press('Enter'); // Confirm selection

        // Verify that the URL has changed to /hi/profile
        await expect(page).toHaveURL(/^http:\/\/localhost:3000\/hi\/profile$/);
    });

    test('Logout from Profile', async ({ page }) => {
        await page.getByRole('button', { name: 'Logout' }).click();

        await page.waitForTimeout(3000);

        await expect(page).toHaveURL('http://localhost:3000/en/login');
    });
});
