import { test, expect } from '@playwright/test';


test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/en/');
    await page.getByRole('link', { name: 'Notifications' }).click({ timeout: 5000 });
});


test('Has Notifications', async ({ page }) => {
    await page.waitForTimeout(3000);

    // Select all rows in the notifications table
    const rows = await page.locator('table tbody tr');

    // Ensure that there is at least one row in the table
    await expect(await rows.count()).toBeGreaterThan(0);
});

test.describe('Filter Notifications', () => {
    test('Filter by Invoice', async ({ page }) => {
        await page.getByRole('button', { name: 'Filters' }).click();
        const invoiceCheckbox = page.locator('label:has-text("Invoice")');
        await invoiceCheckbox.waitFor({ state: 'visible', timeout: 5000 }); // Wait until visible
        await invoiceCheckbox.check();
        await page.waitForTimeout(1000);
        await page.getByRole('button', { name: 'Apply' }).click();

        const rows = await page.locator('table tbody tr');
        await expect(await rows.count()).toBeGreaterThan(0);
        // Wait for table cells to be visible
        const invoiceCell = page.locator('table tbody tr td').filter({ hasText: 'Invoice' });
        await expect(invoiceCell.first()).toBeVisible();
        await page.waitForTimeout(2000);
    });

    test('Filter by Order', async ({ page }) => {
        await page.getByRole('button', { name: 'Filters' }).click();
        const orderCheckbox = page.locator('label:has-text("Order")');
        await orderCheckbox.waitFor({ state: 'visible', timeout: 5000 }); // Wait until visible
        await orderCheckbox.check();
        await page.waitForTimeout(1000);
        await page.getByRole('button', { name: 'Apply' }).click();

        const rows = await page.locator('table tbody tr');
        await expect(await rows.count()).toBeGreaterThan(0);
        // Wait for table cells to be visible
        const orderCell = page.locator('table tbody tr td').filter({ hasText: 'Order' });
        await expect(orderCell.first()).toBeVisible();
        await page.waitForTimeout(2000);
    });

    test('Filter by Invitation', async ({ page }) => {
        await page.getByRole('button', { name: 'Filters' }).click();
        const invitationCheckbox = page.locator('label:has-text("Invitation")');
        await invitationCheckbox.waitFor({ state: 'visible', timeout: 5000 }); // Wait until visible
        await invitationCheckbox.check();
        await page.waitForTimeout(1000);
        await page.getByRole('button', { name: 'Apply' }).click();

        const rows = await page.locator('table tbody tr');
        await expect(await rows.count()).toBeGreaterThan(0);
        // Wait for table cells to be visible
        const invitationCell = page.locator('table tbody tr td').filter({ hasText: 'Invitation' });
        await expect(invitationCell.first()).toBeVisible();
        await page.waitForTimeout(2000);
    });

    test('Filter by Order Negotiation', async ({ page }) => {
        await page.getByRole('button', { name: 'Filters' }).click();
        const negotiationCheckbox = page.locator('label:has-text("Order Negotiaion")');
        await negotiationCheckbox.waitFor({ state: 'visible', timeout: 5000 }); // Wait until visible
        await negotiationCheckbox.check();
        await page.waitForTimeout(1000);
        await page.getByRole('button', { name: 'Apply' }).click();

        const rows = await page.locator('table tbody tr');
        await expect(await rows.count()).toBeGreaterThan(0);
        // Wait for table cells to be visible
        const negotiationCell = page.locator('table tbody tr td').filter({ hasText: 'Order_negotiation' });
        await expect(negotiationCell.first()).toBeVisible();
        await page.waitForTimeout(2000);
    });

    test('Clear Filters', async ({ page }) => {
        await page.getByRole('button', { name: 'Filters' }).click()
        await page.getByRole('button', { name: 'Clear' }).click();

        const rows = await page.locator('table tbody tr');
        await expect(await rows.count()).toBeGreaterThan(0); // Should reset and show all notifications
        await page.waitForTimeout(2000);
    });
});


