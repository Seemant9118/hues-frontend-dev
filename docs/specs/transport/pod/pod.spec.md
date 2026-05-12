# Feature: PoD (Proof of Delivery)

## Status: draft

## Route
- **Listing:** `src/app/[locale]/(dashboard)/dashboard/transport/pod/page.jsx`
- **Details:** `src/app/[locale]/(dashboard)/dashboard/transport/pod/[id]/page.jsx`

## Flow
The POD flow facilitates the transition of responsibility for goods from the seller/transporter to the buyer. It starts with the seller requesting a POD against a Delivery Challan, followed by the buyer reviewing the delivery and either accepting, rejecting, or modifying the received quantities.

## Overview
A legal confirmation that goods have been delivered. It links the Delivery Challan (physical movement) to the GRN (Good Receipt Note - inventory update).

---

## Data Model

### PoD (Proof of Delivery)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `referenceNumber` | string | User-facing POD ID (e.g., POD-2026-001) |
| `status` | string | `PENDING`, `SENT`, `REJECTED`, `ACCEPTED` |
| `voucherId` | string | Linked Delivery Challan ID |
| `voucherReferenceNumber` | string | Linked Delivery Challan number |
| `dispatchNoteId` | string | Linked Dispatch Note ID |
| `buyerId` | number | Buyer enterprise ID |
| `buyerType` | string | Type of buyer entity |
| `metaData` | object | Contains snapshots of buyer, seller, and invoice details |
| `items` | array | List of POD items |
| `documentLink` | string | URL to the generated POD PDF |

### PoD Item

| Field | Type | Description |
|-------|------|-------------|
| `dispatchNoteItemId` | number | Association with the parent dispatch item |
| `acceptQuantity` | number | Quantity confirmed as received by the buyer |
| `rejectQuantity` | number | Quantity rejected due to damages/discrepancies |
| `rejectionReason` | string | Mandatory if `rejectQuantity` > 0 |
| `amount` | number | Calculated value of accepted quantity |
| `metaData` | object | Contains product details (name, SKU, etc.) |

---

## Features

### 1. PoDs Listing

**Description:** Central hub for viewing all PODs filtered by status.

**Location:** `/dashboard/transport/pod`

**Behavior:**
- **Tabs:** `ALL` (default), `POD_PENDING`, `POD_SENT`, `POD_REJECTED`. Filtering is handled via internal component state rather than URL query parameters.
- **Search:** Search bar with 400ms debounce filtering by reference number or client/vendor name.
- **Infinite Scroll:** Loads 10 items at a time using `InfiniteDataTable`.
- **Read Tracking:** Clicking an unread POD row triggers an API call to mark it as read before navigating to details.
- **Navigation:** Clicking a row navigates to `/dashboard/transport/pod/[id]`.

**API:** `GET /pod/list`

---

### 2. Request PoD (Seller Flow)

**Trigger:** **"Request POD"** button on the Delivery Challan details page.

**Location:** `/dashboard/transport/delivery-challan/[id]`

**Behavior:**
- Collects current Delivery Challan data (items, quantities, buyer/seller info).
- Maps dispatched quantities to `acceptQuantity` by default.
- Submits the payload to create a new POD record.
- Redirects the seller to the newly created POD details page.

**API:** `POST /pod/create`

---

### 3. PoD Details

**Description:** Detailed view of a specific POD for both buyer and seller.

**Location:** `/dashboard/transport/pod/[id]`

**UI Components:**
- **Breadcrumbs:** Navigation back to the POD list.
- **Overview:** Displays POD ID, Status, Date, Client/Vendor Name, and links to Delivery Challan, Invoice, and E-Way Bill.
- **Items Table:** Lists SKU ID, Item Name, Delivered Qty, Accepted Qty, and Rejected Qty.
- **Attachments:** Displays Proof of Delivery images if provided.
- **Comments:** Integrated comment box for communication regarding the POD.
- **Preview:** Button to view/download the generated POD PDF. Opens in a new tab using a local Blob URL within an `iframe` after fetching the document data via API.

---

### 4. Accept / Reject / Modify PoD (Buyer Flow)

**Description:** Actionable items for the buyer when a POD is in `PENDING` status.

**Actions:**
1. **Accept as Delivered:** Confirm full delivery of all items.
2. **Reject Delivery:** Reject the entire delivery (requires a rejection reason).
3. **Modify & Accept:** Adjust individual item quantities (Accepted vs Rejected).

**Security:** All actions require **PIN Verification** via `PINVerifyModal`.

**On Success:**
- POD status updates.
- If accepted or modified, the system automatically redirects the buyer to the generating **GRN (Goods Receipt Note)**.
- For rejection, the buyer stays on the POD details page with a "REJECTED" status.

**API:**
- Accept: `POST /pod/:podId/accept`
- Reject: `POST /pod/:podId/reject`
- Modify: `PUT /pod/:podId/modify-and-accept`

---

### 5. Mark as Received (Seller Flow)

**Description:** Specific action for the seller to finalize the POD in certain bypass cases.

**Trigger:** **"Marked as Received"** button in `ActionsDropdown` (Seller view, `PENDING` status).

**Behavior:**
- Opens the `ModifyPOD` dialog.
- Allows the seller to confirm the quantities received by the buyer and finalize the record.
- Submits using the same modification logic but flagged as seller action.

**API:** `PUT /pod/:podId/modify-and-accept` (with `isSellerEnterprise: true`)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pod/list` | Returns a paginated list of PODs |
| GET | `/pod/details/:id` | Returns full POD details including metadata |
| POST | `/pod/create` | Initial creation/requesting of a POD |
| POST | `/pod/:podId/accept` | Confirms full acceptance |
| POST | `/pod/:podId/reject` | Rejects the delivery |
| PUT | `/pod/:podId/modify-and-accept` | Partial acceptance or Seller finalization |
| POST | `/pod/document/:id` | Generates/Retrieves the PDF document slug |

---

## Business Rules

1. **Quantities:** `Accepted Qty` + `Rejected Qty` must always equal the `Delivered Qty` dispatched in the Delivery Challan.
2. **Mandatory Reasons:** A rejection reason must be provided for any rejected quantity or full delivery rejection.
3. **Security:** Only authorized users with valid enterprise PINs can finalize POD actions.
4. **GRN Association:** Acceptance (full or partial) of a POD is a hard requirement for GRN creation in the procurement flow.
5. **Read Tracker:** The system ensures document visibility is tracked for both parties (SellerIsRead/BuyerIsRead).

---

## Acceptance Criteria

- [ ] POD List renders with data-driven tabs and correctly formatted date/status columns.
- [ ] Clicking a POD row from Delivery Challan correctly opens the details view.
- [ ] Buyer can only see Accept/Reject/Modify buttons when POD is `PENDING`.
- [ ] PIN verification modal appears and validates correctly before any state change.
- [ ] Total Amount in the Modify dialog updates dynamically based on user-entered Accepted Qty.
- [ ] Rejection flows require a text reason before the Confirm button is enabled.
- [ ] Attachments (images) uploaded during modification are correctly persisted and displayed.

---

## Edge Cases

- **Zero Acceptance:** If the buyer rejects all items via the "Modify" flow, it should behave as a full rejection.
- **PIN Failure:** If the user enters an incorrect PIN multiple times, an error toast is displayed and the action is blocked.
- **Network Timeout:** State changes should show a loading indicator on buttons to prevent double-submission.
- **Enterprise Onboarding:** Users belonging to enterprises with incomplete onboarding see a `RestrictedComponent` instead of the POD list.

---

## Test Scenarios

### POD Acceptance (Buyer)

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Full Acceptance | POD is `PENDING` | Buyer clicks "Accept as Delivered" and enters correct PIN | Status becomes `ACCEPTED` and user is redirected to GRN |
| 2 | Partial Acceptance | POD is `PENDING` | Buyer clicks "Modify & Accept", reduces one item's qty, and confirms with PIN | Status becomes `ACCEPTED` and quantities are updated |
| 3 | Rejection | POD is `PENDING` | Buyer clicks "Reject Delivery", enters reason, and confirms with PIN | Status becomes `REJECTED` |

### POD Navigation

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | Link to DC | Viewing POD Details | User clicks the Delivery Challan reference number | User is navigated to the DC details page |
| 2 | Link to Invoice | Viewing POD Details | User clicks the Invoice reference number | User is navigated to the Sales/Purchase Invoice details page |
