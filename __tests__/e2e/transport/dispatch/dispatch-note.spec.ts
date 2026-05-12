import { expect, type Page, test } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_URL = '/en/dashboard/transport/dispatch';
const CREATE_URL = `${PAGE_URL}?action=create`;

// ─────────────────────────────────────────────────────────────────────────────
// Navigation helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Navigate and wait for the page heading to confirm auth passed. */
async function gotoPage(page: Page) {
  await page.goto(PAGE_URL);
  await expect(page.getByRole('heading', { name: /Dispatch Notes/i })).toBeVisible({
    timeout: 15_000,
  });
}

/**
 * Navigate to the listing page and wait for the list API response.
 * Tolerates both data rows and the empty-state component.
 */
async function gotoPageWithData(page: Page) {
  const apiPromise = page.waitForResponse(
    (res) => res.url().includes('/dispatchnote/list/') && res.ok(),
    { timeout: 15_000 },
  );
  await gotoPage(page);
  await apiPromise;

  // Wait for either a data row OR the empty-state text (resilient to test environment)
  await expect(
    page
      .locator('#dispatch-table table tbody tr:not([aria-hidden="true"])')
      .first()
      .or(page.getByText(/Manage bids, deals/i)), // EmptyStageComponent heading text
  ).toBeVisible({ timeout: 10_000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Form helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Click a SelectionCard by its h3 title text.
 * SelectionCardLayout renders each card as a clickable div containing an h3.
 */
async function selectMovementType(page: Page, cardTitle: string) {
  await page.locator(`h3:has-text("${cardTitle}")`).click();
}

/**
 * Interact with a react-select dropdown that has no classNamePrefix.
 * Finds the react-select container via the input[id] pattern and targets
 * the react-select control by its role.
 *
 * For AddressSelectionLayout which uses classNamePrefix="select",
 * this finds .select__control. For StockItemLayout which does NOT
 * use a classNamePrefix, we locate by the parent label text instead.
 */
async function selectReactSelectByLabel(
  page: Page,
  labelText: string,
  optionPattern: string | RegExp,
) {
  // Find the label, go up to the flex/grid container, find the react-select control
  const label = page.getByText(labelText, { exact: false }).first();
  const formGroup = label.locator('xpath=ancestor::div[contains(@class,"flex") or contains(@class,"gap")][1]');

  // react-select control: may have classNamePrefix="select" OR no prefix (uses [class$="control"])
  const control = formGroup
    .locator('.select__control, [class$="-control"]')
    .first();
  await control.click();

  // Options render in a portal — search page-globally for react-select options
  const option = page
    .locator('.select__option, [class$="-option"]')
    .filter({ hasText: optionPattern })
    .first();
  await option.waitFor({ state: 'visible', timeout: 10_000 });
  await option.click();
}

/**
 * Interact with a shadcn/Radix <Select> (renders as a <button> trigger).
 * Radix SelectTrigger renders as a native <button> — NOT role="combobox".
 * We locate the SelectTrigger by finding the button inside the label container.
 */
async function selectShadcnByLabel(
  page: Page,
  labelText: string,
  optionPattern: string | RegExp,
) {
  // The label text is in a <Label> sibling to the <Select>; they share a parent div
  const label = page.getByText(labelText, { exact: false }).first();
  const container = label.locator('xpath=ancestor::div[contains(@class,"flex") or contains(@class,"gap")][1]');

  // Radix SelectTrigger renders as a <button> 
  const trigger = container.locator('button').first();
  await trigger.click();

  // Radix SelectContent renders items as role="option" in a portal
  const option = page.getByRole('option', { name: optionPattern }).first();
  await option.waitFor({ state: 'visible', timeout: 10_000 });
  await option.click();
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Listing & Filtering
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Dispatch Notes - Listing & Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await gotoPageWithData(page);
  });

  test('Page renders correctly with tabs, search, and create button', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /All/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Inward/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Outward/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search Dispatch note/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Dispatch Note/i })).toBeVisible();
  });

  test('All tab (default) fires API with movement=ALL', async ({ page }) => {
    // Reload to capture a fresh "All" tab request; tab state defaults to "ALL"
    const allPromise = page.waitForResponse(
      (res) =>
        res.url().includes('/dispatchnote/list/') &&
        res.url().includes('movement=ALL') &&
        res.ok(),
      { timeout: 15_000 },
    );
    await page.reload();
    await allPromise;
  });

  test('Inward tab fires API with movement=INWARD', async ({ page }) => {
    const inwardPromise = page.waitForResponse(
      (res) =>
        res.url().includes('/dispatchnote/list/') &&
        res.url().includes('movement=INWARD') &&
        res.ok(),
      { timeout: 15_000 },
    );
    await page.getByRole('tab', { name: /Inward/i }).click();
    await inwardPromise;
  });

  test('Outward tab fires API with movement=OUTWARD', async ({ page }) => {
    const outwardPromise = page.waitForResponse(
      (res) =>
        res.url().includes('/dispatchnote/list/') &&
        res.url().includes('movement=OUTWARD') &&
        res.ok(),
      { timeout: 15_000 },
    );
    await page.getByRole('tab', { name: /Outward/i }).click();
    await outwardPromise;
  });

  test('Switching back to All tab fires API with movement=ALL', async ({ page }) => {
    // First switch away to Inward
    await page.getByRole('tab', { name: /Inward/i }).click();
    await page.waitForResponse(
      (res) => res.url().includes('movement=INWARD') && res.ok(),
      { timeout: 15_000 },
    );

    // Switch back to All — movement=ALL should be sent
    const allPromise = page.waitForResponse(
      (res) =>
        res.url().includes('/dispatchnote/list/') &&
        res.url().includes('movement=ALL') &&
        res.ok(),
      { timeout: 15_000 },
    );
    await page.getByRole('tab', { name: /All/i }).click();
    await allPromise;
  });

  test('Search triggers API with searchString param', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search Dispatch note/i);

    const searchPromise = page.waitForResponse(
      (res) =>
        res.url().includes('/dispatchnote/list/') &&
        res.url().includes('searchString=DN-TEST') &&
        res.ok(),
      { timeout: 15_000 },
    );

    await searchInput.fill('DN-TEST');
    // 400ms debounce fires automatically; waitForResponse handles the wait
    await searchPromise;
  });

  test('Clicking a table row navigates to dispatch detail page', async ({ page }) => {
    // Exclude aria-hidden rows (virtualizer placeholders)
    const firstRow = page
      .locator('#dispatch-table table tbody tr:not([aria-hidden="true"])')
      .first();
    const hasRows = await firstRow.isVisible().catch(() => false);

    if (!hasRows) {
      test.skip();
      return;
    }

    await firstRow.click();
    await page.waitForURL(/.*transport\/dispatch\/\d+/, { timeout: 15_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Create Dispatch Note (Outward — Supply for Sale)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Dispatch Notes - Creation Flow (Outward)', () => {
  test('Clicking Create Dispatch Note opens movement type step', async ({ page }) => {
    await gotoPage(page);
    await page.getByRole('button', { name: /Create Dispatch Note/i }).click();

    await page.waitForURL(/\?action=create/, { timeout: 10_000 });
    await expect(
      page.getByRole('heading', { name: /Select Movement Type/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Selecting Supply for Sale and Proceed reaches Find Invoice step', async ({ page }) => {
    await page.goto(CREATE_URL);
    await expect(
      page.getByRole('heading', { name: /Select Movement Type/i }),
    ).toBeVisible({ timeout: 15_000 });

    await selectMovementType(page, 'Supply for Sale');
    await page.getByRole('button', { name: /Proceed/i }).click();

    await expect(
      page.getByRole('heading', { name: /Find Invoice/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Find Invoice step fires the sales invoice list API', async ({ page }) => {
    await page.goto(CREATE_URL);
    await expect(
      page.getByRole('heading', { name: /Select Movement Type/i }),
    ).toBeVisible({ timeout: 15_000 });

    // The invoice API is: POST /order/invoice/getallsalesinvoicelist/:enterpriseId
    const invoiceApiPromise = page.waitForResponse(
      (res) =>
        res.url().includes('/order/invoice/getallsalesinvoicelist/') &&
        res.request().method() === 'POST' &&
        res.ok(),
      { timeout: 15_000 },
    );

    await selectMovementType(page, 'Supply for Sale');
    await page.getByRole('button', { name: /Proceed/i }).click();

    await invoiceApiPromise;
  });

  test('Full Outward creation flow submits successfully', async ({ page }) => {
    await page.goto(CREATE_URL);
    await expect(
      page.getByRole('heading', { name: /Select Movement Type/i }),
    ).toBeVisible({ timeout: 15_000 });

    // ── Step 1: Movement type ────────────────────────────────────────────────
    await selectMovementType(page, 'Supply for Sale');
    await page.getByRole('button', { name: /Proceed/i }).click();

    // ── Step 2: Find Invoice ─────────────────────────────────────────────────
    await page.waitForResponse(
      (res) =>
        res.url().includes('/order/invoice/getallsalesinvoicelist/') &&
        res.request().method() === 'POST' &&
        res.ok(),
      { timeout: 15_000 },
    );
    await expect(
      page.getByRole('heading', { name: /Find Invoice/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Click the first non-disabled invoice card
    const availableInvoice = page
      .locator('.cursor-pointer')
      .filter({ hasNot: page.locator('.cursor-not-allowed') })
      .first();

    const hasInvoice = await availableInvoice.isVisible().catch(() => false);
    if (!hasInvoice) {
      test.skip(); // No selectable invoices in this test environment
      return;
    }
    await availableInvoice.click();
    await expect(page.getByText(/Selected Invoice/i)).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /Proceed/i }).click();

    // ── Step 3: Dispatch Address ─────────────────────────────────────────────
    await expect(
      page.getByRole('heading', { name: /Dispatch Address/i }),
    ).toBeVisible({ timeout: 10_000 });

    // AddressSelectionLayout uses classNamePrefix="select" → .select__control
    await selectReactSelectByLabel(page, 'Dispatch From', /.+/);
    await selectReactSelectByLabel(page, 'Billing From', /.+/);

    await page.getByRole('button', { name: /Proceed/i }).click();

    // ── Step 4: Select Items ─────────────────────────────────────────────────
    await page.waitForResponse(
      (res) => res.url().includes('/order/invoice/') && res.ok(),
      { timeout: 15_000 },
    );
    await expect(
      page.getByRole('heading', { name: /Select Items to Dispatch/i }),
    ).toBeVisible({ timeout: 10_000 });

    const firstRow = page.locator('table tbody tr:not([aria-hidden="true"])').first();
    await firstRow.waitFor({ state: 'visible', timeout: 10_000 });
    await firstRow.getByRole('checkbox').check();

    // ── Submit ───────────────────────────────────────────────────────────────
    const createPromise = page.waitForResponse(
      (res) => res.url().includes('/dispatchnote/create/') && res.ok(),
      { timeout: 30_000 },
    );

    await page.getByRole('button', { name: /Create Dispatch Note/i }).click();

    const response = await createPromise;
    expect(response.ok()).toBeTruthy();

    await expect(page.getByText(/Dispatch Note Created Successfully/i)).toBeVisible({
      timeout: 10_000,
    });
    await page.waitForURL(/.*transport\/dispatch\/\d+/, { timeout: 15_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: Create Dispatch Note (Inward — Internal Logistics)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Dispatch Notes - Creation Flow (Inward)', () => {
  test('Selecting Internal Logistic and Proceed reaches Find Stock Items step', async ({ page }) => {
    await page.goto(CREATE_URL);
    await expect(
      page.getByRole('heading', { name: /Select Movement Type/i }),
    ).toBeVisible({ timeout: 15_000 });

    await selectMovementType(page, 'Internal Logistic');
    await page.getByRole('button', { name: /Proceed/i }).click();

    await expect(
      page.getByRole('heading', { name: /Find Stock Items/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Full Inward creation flow submits successfully', async ({ page }) => {
    await page.goto(CREATE_URL);
    await expect(
      page.getByRole('heading', { name: /Select Movement Type/i }),
    ).toBeVisible({ timeout: 15_000 });

    // ── Step 1: Movement type ────────────────────────────────────────────────
    await selectMovementType(page, 'Internal Logistic');
    await page.getByRole('button', { name: /Proceed/i }).click();

    // ── Step 2: Stock Items ──────────────────────────────────────────────────
    await expect(
      page.getByRole('heading', { name: /Find Stock Items/i }),
    ).toBeVisible({ timeout: 10_000 });

    // "Select Bucket" → Radix <SelectTrigger> renders as a <button> (not role="combobox")
    // The label "Select Bucket" is a <Label> sibling to the <Select>
    await selectShadcnByLabel(page, 'Select Bucket', /.+/);

    // Wait for stock items API to complete after bucket is selected
    await page.waitForResponse(
      (res) => res.url().includes('/stocks/') && res.ok(),
      { timeout: 10_000 },
    ).catch(() => {
      // Stock loading may already be complete — non-fatal
    });
    await page.waitForTimeout(800);

    // "Item" → ReactSelect without classNamePrefix — uses [class$="-control"] pattern
    await selectReactSelectByLabel(page, 'Item', /.+/);

    // "Quantity" → <Input id="quantity"> inside InputWithSelect
    // InputWithSelect applies id directly to the <Input> element
    const qtyInput = page.locator('#quantity').or(page.locator('input[name="Quantity"]'));
    await qtyInput.waitFor({ state: 'visible', timeout: 10_000 });
    await qtyInput.fill('5');

    // Click the "Add" button to add the item to the selected items table
    await page.getByRole('button', { name: /^Add$/i }).click();

    // Wait for the item to appear in the table
    await expect(
      page.locator('table tbody tr:not([aria-hidden="true"])').first(),
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /Proceed/i }).click();

    // ── Step 3: Dispatch Address ─────────────────────────────────────────────
    await expect(
      page.getByRole('heading', { name: /Dispatch Address/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Inward uses "Dispatch From" + "Dispatch To" (not "Billing From")
    await selectReactSelectByLabel(page, 'Dispatch From', /.+/);
    await selectReactSelectByLabel(page, 'Dispatch To', /.+/);

    // ── Submit ───────────────────────────────────────────────────────────────
    const createPromise = page.waitForResponse(
      (res) =>
        res.url().includes('dispatchnote/create-internal-logistics') && res.ok(),
      { timeout: 30_000 },
    );

    await page.getByRole('button', { name: /Create Dispatch Note/i }).click();

    const response = await createPromise;
    expect(response.ok()).toBeTruthy();

    await expect(page.getByText(/Dispatch Note Created Successfully/i)).toBeVisible({
      timeout: 10_000,
    });
    await page.waitForURL(/.*transport\/dispatch\/\d+/, { timeout: 15_000 });
  });
});
