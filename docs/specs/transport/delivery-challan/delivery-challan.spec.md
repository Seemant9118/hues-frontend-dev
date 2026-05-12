# Feature: Delivery Challan

## Status: tested

> [!NOTE]
> **Verified against actual running implementation — April 2026**

## Route
- **Listing:** `src/app/[locale]/(dashboard)/dashboard/transport/delivery-challan/page.jsx`
- **Details:** `src/app/[locale]/(dashboard)/dashboard/transport/delivery-challan/[deliveryId]/page.jsx`

## Flow
Generating and managing Delivery Challans (DC) for individual legs of transport. Multiple Delivery Challans can be created against a single Dispatch Note.

## Overview
Provides a detailed view of transport documents for specific goods movements. While a Dispatch Note represents the overall intent to move goods, a Delivery Challan is the legal document accompanying the goods during a specific leg of the journey.

---

## Data Model

### Delivery Challan (Creation Payload)

| Field | Type | Description |
|-------|------|-------------|
| `dispatchNoteId` | number | Association with parent Dispatch Note |
| `isEWBRequired` | boolean | Flag for E-Way Bill requirement |
| `buyerId` | number | Target buyer ID |
| `buyerType` | string | Target buyer type |
| `metaData` | object | Snapshot of dispatch details at time of creation |
| `bookings` | array | List of transport booking details (Leg From, Leg To, etc.) |

### Booking Details

| Field | Type | Description |
|-------|------|-------------|
| `legFrom` | string | Source address for the transport leg |
| `legTo` | string | Destination address for the transport leg |
| `modeOfTransport` | string | `ROAD`, `SHIP`, `AIR`, `RAIL` |
| `bookingType` | string | `LR` (Road), `LB` (Ship), `AIRWAY` (Air), `RAILWAY` (Rail) |
| `bookingNumber` | string | Carrier's booking/tracking number |
| `bookingDate` | string | Date of booking |
| `transporterEnterpriseId` | number | ID of the selected transporter enterprise |
| `transporterId` | string | GSTIN/TRANSIN of the transporter |

---

## Features

### 1. Delivery Challans Listing

**Description:** Displays a paginated list of all generated delivery challans.

**Location:** `/dashboard/transport/delivery-challan`

**Behavior:**
- Implements infinite scrolling using `InfiniteDataTable` (id=`delivery-challan-table`).
- Search input with 400ms debounce (`searchString` param).
- Clicking a row navigates to the Delivery Challan details page.
- Automatically marks the challan as read using `updateReadTracker` API when clicking an unread row.
- Displays an `InfoBanner` reminding users that multiple DCs can be created per Dispatch Note.

**API:** `GET /dispatchnote/vouchers/list`

---

### 2. Generate Delivery Challan

**Trigger:** Clicking **"Generate DC"** from a Dispatch Note detail page.

**UI:** `GenerateDCPreviewForm` component which includes a dynamic form and a PDF preview.

**Form Flow:**
1. **Leg Details:** `Leg from` (Auto-filled from source) and `Leg To` (Selectable destination).
2. **Mode of Transport:** Selecting a mode auto-fills the **Booking Type**.
3. **Transporter:** Select from existing vendors or add a new one. Transporter ID auto-fills based on selection.
4. **Booking Details:** Enter Booking Number and Date.
5. **EWB Check:** An `InfoBanner` alerts if an E-Way Bill is required (triggered if Total Amount + GST > ₹50,000).

**Key Actions:**
- **Apply Changes:** Regenerates the PDF preview with the current form data.
- **Generate DC:** Submits the data and redirects to the new Delivery Challan's detail page.

**API:** 
- Generate: `POST /dispatchnote/voucher/create/:dispatchNoteId`

---

### 3. Delivery Challan Details

**Description:** Comprehensive view of a specific Delivery Challan.

**Sections:**
- **Overview:** Displays DC number, Consignor, Consignee, Supply type, linked Dispatch ID, linked Invoice ID, and Leg details.
- **Tabs:**
    - **Items:** Table showing Product Name, Invoice Qty, Dispatched Qty, Rate, and Amount.
    - **Transport Bookings:** Table showing carriers, booking numbers, and leg details.
    - **E-Way Bills:** List of associated E-Way Bills with status and PDF viewing.
    - **POD:** Proof of Delivery information.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dispatchnote/vouchers/list` | Fetches list of delivery challans |
| GET | `/dispatchnote/voucher/:id` | Fetches specific DC details |
| POST | `/dispatchnote/voucher/create/:id` | Creates the Delivery Challan record |

---

## UI Text Reference

| Element | Actual Text |
|---------|------------|
| Page heading | `Delivery Challans` |
| Search placeholder | `Search Delivery Challan` |
| Banner text | `You can create multiple Delivery Challans against a single Dispatch Note.` |
| EWB Warning | `E-Way Bill is required for this Delivery Challan` |
| Form Heading (Leg) | `Leg Details` |
| Final Action button | `Generate DC` |
| Table Header (List) | `Delivery Challan No`, `Date`, `Client/Vendor Name`, `Dispatch ID`, `Supply`, `Total Amount` |

---

## Business Rules
1. **EWB Threshold:** E-Way Bill is marked as required if the total value exceeds ₹50,000.
2. **Multi-Leg Transport:** A single Dispatch Note can have multiple Delivery Challans if the journey is broken into legs (e.g., Warehouse -> Hub -> Customer).
3. **Transporter Mapping:** If "Self" is selected as transporter, no Transporter ID (GSTIN) is required.
4. **Read Tracking:** The system tracks if the seller or buyer has read the document to ensure acknowledgment.

---

## Acceptance Criteria
- [x] List page renders with correct columns and infinite scroll.
- [x] Search filters list correctly with debounced API calls.
- [x] Generation form correctly auto-fills Booking Type based on Mode of Transport.
- [x] PDF preview updates in real-time when "Apply Changes" is clicked.
- [x] Detail page correctly links back to the parent Dispatch Note and associated Invoice.
- [x] POD and E-Way Bill tabs correctly display associated records for the leg.
