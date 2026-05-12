# Feature: [Feature Name]

## Status: draft | approved | implemented | tested

## Route
`app/(root)/route-name/page.tsx`

## Flow
What specific user flow does this cover? (e.g., "Creating a new post", not "Posts page")

## Overview
One-line description.

---

## Data Model

### [Entity Name]

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `field` | type | Description |

---

## Features

### 1. [Sub-feature Name]

**Description:** What this sub-feature does.

**Location:** Where in the UI this appears (e.g., page header, table row action).

**Behavior:**
- How it works step by step
- Initial load, pagination, etc.

**API:** `METHOD /endpoint`

---

### 2. [Sub-feature Name]

**Trigger:** How the user initiates this (e.g., button click).

**UI:** What appears (e.g., modal dialog, inline form).

**Form Fields:** (if applicable)

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| Field Name | Input type | Yes/No | Rules | Extra info |

**On Success:**
- API call made
- Toast message
- Dialog/form behavior
- Cache invalidation

**On Error:**
- Error toast
- Dialog stays open / form persists

**API:** `METHOD /endpoint`

---

## API Endpoints
<!-- Only include endpoints relevant to this feature. Not every feature has all CRUD operations. -->

| Method | Endpoint | Description |
|--------|----------|-------------|
| ... | ... | ... |

### Query Params
<!-- Document query params if the feature uses any (filters, search, pagination, etc.) -->

### Response Shape
<!-- Document the response structure if it's non-obvious or important for implementation -->

---

## Business Rules
<!-- Optional: Some specs embed rules directly in Features instead -->
1. Rule 1
2. Rule 2

---

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

---

## UI Behavior

### Entry Point
- How does the user start this flow? (button click, page load, etc.)

### Forms & Inputs
- Field names, types, placeholders
- Validation rules and error messages

### Loading States
- Button text changes during submission
- Disabled states
- Skeleton loading

### Success Behavior
- Toasts, redirects, data updates

### Error Behavior
- API error handling, toast messages

---

## Edge Cases
- What happens when...

---

## Test Scenarios
<!-- Group by sub-feature. One table per sub-feature. Only include sub-features relevant to this flow. -->

### [Sub-feature Name]

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| 1 | ... | ... | ... | ... |
