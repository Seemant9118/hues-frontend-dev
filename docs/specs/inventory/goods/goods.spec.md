# Feature: Inventory Goods (Item Master)

## Status: Tested
## Last Updated: 2026-05-04
## E2E Status: Passing (with 2 skips)

> [!NOTE]
> As of May 2026, the E2E suite covers all major flows. Infinite Scroll and Delete operations are skipped in automated runs to ensure stability on staging data but have been manually verified.

## Route
- **Listing:** `src/app/[locale]/(dashboard)/dashboard/inventory/goods/page.jsx`
- **Details:** `src/app/[locale]/(dashboard)/dashboard/inventory/goods/[id]/page.jsx` (Implicit from `onRowClick`)

## Flow
The Inventory Goods flow allows users to manage their product catalog (Item Master). Users can view, search, add, edit, and delete goods. It also provides tools for bulk upload and exporting the inventory list. This module serves as the central repository for all items handled within the enterprise, linking to procurement, sales, and warehouse modules.

## Overview
A module to manage the enterprise's item master, including product details, pricing, GST configurations, and categories.

---

## Data Model

### Product Good

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `productName` | string | Name of the product |
| `manufacturerName` | string | Name of the manufacturer |
| `description` | string | Detailed product description |
| `hsnCode` | string | Harmonized System of Nomenclature code |
| `salesPrice` | number | Selling price of the item |
| `mrp` | number | Maximum Retail Price |
| `gstPercentage` | number | GST rate applicable |
| `skuId` | string | Stock Keeping Unit identifier |
| `categoryId` | string | Reference to the product category |
| `subCategoryId` | string | Reference to the product sub-category |
| `attributes` | array | Custom product attributes (JSON) |
| `offers` | array | List of promotional offers |
| `seo` | object | SEO metadata (title, keywords, description) |
| `files` | object | Linked images and videos |
| `createdAt` | string | Timestamp of creation |

---

## Features

### 1. Goods Listing

**Description:** View all product goods with infinite scrolling and column sorting.

**Location:** `/dashboard/inventory/goods`

**Behavior:**
- **Infinite Scroll:** Loads items in chunks of 10 using `GoodsTable`.
- **Restricted View:** Displays `RestrictedComponent` if enterprise onboarding is incomplete.
- **Navigation:** Clicking a row navigates to the specific good's details page.
- **Export:** Export the current table view to Excel using the "Download" button.

**API:** `GET /master-material/productgoods/getgoods/:enterpriseId`

---

### 2. Search Goods

**Description:** Real-time search for products by name or other attributes.

**Location:** Sub-header search input.

**Behavior:**
- **Debounced Search:** Triggers API call after 400ms of inactivity.
- **Switching:** Automatically switches between `GetAllProductGoods` and `GetSearchedProductGoods` based on search term presence.

**API:** `POST /master-material/productgoods/search`

---

### 3. Add/Edit Product

**Description:** Create a new product or modify existing product details using a multi-step form.

**Trigger:** "Open Item Master Builder" (for create) or "Edit" action in table row.

**UI:** `AddGoods` component which wraps a `MultiStepForm`.

**Form Steps:** (Configured in `stepsConfig.js`)
- Basic Details (Name, Type, HSN)
- Pricing & Tax (MRP, Sales Price, GST)
- Categories & Attributes
- Media (Images/Videos)
- SEO & Offers

**On Success:**
- API call (POST for create, PUT for update).
- Success toast.
- Invalidation of `get_all_productgoods` query.
- Draft data cleared from session storage.

**API:**
- `POST /master-material/productgoods/create`
- `PUT /master-material/productgoods/update/:id`

---

### 4. Delete Product

**Description:** Remove a product from the inventory.

**Trigger:** "Delete" action in table row dropdown.

**UI:** `ConfirmAction` modal for verification.

**Behavior:**
- Deletes the record and refetches the list on success.

**API:** `DELETE /master-material/productgoods/delete/:id`

---

### 5. Item Master Builder
**Description:** A specialized workflow for building the item master catalog by managing Item Types (Product Categories) and their associated products.

**Location:** `/dashboard/inventory/goods/item-master-builder`

**Core Flows:**
1.  **Item Type Management:**
    *   **Fetch Item Types:** Automates catalog setup by fetching industry-standard item types from MSME (Udyam) or GST registration data.
    *   **Manual Creation:** Allows users to define custom Item Types with specific HSN codes, categories, and GST rates via `AddProductType` component.
    *   **Listing:** Displays all defined Item Types with count of products added to each.
2.  **Product Construction (Quick Add):**
    *   **Context:** Users navigate to a specific Item Type page (`/item-master-builder/[id]`).
    *   **Quick Add:** A streamlined form to add products rapidly (SKU, Name, Sales Price, MRP).
    *   **Existing Products:** A table lists all products under that Item Type, allowing for Edit and Delete operations.
3.  **Cross-flow Integration:** Existing products added via the standard Multi-step Builder are also visible here if they belong to the same Item Type.

**APIs:**
- `GET /master-material/productgoods/goods/list-types/:enterpriseId` (List types)
- `POST /enterprise/fetch-goods-by-registration` (Fetch types)
- `POST /master-material/productgoods/goods/bulk-create-type` (Bulk add fetched types)
- `POST /master-material/productgoods/goods/create-type` (Manual create type)
- `GET /master-material/productgoods/goods/type-details/:id` (Get type details and its products)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/master-material/productgoods/getgoods/:id` | Paginated list of goods for an enterprise |
| POST | `/master-material/productgoods/search` | Search products with pagination |
| GET | `/master-material/productgoods/get/:id` | Fetch details for a specific product |
| POST | `/master-material/productgoods/create` | Create a new product (Multipart/Form-Data) |
| PUT | `/master-material/productgoods/update/:id` | Update product details (Multipart/Form-Data) |
| DELETE | `/master-material/productgoods/delete/:id` | Remove a product |
| GET | `/master-material/productgoods/goods/list-types/:id` | List item types for an enterprise |
| GET | `/master-material/productgoods/goods/type-details/:id` | Get details and products for an item type |
| POST | `/enterprise/fetch-goods-by-registration` | Fetch item types from GST/MSME |
| POST | `/master-material/productgoods/goods/create-type` | Create a single item type manually |
| POST | `/master-material/productgoods/goods/bulk-create-type` | Add multiple fetched item types |
| POST | `/master-material/productgoods/upload` | Bulk upload goods via file |
| GET | `/master-material/productgoods/downloadsamplefile` | Get bulk upload template |

### Query Params (Listing/Search)
- `page`: Current page number.
- `limit`: Items per page (default 10).

---

## Business Rules

1. **Onboarding Check:** Users cannot access the goods management until enterprise onboarding is complete.
2. **Permission Gate:** 
   - `permission:item-masters-view` required for listing.
   - `permission:item-masters-create` required for adding.
   - `permission:item-masters-edit` required for editing.
   - `permission:item-masters-delete` required for deletion.
   - `permission:item-masters-download` required for export.
3. **Draft Persistence:** Add/Edit form state is saved to session storage to prevent data loss on page refresh.
4. **Multipart Data:** Creation and updates use `FormData` to handle image and video uploads alongside JSON metadata.

---

## Acceptance Criteria

- [ ] Goods list loads correctly with infinite scrolling.
- [ ] Search returns relevant results with 400ms debounce.
- [ ] Row click navigates to the correct details page.
- [ ] "Add Goods" form restores from draft if a previous session exists.
- [ ] "Edit Goods" pre-fills with existing product data.
- [ ] Delete action requires confirmation and correctly updates the table.
- [ ] Export button generates an Excel file with the current table data.
- [ ] Restricted view appears if enterprise ID or onboarding status is missing.
- [ ] New Item Types can be fetched from external sources (UDYAM/GST).
- [ ] New Item Types can be created manually.
- [ ] Products can be rapidly added to any Item Type via the Quick Add form.
- [ ] Existing products are manageable (edit/delete) within the Item Master Builder context.

---

## UI Behavior

### Entry Point
- Dashboard Sidebar -> Inventory -> Goods.

### Forms & Inputs
- **Product Name:** Required, text input.
- **HSN Code:** Required, search/select.
- **Prices:** Numeric inputs with currency formatting.

### Loading States
- **Table:** Loading spinner or skeleton during initial fetch.
- **Form Submission:** "Save" button enters a pending state.

---

## Edge Cases

- **Large Media Uploads:** Handling timeouts or large file sizes during product creation.
- **Duplicate SKU/HSN:** API should return clear error messages if uniqueness constraints are violated.
- **Network Failure during Scroll:** Infinite scroll should handle fetch errors gracefully and allow retry.

---

## Test Scenarios

### Goods Listing & Search

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Initial Load | User has `view` permission | Page loads | `getAllProductGoods` is called and table displays items |
| 2 | Search Products | User is on Goods page | User types "Steel" in search | `getSearchedProductGoods` is called and list updates |
| 3 | Export to Excel | Table has data | User clicks Export button | Excel file is downloaded |

### Product Management

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Delete Product | User selects Delete from actions | User confirms in modal | `deleteProductGoods` is called and item removed from UI |
| 2 | Save as Draft | User is filling "Add Goods" form | User clicks "Save" (not Final Submit) | Data is saved to session storage and user returns to list |
| 3 | Edit Submission | User is on Edit screen | User modifies price and submits | `updateProductGoods` is called and list is refreshed |
### Item Master Builder

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Create Type Manually | User is on Item Master Builder | User clicks "Create manually" and submits form | `createItemTypeManually` is called and list refreshes |
| 2 | Quick Add Product | User is on Item Type Details page | User fills SKU, Name, Price and clicks "Save Product" | `createProductGoods` is called with specific `goodsTypeId`; Toast notification appears; Product list below updates |
| 3 | Manage Existing Products | Item Type already has products listed | User clicks Edit/Delete on a product in the details table below the form | Standard edit/delete flows are triggered for the item; Table refreshes upon success |
