---
name: component-refactoring
description: Standardized workflow and guidelines for refactoring React & Next.js components. Use when refactoring components, splitting large files, extracting custom hooks for API side-effects, or improving code quality without changing business or API logic.
---

# React & Next.js Component Refactoring Skill

This skill provides a standardized architectural approach to refactoring complex or large monolithic React / Next.js components in the codebase.

## Refactoring Core Principles

1. **Zero Logic Contract Drift**: Never change API endpoints, payload structures, session storage keys, form field keys, or user behavior. Only refactor for code quality, readability, performance, and maintainability.
2. **Short & Readable Files**: Target under 200–300 lines for container components by delegating responsibilities to custom hooks and modular section subcomponents.
3. **Lazy State Initializers**: Wrap expensive initial state calculations, `SessionStorageService` / `LocalStorageService` reads, and draft computations inside `useState(() => ...)` callbacks to prevent re-execution on every render.
4. **Extract Custom Hooks for API Queries & Side-Effects**: Move all `useQuery` / `useMutation` calls, draft persistence effects, and schema configuration fetching into dedicated custom hooks in a `hooks/` subdirectory.
5. **Modular Section Subcomponents**: Break distinct UI sections (e.g., Client/Vendor selection, Add Item form, Custom/Additional fields, Line Items DataTable) into dedicated components in a `components/` subdirectory.
6. **Extract Table Column Definitions**: Move complex `DataTable` column definitions into a `use<Feature>TableColumns.js` hook to isolate cell rendering logic from the main container.
7. **Consolidate Constants & Derived Values**: Centralize empty draft states (`INITIAL_ITEM_STATE`), configuration objects (`ORDER_CONFIG`), and boolean flags (`isOffer`) to keep JSX DRY and readable.
8. **Absolute Import Aliases (`@/...`)**: Always use absolute module path aliases (e.g. `@/components/ui/button`, `@/components/Modals/AddModal`) instead of deep relative paths (`../../`) when creating or moving subcomponents and custom hooks into subdirectories.

---

## Directory & File Structure Pattern

When refactoring a large component file (e.g. `DynamicGoodsDetail.jsx`), adopt the following modular folder structure:

```
layouts/ (or feature directory)
├── DynamicGoodsDetail.jsx         # Slim container orchestrator (< 350 lines)
├── components/
│   ├── ClientVendorSection.jsx     # Section 1: Client/Vendor selector & modals
│   ├── AddItemSection.jsx          # Section 2: Add Item inputs & actions
│   ├── AdditionalInfoSection.jsx   # Section 3: Custom/Additional dynamic fields
│   └── LineItemsTableSection.jsx   # Section 4: Line items DataTable & empty stage
└── hooks/
    ├── useGoodsFormConfig.js       # Hook: Schema config, versions, & etag state
    ├── useGoodsDetailQueries.js    # Hook: API queries, options mapping, GST logic
    └── useGoodsTableColumns.js     # Hook: DataTable column definitions & actions
```

---

## Standard Refactoring Steps

1. **Analyze Component Responsibilities**:
   - Identify top-level API calls (`useQuery`, `useMutation`).
   - Identify state initializers and session storage dependencies.
   - Map distinct UI visual sections (Header/Details, Add Item Form, Additional Information, Data Tables).

2. **Extract Schema & Form Config Hook (`use<Feature>FormConfig.js`)**:
   - Encapsulate schema fetching (`getFormConfig`), field list state, versioning (`baseVersion`, `revision`, `etag`), and form save success handlers.

3. **Extract Queries & Options Hook (`use<Feature>Queries.js`)**:
   - Move all data fetching queries and memoized dropdown option mapping (`useMemo`) into a custom hook.
   - Return clear, typed properties for options, measurement units, and derived state (e.g. `isCurrentGstApplicable`).

4. **Extract DataTable Columns Hook (`use<Feature>TableColumns.js`)**:
   - Move `columns` definition array and action handlers (`handleItemEdit`, `handleItemDelete`) into a dedicated hook using `useMemo`.

5. **Extract Modular Section Subcomponents (`components/<SectionName>.jsx`)**:
   - Create focused single-responsibility components for each UI section.
   - Pass necessary state and handlers cleanly via props.

6. **Refactor Container Component**:
   - Re-assemble the container component using the extracted custom hooks and section subcomponents.
   - Verify that file length is significantly reduced and code is clean and readable.

7. **Verification**:
   - Confirm code builds cleanly and passes linting checks.
   - Verify that user flows, state persistence, calculation accuracy, and API payloads remain 100% identical.
