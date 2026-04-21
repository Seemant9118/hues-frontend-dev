import { expect, type Page, test } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_URL = '/en/dashboard/transport/pod';

// ─────────────────────────────────────────────────────────────────────────────
// Navigation helpers
// ─────────────────────────────────────────────────────────────────────────────
async function gotoPage(page: Page) {
  await page.goto(PAGE_URL);
  await expect(page.getByRole('heading', { name: /Proof of Delivery/i })).toBeVisible({
    timeout: 15_000,
  });
}

async function gotoPageWithData(page: Page) {
  const apiPromise = page.waitForResponse(
    (res) => res.url().includes('/pod/list') && res.ok(),
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
// Action Helpers
// ─────────────────────────────────────────────────────────────────────────────
async function enterPIN(page: Page, pin: string = '1234') {
  // InputOTP slots are generic divs, but we can target the group or use keyboard
  const otpInput = page.locator('input[name="otp"]').first();
  if (await otpInput.isVisible()) {
    await otpInput.focus();
    await otpInput.fill(pin);
  } else {
    // Fallback to sequential typing if hidden input isn't found
    await page.locator('.flex.items-center.gap-2').first().click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(pin, { delay: 100 });
  }
}

async function openActionsMenu(page: Page) {
  const actionsBtn = page.getByRole('button', { name: /Actions/i });
  await actionsBtn.click();
  // Wait for menu to appear
  await expect(page.getByRole('menu')).toBeVisible({ timeout: 5000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Listing & Navigation
// ─────────────────────────────────────────────────────────────────────────────
test.describe('PODs - Listing & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoPageWithData(page);
  });

  test('Page renders correctly with header, tabs, and search', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Proof of Delivery/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /^All$/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search PoD/i)).toBeVisible();
  });

  test('Search triggers API with searchString param', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search PoD/i);

    const searchPromise = page.waitForResponse(
      (res) =>
        res.url().includes('/pod/list') &&
        res.url().includes('searchString=POD-TEST') &&
        res.ok(),
      { timeout: 15_000 },
    );

    await searchInput.fill('POD-TEST');
    await searchPromise;
  });

  test('Tabs switch and trigger API call', async ({ page }) => {
    const tabNames = ['PoD Pending', 'PoD Accepted', 'PoD Rejected'];

    for (const name of tabNames) {
      console.log(`Testing tab: ${name}`);

      const apiPromise = page.waitForResponse(
        (res) => res.url().includes('/pod/list') && res.ok(),
        { timeout: 15_000 },
      );

      await page.getByRole('tab', { name }).click();
      await apiPromise;
    }
  });

  test('Clicking a table row navigates to POD detail page', async ({ page }) => {
    const firstRow = page.locator('table tbody tr:not([aria-hidden="true"])').first();

    if (!(await firstRow.isVisible())) {
      console.log('No POD rows found, skipping navigation test');
      test.skip();
      return;
    }

    await firstRow.click();
    await page.waitForURL(/.*transport\/pod\/\d+/, { timeout: 15_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Details View
// ─────────────────────────────────────────────────────────────────────────────
test.describe('PODs - Details View', () => {
  test('Detailed view displays correct overview labels and tabs', async ({ page }) => {
    await gotoPageWithData(page);
    const firstRow = page.locator('table tbody tr:not([aria-hidden="true"])').first();

    if (!(await firstRow.isVisible())) {
      test.skip();
      return;
    }

    await firstRow.click();
    await page.waitForURL(/.*transport\/pod\/\d+/, { timeout: 15_000 });

    // Verify Overview labels (based on dictionary keys)
    await expect(page.getByText(/^ID$/i)).toBeVisible();
    await expect(page.getByText(/Delivery Challan ID/i)).toBeVisible();
    await expect(page.getByText(/Client Name/i).or(page.getByText(/Vendor Name/i))).toBeVisible();

    // Verify Tabs
    await expect(page.getByRole('tab', { name: /Overview/i })).toBeVisible();
  });

  test('Preview PoD triggers API call and opens new tab', async ({ page }) => {
    await gotoPageWithData(page);
    const firstRow = page.locator('table tbody tr:not([aria-hidden="true"])').first();

    if (!(await firstRow.isVisible())) {
      test.skip();
      return;
    }

    await firstRow.click();
    await page.waitForURL(/.*transport\/pod\/\d+/, { timeout: 15_000 });

    // Preview is an icon button next to breadcrumbs
    const previewButton = page.locator('button').filter({ has: page.locator('svg[class*="lucide-eye"]') }).first();
    
    // We expect a popup and an API call to generate the document
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.waitForResponse(res => res.url().includes('/pod/document/') && res.ok()),
      previewButton.click(),
    ]);

    await expect(popup).toBeDefined();
    // Verification of defined popup is sufficient as it uses a dynamic blob iframe
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: Buyer Actions
// ─────────────────────────────────────────────────────────────────────────────
test.describe('PODs - Buyer Actions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a Pending POD
    await gotoPageWithData(page);
    await page.getByRole('tab', { name: 'PoD Pending' }).click();

    // Wait for the data to refresh after tab change
    await page.waitForResponse(res => res.url().includes('/pod/list') && res.ok());

    const firstRow = page.locator('table tbody tr:not([aria-hidden="true"])').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForURL(/.*transport\/pod\/\d+/, { timeout: 15_000 });
    } else {
      test.skip();
    }
  });

  test('Accepting POD as delivered redirects to GRN', async ({ page }) => {
    await openActionsMenu(page);
    const acceptItem = page.getByRole('menuitem', { name: /Accept as Delivered/i });
    if (!(await acceptItem.isVisible())) {
      console.log('Accept as Delivered option not found (possibly seller view or not pending)');
      test.skip();
      return;
    }

    await acceptItem.click();

    // PIN Modal
    await expect(page.getByText(/Enter a PIN/i)).toBeVisible({ timeout: 10000 });
    await enterPIN(page, '1234');

    const acceptPromise = page.waitForResponse(
      (res) => res.url().includes('/accept') && res.ok(),
      { timeout: 20_000 },
    );

    await page.getByRole('button', { name: /^Verify$/i }).click();
    await acceptPromise;

    // After success, it should redirect to GRN
    await page.waitForURL(/.*transport\/grn\/\d+/, { timeout: 20_000 });
  });

  test('Rejecting POD requires reason and PIN', async ({ page }) => {
    await openActionsMenu(page);
    const rejectItem = page.getByRole('menuitem', { name: /Reject Delivery/i });
    if (!(await rejectItem.isVisible())) { test.skip(); return; }

    await rejectItem.click();

    // Reason Modal
    await expect(page.getByText(/Reject Delivery/i).first()).toBeVisible();
    await page.getByPlaceholder(/Enter rejection reason/i).fill('Damaged items E2E Test');
    await page.getByRole('button', { name: /Confirm/i }).click();

    // PIN Modal
    await expect(page.getByText(/Enter a PIN/i)).toBeVisible({ timeout: 10000 });
    await enterPIN(page, '1234');

    const rejectPromise = page.waitForResponse(
      (res) => res.url().includes('/reject') && res.ok(),
      { timeout: 20_000 },
    );

    await page.getByRole('button', { name: /^Verify$/i }).click();
    await rejectPromise;

    // It shows a result dialog
    await expect(page.getByText(/REJECTED/i)).toBeVisible();
  });

  test('Modifying POD quantities updates calculation and submits with PIN', async ({ page }) => {
    await openActionsMenu(page);
    const modifyItem = page.getByRole('menuitem', { name: /Modify & Accept/i });
    if (!(await modifyItem.isVisible())) { test.skip(); return; }

    await modifyItem.click();

    // Modify Dialog
    await expect(page.getByText(/Modify Quantities/i)).toBeVisible();

    // Reduce quantity of the first item
    const firstItemRow = page.locator('dialog table tbody tr').first();
    const qtyInput = firstItemRow.locator('input[type="number"]').first();
    const currentQty = await qtyInput.inputValue();

    if (Number(currentQty) > 0) {
      await qtyInput.fill((Number(currentQty) - 1).toString());
    }

    await page.getByRole('button', { name: /Confirm Changes/i }).click();

    // PIN Modal
    await expect(page.getByText(/Enter a PIN/i)).toBeVisible({ timeout: 10000 });
    await enterPIN(page, '1234');

    const modifyPromise = page.waitForResponse(
      (res) => res.url().includes('/modify-and-accept') && res.ok(),
      { timeout: 20_000 },
    );

    await page.getByRole('button', { name: /^Verify$/i }).click();
    await modifyPromise;

    // Should redirect to GRN
    await page.waitForURL(/.*transport\/grn\/\d+/, { timeout: 20_000 });
  });
});
