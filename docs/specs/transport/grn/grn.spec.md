# Feature: GRN (Goods Received Note)

## Status: Tested
Last Updated: 2026-04-24

## Route
- **Listing:** `src/app/[locale]/(dashboard)/dashboard/transport/grn/page.jsx`
- **Details:** `src/app/[locale]/(dashboard)/dashboard/transport/grn/[id]/page.jsx`

## Flow
The GRN flow is the final stage of the transport/delivery process in the procurement cycle. It is automatically generated once a buyer accepts a Proof of Delivery (POD). The GRN records the actual quantities received and accepted into inventory, serving as the basis for Quality Control (QC) and subsequent financial accounting (Invoices/Debit Notes).

## Overview
A document that confirms the receipt of goods by the buyer. It links the POD (physical acceptance) to the Inventory/QC flow and helps in reconciling dispatched vs received quantities.

---

## Data Model

### GRN (Goods Received Note)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `referenceNumber` | string | User-facing GRN ID (e.g., GRN-2026-001) |
| `createdAt` | string | Date and time of GRN creation |
| `podId` | string | Linked POD ID |
| `podReferenceNumber` | string | Linked POD reference number |
| `isQcCompleted` | boolean | Indicates if Quality Control has been performed |
| `items` | array | List of GRN items |
| `metaData` | object | Contains snapshots of buyer, seller, and invoice details |
| `readTracker` | object | Read status for buyer and seller |

### GRN Item

| Field | Type | Description |
|-------|------|-------------|
| `acceptedQuantity` | number | Quantity confirmed as received and accepted |
| `rejectedQuantity` | number | Quantity rejected or marked as missing/damaged |
| `metaData` | object | Contains product details (name, SKU ID, etc.) |

---

## Features

### 1. GRNs Listing

**Description:** View all Goods Received Notes with filtering and search capabilities.

**Location:** `/dashboard/transport/grn`

**Behavior:**
- **Tabs:** `ALL` (default), `DEFECTS` (GRNs with rejected/damaged items).
- **Search:** Debounced search (400ms) by reference number or vendor/client name.
- **Infinite Scroll:** Loads items in chunks of 10 using `InfiniteDataTable`.
- **Read Tracking:** Unread GRNs are marked with a primary color dot. Clicking a row marks it as read.
- **Navigation:** Clicking a row navigates to `/dashboard/transport/grn/[id]`.

**API:** `GET /grn/list`

---

### 2. GRN Details

**Description:** Comprehensive view of a specific GRN, its items, and linked documents.

**Location:** `/dashboard/transport/grn/[id]`

**UI Components:**
- **Breadcrumbs:** Navigation back to the GRN list.
- **Overview:** Displays GRN ID, Vendor/Client Name, Date, Defects (QC status), and clickable links to POD, Invoice, and E-Way Bill.
- **Items Table:** Lists Sr. No, SKU ID, Item Name, Qty Received (Accepted + Rejected), Qty Accepted, and Qty Rejected.
- **QC Navigation:** If QC is not completed, an "Update QC" button is visible to navigate to the QC module.

**API:** `GET /grn/:id`

---

### 3. Preview GRN Document

**Trigger:** **Eye icon** button in the page header.

**Behavior:**
- Fetches the GRN document data.
- If already generated, opens the `documentLink` in a new tab.
- If not generated, triggers the generation API and then opens the PDF in a new tab using `viewPdfInNewTab`.

**API:** `POST /grn/document/:id`

---

### 4. Quality Control (QC) Integration

**Trigger:** **"Update QC"** button or clicking the **"(QC)"** link next to defects in Overview.

**Navigation:** Redirects to `/dashboard/inventory/qc/[id]`.

**Behavior:** Allows the user to perform detailed quality checks on the received items. Once completed, the `isQcCompleted` flag is updated.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/grn/list` | Returns paginated list of GRNs |
| GET | `/grn/:id` | Returns full GRN details including metadata |
| POST | `/grn/document/:id` | Generates/Retrieves the GRN PDF document slug |
| POST | `/grn/create/from-invoice` | Ad-hoc creation of GRN from an invoice |
| PUT | `/grn/items/status/:id` | Update QC status for GRN items |

### Query Params (Listing)
- `page`: Current page number
- `limit`: Number of items per page (default 10)
- `grnStatus`: Tab filter (`ALL`, `DEFECTS`)
- `searchString`: Search query for reference number or name

---

## Business Rules

1. **Automatic Generation:** GRNs are typically generated automatically upon POD acceptance.
2. **Quantity Integrity:** The sum of `acceptedQuantity` and `rejectedQuantity` in GRN should match the `acceptQuantity` from the parent POD.
3. **QC Requirement:** Quality Control can only be performed once the GRN is generated.
4. **Read Status:** Both parties (buyer and seller) have independent read tracking for each GRN.

---

## Acceptance Criteria

- [ ] GRN List displays all records with correct status and read indicators.
- [ ] Search functionality filters the list based on reference number or vendor name.
- [ ] Clicking a row correctly handles read-tracking API and navigates to details.
- [ ] GRN Details Overview displays correct linked document references (POD, Invoice).
- [ ] "Update QC" button appears only when `isQcCompleted` is false.
- [ ] Preview button generates and displays the GRN PDF in a new tab.
- [ ] Items table correctly calculates and displays "Qty Received" as the sum of accepted and rejected quantities.

---

## Edge Cases

- **No Linked POD:** In ad-hoc creation cases, some references (like `podId`) might be null; the UI should handle this gracefully with fallback dashes.
- **QC Already Done:** The "Update QC" button should be hidden, and a "(QC)" link should appear next to the defects status to view the results.
- **Restricted Access:** Users without proper permissions or incomplete onboarding see a `RestrictedComponent` or restricted view.

---

## Test Scenarios

### GRN Listing & Navigation

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Mark as Read | User has an unread GRN in the list | User clicks the row | `updateReadTracker` API is called and user navigates to details |
| 2 | Search GRN | User is on the GRN list page | User types a reference number in search | List updates to show matching GRNs after 400ms |
| 3 | Filter by Defects | User is on the GRN list page | User clicks the "DEFECTS" tab | List updates to show only GRNs with QC defects |

### GRN Details & Document

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Preview Document | Viewing GRN details | User clicks the Eye icon | PDF opens in a new tab |
| 2 | Navigate to POD | Viewing GRN details | User clicks the POD reference number | User is navigated to the POD details page |
| 3 | Navigate to QC | Viewing GRN details and QC is not completed | User clicks "Update QC" | User is navigated to the QC update page |
