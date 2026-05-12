# Feature: Dispatch Note

## Status: tested

> [!NOTE]
> **Verified against actual running implementation — April 2026**

## Route
`src/app/[locale]/(dashboard)/dashboard/transport/dispatch/page.jsx`

## Flow
Creating, listing, and filtering dispatch notes for both Supply for Sale (Outward) and Internal Logistics (Inward).

## Overview
Provides a consolidated view and creation flow for Dispatch Notes, managing logistics for both sales deliveries and internal warehouse transfers.

---

## Data Model

### Dispatch Note (Creation Payload)

| Field | Type | Description |
|-------|------|-------------|
| `movementType` | string | `'INWARD'` (Internal Logistics) or `'OUTWARD'` (Supply for Sale) |
| `dispatchFromAddressId` | number | Dispatch origination address ID |
| `dispatchToAddressId` | number | Dispatch destination address ID (Inward only) |
| `billingFromAddressId` | number | Billing address ID (Outward only) |
| `invoiceId` | number | Associated invoice ID (Outward only) |
| `orderId` | number | Associated order ID (Outward only) |
| `totalAmount` | number | Total amount for items dispatched |
| `totalGstAmount` | number | Total GST amount (Outward only) |
| `items` | array | List of items being dispatched |

### Dispatch Item (Outward)

| Field | Type | Description |
|-------|------|-------------|
| `orderItemId` | number | ID of the order item |
| `invoiceItemId` | number | ID of the invoice item |
| `quantity` | number | Dispatch quantity |
| `amount` | number | Item amount |
| `gstAmount` | number | Item GST amount |

### Dispatch Item (Inward)

| Field | Type | Description |
|-------|------|-------------|
| `inventoryId` | number | ID of the inventory item |
| `bucketId` | number | Source bucket ID |
| `quantity` | number | Dispatch quantity |
| `amount` | number | Item amount |

---

## Features

### 1. Dispatch Notes Listing

**Description:** Displays a paginated list of dispatch notes, filterable by movement type and searchable.

**Location:** Dispatch Notes main page `/dashboard/transport/dispatch`

**Behavior:**
- Default view shows **"All"** dispatch notes — the tab state defaults to `'ALL'` and the API always receives `movement=ALL` (it is **never omitted**).
- Tabs filter by **"Inward"** (fires `movement=INWARD`) and **"Outward"** (fires `movement=OUTWARD`).
- Search input with 400ms debounce to search dispatch notes by text (`searchString` param).
- Implements infinite scrolling using `InfiniteDataTable` component (id=`dispatch-table`).
- Clicking a row navigates to the dispatch note details page `/dashboard/transport/dispatch/:id`.
- Automatically marks the note as read using the `updateReadTracker` API when clicking an unread dispatch note.

**API:** `GET /dispatchnote/list/`

---

### 2. Create Dispatch Note – Outward (Supply for Sale)

**Trigger:** Clicking **"Create Dispatch Note"** button and selecting **"Supply for Sale"** card in Step 1.

**UI:** Multi-step form (via `MultiStepForm` component). Navigation between steps uses **"Proceed"** button and **"Back"** button.

**Form Flow:**
1. **Movement Type** (`"Select Movement Type"` heading) — Click the **"Supply for Sale"** card, then **"Proceed"**.
2. **Find Invoice** (`"Find Invoice"` heading) — Click a non-fully-dispatched invoice card, then **"Proceed"**.
3. **Dispatch Address** (`"Dispatch Address"` heading) — Select **"Dispatch From"** and **"Billing From"** via react-select (classNamePrefix=`"select"`), then **"Proceed"**.
4. **Select Items** (`"Select Items to Dispatch"` heading) — Check items in table, adjust quantities, then click **"✓ Create Dispatch Note"**.

**Form Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Movement Type | SelectionCard | Yes | Sets flow to OUTWARD |
| Invoice | Card list click | Yes | Disabled if `isFullyDispatched` |
| Dispatch From | react-select (`.select__control`) | Yes | Address dropdown |
| Billing From | react-select (`.select__control`) | Yes | Address dropdown |
| Selected Items | Checkbox table | Yes | At least 1 with `dispatchQty > 0` |

**On Success:**
- `createDispatchNoteMutation` → toast `"Dispatch Note Created Successfully"`.
- Redirect to `/dashboard/transport/dispatch/:dispatchNoteId`.

**On Error:**
- Error toast displaying API message.

**API:** `POST /dispatchnote/create/:orderId`

---

### 3. Create Dispatch Note – Inward (Internal Logistics)

**Trigger:** Clicking **"Create Dispatch Note"** button and selecting **"Internal Logistic"** card in Step 1.

**UI:** Multi-step form with 3 steps. Navigation via **"Proceed"** / **"Back"**.

**Form Flow:**
1. **Movement Type** (`"Select Movement Type"` heading) — Click **"Internal Logistic"** card, then **"Proceed"**.
2. **Find Stock Items** (`"Find Stock Items"` heading) — Select **"Select Bucket"** (shadcn `<Select>`, role=combobox), select **"Item"** (react-select), fill **Quantity** (`id="quantity"`), click **"Add"**, then **"Proceed"**.
3. **Dispatch Address** (`"Dispatch Address"` heading) — Select **"Dispatch From"** and **"Dispatch To"** via react-select, then click **"✓ Create Dispatch Note"**.

**Form Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Movement Type | SelectionCard | Yes | Sets flow to INWARD |
| Bucket | shadcn `<Select>` — trigger renders as `<button>` (NOT role=combobox) | Yes | Filters stock items |
| Item | react-select | Yes | Only enabled after bucket selected |
| Quantity | `<Input id="quantity">` inside InputWithSelect | Yes | Positive integer |
| Dispatch From | react-select | Yes | Address dropdown |
| Dispatch To | react-select | Yes | Address dropdown |

**On Success:**
- `createInwardDispatchNoteMutation` → toast `"Dispatch Note Created Successfully"`.
- Redirect to `/dashboard/transport/dispatch/:dispatchNoteId`.

**On Error:**
- Error toast displaying API message.

**API:** `POST dispatchnote/create-internal-logistics`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dispatchnote/list/` | Fetches list of dispatch notes (always includes `movement=ALL/INWARD/OUTWARD`) |
| POST | `/dispatchnote/create/:orderId` | Creates a new outward dispatch note |
| POST | `dispatchnote/create-internal-logistics` | Creates a new inward dispatch note |
| POST | `/order/invoice/getallsalesinvoicelist/:enterpriseId` | Fetches sales invoices for Outward Step 2 |
| PUT | `/readTracker/state/:readTrackerId` | Updates read tracker state |

### Query Params for `GET /dispatchnote/list/`
- `enterpriseId` (number)
- `page` (number)
- `limit` (number)
- `movement` (string: `ALL`, `INWARD`, `OUTWARD`) — **always present** (tab defaults to `ALL`)
- `searchString` (string) — Optional

---

## UI Text Reference (from code)

| Element | Actual Text |
|---------|------------|
| Page heading | `Dispatch Notes` |
| Tab 1 | `All` |
| Tab 2 | `Inward` |
| Tab 3 | `Outward` |
| Create button | `Create Dispatch Note` |
| Search placeholder | `Search Dispatch note` |
| MultiStepForm "next" button | `Proceed` |
| MultiStepForm "back" button | `Back` |
| Step 1 heading | `Select Movement Type` |
| Step 2 (Outward) heading | `Find Invoice` |
| Step 2 (Inward) heading | `Find Stock Items` |
| Step 3 heading | `Dispatch Address` |
| Step 4 (Outward) heading | `Select Items to Dispatch` |
| Outward card title | `Supply for Sale` |
| Inward card title | `Internal Logistic` |
| Final submit button | `✓ Create Dispatch Note` |
| Table columns | `Dispatch ID`, `Date`, `Name`, `Supply`, `Invoice ID`, `Total Amount` |
| Supply column values | `Inward Supply` / `Outward Supply` |
| Success toast | `Dispatch Note Created Successfully` |

---

## Business Rules
1. Enterprise Onboarding must be complete to view and create dispatch notes (`isEnterpriseOnboardingComplete`).
2. User must have `permission:sales-view` to access the page.
3. Inward dispatch note requires both `dispatchFromAddressId` and `dispatchToAddressId`.
4. Outward dispatch note requires both `dispatchFromAddressId` and `billingFromAddressId`.
5. Dispatch notes cannot be created without at least one valid item selected.
6. When tab is "All", API is called **without** a `movement` query param.

---

## Acceptance Criteria
- [x] List page loads with All, Inward, Outward tabs.
- [x] Table renders correctly with Dispatch ID, Date, Name, Supply, Invoice ID, and Total Amount.
- [x] Search functionality successfully triggers a debounced query with `searchString` param.
- [x] Create Outward flow captures invoice, items, and address properly and submits to `/dispatchnote/create/:orderId`.
- [x] Create Inward flow captures stock items and warehouse addresses properly and submits to `dispatchnote/create-internal-logistics`.
- [x] Clicking a table row correctly updates the read tracker if unread, and navigates to the detailed view.

---

## Edge Cases
- **No Dispatch Notes Available:** Show `EmptyStageComponent` with heading text.
- **Direct Navigation to Create URL:** `?action=create` opens the `MultiStepForm` directly.
- **Search string cleared:** Increments `searchCycle` — sends fresh API call without the param.
- **Fully dispatched invoice:** Card is disabled (`cursor-not-allowed`), cannot be selected.

---

## Test Scenarios

### 1. Dispatch Notes Listing

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Page loads | User navigates to dispatch notes | Page loads | Heading "Dispatch Notes", tabs All/Inward/Outward, search input, and "Create Dispatch Note" button are visible |
| 2 | All tab (default) | User on dispatch notes page | Page loads | API called with `movement=ALL` |
| 3 | Inward tab filter | User on dispatch notes page | Clicks "Inward" tab | API called with `movement=INWARD` |
| 4 | Outward tab filter | User on dispatch notes page | Clicks "Outward" tab | API called with `movement=OUTWARD` |
| 5 | All tab after switching | User switched to Inward tab | Clicks "All" tab | API called with `movement=ALL` |
| 6 | Search | User on dispatch notes page | Types text in search input | API called with `searchString=<typedValue>` after 400ms debounce |
| 7 | Row navigation | User sees a dispatch note row | Clicks on a row | Navigates to `/dashboard/transport/dispatch/:id` |

### 2. Create Dispatch Note – Outward

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Open create form | User on dispatch notes | Clicks "Create Dispatch Note" | URL changes to `?action=create`, "Select Movement Type" heading appears |
| 2 | Select Outward type | User on Movement Type step | Clicks "Supply for Sale" card and "Proceed" | Navigates to "Find Invoice" step |
| 3 | Invoice step loads | User on Find Invoice step | Step mounts | API fires `POST /order/invoice/getallsalesinvoicelist/:id` |
| 4 | Successful creation | User fills all steps | Clicks "✓ Create Dispatch Note" | API called at `/dispatchnote/create/:orderId`, success toast shown, redirected to detail page |

### 3. Create Dispatch Note – Inward

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Select Inward type | User on Movement Type step | Clicks "Internal Logistic" card and "Proceed" | Navigates to "Find Stock Items" step |
| 2 | Successful creation | User fills all steps | Clicks "✓ Create Dispatch Note" | API called at `/dispatchnote/create-internal-logistics`, success toast shown |
