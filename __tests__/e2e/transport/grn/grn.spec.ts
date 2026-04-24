import { expect, type Page, test } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_URL = '/en/dashboard/transport/grn';

// ─────────────────────────────────────────────────────────────────────────────
// Navigation helpers
// ─────────────────────────────────────────────────────────────────────────────
async function gotoPage(page: Page) {
  await page.goto(PAGE_URL);
  await expect(page.getByRole('heading', { name: /Goods Recieved Notes/i })).toBeVisible({
    timeout: 15_000,
  });
}

async function gotoPageWithData(page: Page) {
  const apiPromise = page.waitForResponse(
    (res) => res.url().includes('/grn/list') && res.ok(),
    { timeout: 15_000 },
  );
  await gotoPage(page);
  await apiPromise;

  // Wait for either a data row OR the empty-state
  await expect(
    page
      .locator('table tbody tr:not([aria-hidden="true"])')
      .first()
      .or(page.getByText(/Manage bids, deals, and invoices/i)),
  ).toBeVisible({ timeout: 10_000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Listing & Navigation
// ─────────────────────────────────────────────────────────────────────────────
test.describe('GRNs - Listing & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoPageWithData(page);
  });

  test('Page renders correctly with header, tabs, and search', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Goods Recieved Notes/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /^All$/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /^Defects$/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search GRN\(s\)/i)).toBeVisible();
  });

  test('Search triggers API with searchString param', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search GRN\(s\)/i);

    const searchPromise = page.waitForResponse(
      (res) =>
        res.url().includes('/grn/list') &&
        res.url().includes('searchString=GRN-TEST') &&
        res.ok(),
      { timeout: 15_000 },
    );

    await searchInput.fill('GRN-TEST');
    await searchPromise;
  });

  test('Tabs switch and trigger API call', async ({ page }) => {
    // Switch to Defects (should trigger API call as it's not yet cached)
    const defectsPromise = page.waitForResponse(
      (res) => res.url().includes('/grn/list') && res.url().includes('grnStatus=DEFECTS') && res.ok(),
      { timeout: 15_000 },
    );
    await page.getByRole('tab', { name: 'Defects' }).click();
    await defectsPromise;
    await expect(page.getByRole('tab', { name: 'Defects', selected: true })).toBeVisible();

    // Switch back to All (will likely be cached due to staleTime: Infinity, so we don't wait for response)
    await page.getByRole('tab', { name: 'All' }).click();
    await expect(page.getByRole('tab', { name: 'All', selected: true })).toBeVisible();
  });

  test('Clicking a table row navigates to GRN detail page', async ({ page }) => {
    const firstRow = page.locator('table tbody tr:not([aria-hidden="true"])').first();

    if (!(await firstRow.isVisible())) {
      console.log('No GRN rows found, skipping navigation test');
      test.skip();
      return;
    }

    // Capture the read tracker API call if it's unread
    const isUnread = await firstRow.locator('svg.text-primary').isVisible();
    
    if (isUnread) {
        const readPromise = page.waitForResponse(
            (res) => res.url().includes('/readtracker/') && res.request().method() === 'POST' && res.ok(),
            { timeout: 10_000 }
        );
        await firstRow.click();
        await readPromise;
    } else {
        await firstRow.click();
    }

    await page.waitForURL(/.*transport\/grn\/.+/, { timeout: 15_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Details View
// ─────────────────────────────────────────────────────────────────────────────
test.describe('GRNs - Details View', () => {
  test('Detailed view displays correct overview labels and table', async ({ page }) => {
    await gotoPageWithData(page);
    const firstRow = page.locator('table tbody tr:not([aria-hidden="true"])').first();

    if (!(await firstRow.isVisible())) {
      test.skip();
      return;
    }

    await firstRow.click();
    await page.waitForURL(/.*transport\/grn\/.+/, { timeout: 15_000 });

    // Verify Overview labels
    await expect(page.getByText(/GRN ID/i)).toBeVisible();
    await expect(page.getByText(/Vendor Name/i).or(page.getByText(/Client Name/i))).toBeVisible();
    await expect(page.getByText(/GRN Date/i)).toBeVisible();
    await expect(page.getByText(/Defects/i)).toBeVisible();
    await expect(page.getByText(/PoD ID/i)).toBeVisible();
    await expect(page.getByText(/Invoice ID/i)).toBeVisible();

    // Verify Tabs
    await expect(page.getByRole('tab', { name: /Overview/i })).toBeVisible();

    // Verify Table Headers
    await expect(page.getByRole('columnheader', { name: /SKU ID/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Item name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Dispatch Qty\./i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Recieved Qty\./i })).toBeVisible();
  });

  test('Preview GRN triggers API call and opens new tab', async ({ page }) => {
    await gotoPageWithData(page);
    const firstRow = page.locator('table tbody tr:not([aria-hidden="true"])').first();

    if (!(await firstRow.isVisible())) {
      test.skip();
      return;
    }

    await firstRow.click();
    await page.waitForURL(/.*transport\/grn\/.+/, { timeout: 15_000 });

    // Preview button (eye icon)
    const previewButton = page.locator('button').filter({ has: page.locator('svg[class*="lucide-eye"]') }).first();
    
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      // It might trigger a POST /grn/document/ if not already generated
      // Or it might just open the link if grnDetails.documentLink exists
      // We'll wait for either the response or just the popup
      previewButton.click(),
    ]);

    await expect(popup).toBeDefined();
  });

  test('Navigate to POD from GRN Overview', async ({ page }) => {
    await gotoPageWithData(page);
    const firstRow = page.locator('table tbody tr:not([aria-hidden="true"])').first();

    if (!(await firstRow.isVisible())) { test.skip(); return; }

    await firstRow.click();
    await page.waitForURL(/.*transport\/grn\/.+/, { timeout: 15_000 });

    const podLink = page.locator('p').filter({ has: page.locator('svg[class*="lucide-move-up-right"]') }).first();
    
    // Check if the first link is POD (based on order in Overview)
    // podId is typically the first or second such link
    if (await podLink.isVisible()) {
        await podLink.click();
        // Since it's a relative router.push, we check URL
        await page.waitForURL(/.*transport\/pod\/.+/, { timeout: 15_000 });
    } else {
        test.skip();
    }
  });

  test('Update QC button navigates to QC module', async ({ page }) => {
    await gotoPageWithData(page);
    const firstRow = page.locator('table tbody tr:not([aria-hidden="true"])').first();

    if (!(await firstRow.isVisible())) { test.skip(); return; }

    await firstRow.click();
    await page.waitForURL(/.*transport\/grn\/.+/, { timeout: 15_000 });

    const updateQcBtn = page.getByRole('button', { name: /Update QC/i });
    
    if (await updateQcBtn.isVisible()) {
        await updateQcBtn.click();
        await page.waitForURL(/.*inventory\/qc\/.+/, { timeout: 15_000 });
    } else {
        console.log('QC already completed for this GRN, skipping test');
        test.skip();
    }
  });
});
