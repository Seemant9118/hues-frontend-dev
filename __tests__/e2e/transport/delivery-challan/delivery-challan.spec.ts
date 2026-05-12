import { expect, type Page, test } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_URL = '/en/dashboard/transport/delivery-challan';
const DISPATCH_URL = '/en/dashboard/transport/dispatch';

// ─────────────────────────────────────────────────────────────────────────────
// Navigation helpers
// ─────────────────────────────────────────────────────────────────────────────

async function gotoPage(page: Page) {
  await page.goto(PAGE_URL);
  await expect(page.getByRole('heading', { name: /Delivery Challans/i })).toBeVisible({
    timeout: 15_000,
  });
}

async function gotoPageWithData(page: Page) {
  const apiPromise = page.waitForResponse(
    (res) => res.url().includes('/dispatchnote/vouchers/list') && res.ok(),
    { timeout: 15_000 },
  );
  await gotoPage(page);
  await apiPromise;

  // Wait for either a data row OR the empty-state text
  await expect(
    page
      .locator('#delivery-challan-table table tbody tr:not([aria-hidden="true"])')
      .first()
      .or(page.getByText(/You can create multiple/i)), // Part of the InfoBanner present in listing
  ).toBeVisible({ timeout: 10_000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Form helpers (for React Select and Shadcn Select)
// ─────────────────────────────────────────────────────────────────────────────

async function selectReactSelectByLabel(
  page: Page,
  labelText: string,
  optionPattern: string | RegExp,
) {
  const label = page.getByText(labelText, { exact: false }).first();
  const formGroup = label.locator('xpath=ancestor::div[contains(@class,"flex") or contains(@class,"gap")][1]');
  const control = formGroup.locator('.select__control, [class$="-control"]').first();
  await control.click();

  const option = page
    .locator('.select__option, [class$="-option"]')
    .filter({ hasText: optionPattern })
    .first();
  await option.waitFor({ state: 'visible', timeout: 10_000 });
  await option.click();
}

async function selectShadcnByLabel(
  page: Page,
  labelText: string,
  optionPattern: string | RegExp,
) {
  const label = page.getByText(labelText, { exact: false }).first();
  const container = label.locator('xpath=ancestor::div[contains(@class,"flex") or contains(@class,"gap")][1]');
  const trigger = container.locator('button').first();
  await trigger.click();

  const option = page.getByRole('option', { name: optionPattern }).first();
  await option.waitFor({ state: 'visible', timeout: 10_000 });
  await option.click();
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Listing & Navigation
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Delivery Challans - Listing & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoPageWithData(page);
  });

  test('Page renders correctly with header, search, and info banner', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Delivery Challans/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search Delivery Challan/i)).toBeVisible();
    await expect(page.getByText(/You can create multiple Delivery Challans/i)).toBeVisible();
  });

  test('Search triggers API with searchString param', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search Delivery Challan/i);

    const searchPromise = page.waitForResponse(
      (res) =>
        res.url().includes('/dispatchnote/vouchers/list') &&
        res.url().includes('searchString=DC-TEST') &&
        res.ok(),
      { timeout: 15_000 },
    );

    await searchInput.fill('DC-TEST');
    await searchPromise;
  });

  test('Clicking a table row navigates to delivery challan detail page', async ({ page }) => {
    // Already navigated in beforeEach, but let's ensure the table is checked after API response
    const firstRow = page
      .locator('#delivery-challan-table table tbody tr:not([aria-hidden="true"])')
      .first();
    
    // The gotoPageWithData already waits for the list response, 
    // but we can give it another small wait for rendering if needed.
    await firstRow.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
    const hasRows = await firstRow.isVisible().catch(() => false);

    if (!hasRows) {
      test.skip();
      return;
    }

    await firstRow.click();
    await page.waitForURL(/.*transport\/delivery-challan\/\d+/, { timeout: 15_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Details View
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Delivery Challans - Details View', () => {
  test('Detailed view displays correct overview and tabs', async ({ page }) => {
    // We assume there's at least one DC to test the view
    await gotoPageWithData(page);
    const firstRow = page
      .locator('#delivery-challan-table table tbody tr:not([aria-hidden="true"])')
      .first();
    
    await firstRow.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
    const hasRows = await firstRow.isVisible().catch(() => false);

    if (!hasRows) {
      test.skip();
      return;
    }

    await firstRow.click();
    await page.waitForURL(/.*transport\/delivery-challan\/\d+/, { timeout: 15_000 });

    // Verify Overview labels
    await expect(page.getByText(/Consignor/i)).toBeVisible();
    await expect(page.getByText(/Consignee/i)).toBeVisible();
    await expect(page.getByText(/Supply/i)).toBeVisible();

    // Verify Tabs
    await expect(page.getByRole('tab', { name: /Items/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Transport Booking/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /E-way bill/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /POD/i })).toBeVisible();
  });

  test('Items tab shows dispatched items table', async ({ page }) => {
    await gotoPageWithData(page);
    const firstRow = page
      .locator('#delivery-challan-table table tbody tr:not([aria-hidden="true"])')
      .first();

    const hasRows = await firstRow.isVisible().catch(() => false);
    if (!hasRows) {
      test.skip();
      return;
    }

    await firstRow.click();
    await page.getByRole('tab', { name: /Items/i }).click();

    const itemsTable = page.locator('table').first();
    await expect(itemsTable).toBeVisible();
    await expect(itemsTable.getByText(/Product Name/i)).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: Generation Flow
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Delivery Challans - Generation Flow', () => {
  /** 
   * To test generation, we need to go to a Dispatch Note 
   * and triggers the 'generateDC' state.
   */
  test('Generation form renders correctly from Dispatch Note detail', async ({ page }) => {
    // Navigate to Dispatch Notes
    await page.goto(DISPATCH_URL);

    const apiPromise = page.waitForResponse(
      (res) => res.url().includes('/dispatchnote/list/') && res.ok(),
      { timeout: 15_000 },
    );
    await apiPromise;

    const firstRow = page.locator('#dispatch-table table tbody tr:not([aria-hidden="true"])').first();
    const hasRows = await firstRow.isVisible().catch(() => false);
    if (!hasRows) {
      test.skip();
      return;
    }

    // Capture the dispatch ID from the row click if possible or use the URL
    await firstRow.click();
    await page.waitForURL(/.*transport\/dispatch\/\d+/, { timeout: 15_000 });

    // Click "Generate DC" - it's likely a button or a link in the overview/tabs
    // Based on dispatch-note.spec.md, it's triggered from the dispatch detail page
    // Looking at the code, it uses state=generateDC in query params
    const generateDCButton = page.getByRole('button', { name: /Add Delivery Challan/i }).first();
    if (await generateDCButton.isVisible()) {
      await generateDCButton.click();
    } else {
      // Direct jump to the state if button not found (resilience)
      const currentUrl = page.url();
      await page.goto(`${currentUrl}?state=generateDC`);
    }

    await expect(page.getByText(/Leg Details/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /Apply changes/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Create$/i })).toBeVisible();
  });

  test('Applying changes triggers the preview API', async ({ page }) => {
    // Navigate to a known dispatch ID for generation if possible, or use the flow
    await page.goto(DISPATCH_URL);
    
    const listPromise = page.waitForResponse(
      (res) => res.url().includes('/dispatchnote/list/') && res.ok(),
      { timeout: 15_000 },
    );
    await listPromise;

    const firstRow = page.locator('#dispatch-table table tbody tr:not([aria-hidden="true"])').first();
    if (!await firstRow.isVisible()) { test.skip(); return; }
    await firstRow.click();

    await page.waitForURL(/.*transport\/dispatch\/\d+/, { timeout: 15_000 });

    const currentUrl = page.url();
    await page.goto(`${currentUrl}?state=generateDC`);

    // Fill all required fields to enable 'Apply Changes'
    await selectShadcnByLabel(page, 'Leg To', /.*/i);
    await selectShadcnByLabel(page, 'Mode of transport', /Road/i);
    await page.getByLabel(/Booking Number/i).fill('BK-TEST-123');
    
    // Interaction with DatePicker might need click then type or fill
    const dateInput = page.getByLabel(/Booking Date/i);
    await dateInput.click();
    await dateInput.fill(new Date().toLocaleDateString('en-GB')); // DD/MM/YYYY
    await page.keyboard.press('Escape'); // close picker

    const previewPromise = page.waitForResponse(
      (res) => res.url().includes('/dispatchnote/voucher/preview-document/') && res.ok(),
      { timeout: 15_000 },
    );

    await page.getByRole('button', { name: /Apply changes/i }).click();
    await previewPromise;

    await expect(page.getByText(/Changes applied!/i)).toBeVisible({ timeout: 5000 });
  });

  test('Successful DC generation redirects to new DC details', async ({ page }) => {
    await page.goto(DISPATCH_URL);

    const listPromise = page.waitForResponse(
      (res) => res.url().includes('/dispatchnote/list/') && res.ok(),
      { timeout: 15_000 },
    );
    await listPromise;

    const firstRow = page.locator('#dispatch-table table tbody tr:not([aria-hidden="true"])').first();
    if (!await firstRow.isVisible()) { test.skip(); return; }
    await firstRow.click();

    await page.waitForURL(/.*transport\/dispatch\/\d+/, { timeout: 15_000 });

    const currentUrl = page.url();
    await page.goto(`${currentUrl}?state=generateDC`);

    // Complete the form - fill all required fields
    await selectShadcnByLabel(page, 'Leg To', /.*/i);
    await selectShadcnByLabel(page, 'Mode of transport', /Road/i);
    await page.getByLabel(/Booking Number/i).fill('BK-TEST-123');

    const dateInput = page.getByLabel(/Booking Date/i);
    await dateInput.click();
    await dateInput.fill(new Date().toLocaleDateString('en-GB')); // DD/MM/YYYY
    await page.keyboard.press('Escape'); // close picker

    const generatePromise = page.waitForResponse(
      (res) => res.url().includes('/dispatchnote/voucher/create/') && res.ok(),
      { timeout: 30_000 },
    );

    await page.getByRole('button', { name: /^Create$/i }).click();
    await generatePromise;

    await page.waitForURL(/.*transport\/delivery-challan\/\d+/, { timeout: 15_000 });
    await expect(page.getByText(/Delivery Challan generated/i)).toBeVisible();
  });
});
