import { expect, type Page, test } from '@playwright/test';

const PAGE_URL = '/dashboard/inventory/goods/';
const BUILDER_URL = '/dashboard/inventory/goods/item-master-builder';

/**
 * Navigation Helpers
 */
async function gotoPage(page: Page) {
  await page.goto(PAGE_URL);
  await expect(page.getByRole('heading', { name: /Item Master/i })).toBeVisible({
    timeout: 15_000,
  });
}

async function gotoPageWithData(page: Page) {
  const apiPromise = page.waitForResponse(
    (res) => res.url().includes('/master-material/productgoods/getgoods/') && res.ok(),
    { timeout: 15_000 },
  );
  await gotoPage(page);
  await apiPromise;
  // Filter out spacers and "No results" rows
  const firstRow = page.locator('table tbody tr')
    .filter({ hasNot: page.locator('[aria-hidden]') })
    .filter({ hasNot: page.getByText(/No results found/i) })
    .first();
  await expect(firstRow).toBeVisible({ timeout: 10_000 });
}

async function gotoBuilderPage(page: Page) {
  const apiPromise = page.waitForResponse(
    (res) => res.url().includes('/master-material/productgoods/goods/list-types/') && res.ok(),
    { timeout: 15_000 },
  );
  await page.goto(BUILDER_URL);
  await apiPromise;
  await expect(page.getByText('Item Master Builder')).toBeVisible();
}

test.describe('Inventory Goods - Layout & Listing', () => {
  test.beforeEach(async ({ page }) => {
    await gotoPageWithData(page);
  });

  test('Page renders correctly with header, search, and builder button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Item Master/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search items/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Open Item master Builder/i })).toBeVisible();
  });

  test('Table displays correct columns', async ({ page }) => {
    const headers = [
      'Product',
      'HSN Code',
      'Category',
      'Sales Price',
      'MRP',
      'GST (%)',
      'Added On'
    ];
    for (const header of headers) {
      await expect(page.getByRole('columnheader', { name: header, exact: true })).toBeVisible();
    }
  });

  test('Search triggers API with debounced searchString', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search items/i);
    
    const searchPromise = page.waitForResponse(
      (res) => res.url().includes('/master-material/productgoods/search') && 
               res.request().method() === 'POST' &&
               JSON.parse(res.request().postData() || '{}').searchString === 'steel',
      { timeout: 10_000 },
    );

    await searchInput.fill('steel');
    const response = await searchPromise;
    expect(response.ok()).toBeTruthy();
  });

  test('Infinite scroll loads more data', async ({ page }) => {
    const lastRow = page.locator('table tbody tr')
      .filter({ hasNot: page.locator('[aria-hidden]') })
      .filter({ hasNot: page.getByText(/No results found/i) })
      .last();
    await expect(lastRow).toBeVisible({ timeout: 10_000 });

    const nextPagePromise = page.waitForResponse(
      (res) => res.url().includes('page=2'),
      { timeout: 10_000 }
    );

    await lastRow.scrollIntoViewIfNeeded();
    
    const response = await nextPagePromise;
    expect(response.ok()).toBeTruthy();
  });
});

test.describe('Inventory Goods - Product Management', () => {
  test.beforeEach(async ({ page }) => {
    await gotoPageWithData(page);
  });

  test('Navigate to Item Master Builder', async ({ page }) => {
    await page.getByRole('button', { name: /Open Item master Builder/i }).click();
    await expect(page).toHaveURL(new RegExp(BUILDER_URL));
    await expect(page.getByText('Item Master Builder')).toBeVisible();
  });

  test('Export to Excel', async ({ page }) => {
    const exportBtn = page.locator('button').filter({ has: page.locator('svg[class*="lucide-download"]') }).first();
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toBeEnabled();
  });

  test.describe.serial('Edit & Delete Flow', () => {
    test.beforeEach(async ({ page }) => {
      await gotoPageWithData(page);
    });

    test('Open Edit form pre-fills data', async ({ page }) => {
      const firstRow = page.locator('table tbody tr')
        .filter({ hasNot: page.locator('[aria-hidden]') })
        .filter({ hasNot: page.getByText(/No results found/i) })
        .first();
      await expect(firstRow).toBeVisible();

      const productName = await firstRow.locator('td').first().textContent();
      
      await firstRow.getByRole('button', { name: /Open menu/i }).click();
      await page.getByRole('menuitem', { name: /Edit/i }).click();

      await expect(page.getByRole('heading', { name: /item/i })).toBeVisible();
      
      const nameInput = page.getByPlaceholder(/Product Name/i);
      await expect(nameInput).toHaveValue(productName || '');
    });

    test('Delete product triggers confirmation and API', async ({ page }) => {
      const firstRow = page.locator('table tbody tr')
        .filter({ hasNot: page.locator('[aria-hidden]') })
        .filter({ hasNot: page.getByText(/No results found/i) })
        .first();
      await expect(firstRow).toBeVisible();

      await firstRow.getByRole('button', { name: /Open menu/i }).click();
      
      const deletePromise = page.waitForResponse(
        (res) => res.url().includes('/master-material/productgoods/delete/') && res.request().method() === 'DELETE' && res.ok(),
        { timeout: 15_000 },
      );

      await page.getByRole('button', { name: /Delete/i }).click();
      
      const dialog = page.getByRole('dialog');
      const confirmBtn = dialog.getByRole('button', { name: /Delete/i, exact: true });
      await confirmBtn.click();

      const response = await deletePromise;
      expect(response.ok()).toBeTruthy();
    });
  });
});

test.describe('Item Master Builder Flows', () => {
  test.beforeEach(async ({ page }) => {
    await gotoBuilderPage(page);
  });

  test('Manual Type Creation form renders and validates', async ({ page }) => {
    await page.getByRole('button', { name: /Create Item Type manually/i }).click();
    await expect(page.getByText('Creating Item Type (Manually)')).toBeVisible();

    // Trigger validation
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText(/Product Type is required/i)).toBeVisible();
    await expect(page.getByText(/Description is required/i)).toBeVisible();
  });

  test('Navigate to Type Details and Quick Add product flow', async ({ page }) => {
    const noData = page.getByText(/No Data/i);
    const addProductBtn = page.getByRole('button', { name: /Add product/i }).first();

    // Wait for either data button or empty state
    await expect(addProductBtn.or(noData)).toBeVisible({ timeout: 15_000 });

    // Click "Add product" button to go to details page
    await addProductBtn.click();
    
    // Wait for navigation and heading
    await expect(page.getByRole('heading', { name: /Quick Add Product/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Add products rapidly under this item type/i)).toBeVisible();

    // Small delay to ensure form inputs are interactive
    await page.waitForLoadState('networkidle');

    // Fill Quick Add form using name attributes
    const skuInput = page.locator('input[name="skuId"]');
    await expect(skuInput).toBeVisible({ timeout: 10_000 });
    await skuInput.fill('SKU-TEST-123');
    
    await page.locator('input[name="productName"]').fill('Test Product via Builder');
    await page.locator('input[name="salesPrice"]').fill('100');
    await page.locator('input[name="mrp"]').fill('150');

    // Setup listener for create API
    const createPromise = page.waitForResponse(
      (res) => res.url().includes('/master-material/productgoods/create') && 
               res.request().method() === 'POST' && 
               res.ok(),
      { timeout: 15_000 },
    );

    // Click "Save Product" button
    await page.getByRole('button', { name: /Save Product/i }).click();
    
    const response = await createPromise;
    expect(response.ok()).toBeTruthy();

    // Verify product table is visible below the form
    await expect(page.locator('table')).toBeVisible();
    
    // Check if the table has data
    const tableRows = page.locator('table tbody tr');
    await expect(tableRows.first()).toBeVisible();
  });
});
