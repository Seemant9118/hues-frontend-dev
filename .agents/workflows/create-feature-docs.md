# Create Feature Documentation (Spec)

Generate a feature spec document for a route/flow combination. The spec follows the team's standardised template and serves as the single source of truth for implementation and E2E test writing.

## Input

Arguments: `$ARGUMENTS` (format: `<route-name> <flow-name>`)

Parse the first word as `route-name` and the second as `flow-name`.

## Steps

### 1. Read the template and exemplar

- Read `docs/feature-spec.md` for the structure
- Read existing specs in `docs/specs/` for reference on how a well-written spec looks (pick the most comprehensive one available)

### 2. Read API reference

- Read `docs/api-routes.md` and find the section matching the route name
- Extract: endpoints, methods, query params, descriptions

### 3. Introspect existing code (if it exists)

Check if these paths exist and read them to pre-fill the spec:

- `src/app/(dashboard)/<route-name>/page.jsx` — page component, layout, title
- `src/app/(dashboard)/<route-name>/_components/` — all component files (dialogs, forms, columns, etc.)
- `src/services/<route-name>/` — API endpoint service definitions and request functions
- `src/api/<route-name>/` — API endpoint path definitions
- `src/hooks/<route-name>/` — React Query hooks (queries, mutations)

From the code, extract:
- **Data Model**: Fields, types, and descriptions from TypeScript interfaces
- **API Endpoints**: Actual endpoint paths and methods from services.ts
- **Features**: Sub-features, UI behavior, form fields from page.tsx and _components/
- **Form Fields**: Field names, types, validation from dialog/form components

### 4. Generate the spec file

Create `docs/specs/<route-name>/<flow-name>.spec.md` with:

**If code exists (existing feature):**
- Pre-fill Data Model
- Pre-fill API Endpoints from services and api-routes.md
- Pre-fill Features section with sub-features found in code (list, create, edit, delete, search, filter, etc.)
- Set Status to `draft`
- Add acceptance criteria as checkboxes based on discovered features
- Add test scenarios grouped by sub-feature (List, Create, Edit, Delete) following the Given/When/Then table format
- Write Edge Cases based on validation logic and error handling found in code

**If code does not exist (new feature):**
- Use the template skeleton structure
- Fill in the route path
- Pre-fill API Endpoints from api-routes.md if the route has API docs
- Add `<!-- TODO: Fill in -->` markers in sections that need manual input
- Set Status to `draft`

### 5. Quality checks

Verify the generated spec:
- Has all sections from the template (Header, Data Model, Features, API Endpoints, Business Rules, Acceptance Criteria, UI Behavior, Edge Cases, Test Scenarios)
- Test Scenarios are grouped by sub-feature with numbered Given/When/Then tables
- Data Model uses Field/Type/Description table format
- API Endpoints uses Method/Endpoint/Description table format
- Is compatible with the `/write-e2e-tests` skill (same format, superset of info)

### 6. Report

After creating the file, output:
- Path to the created spec file
- Summary of what was pre-filled vs. what needs manual input
- Suggested next step: review the spec, then use `/write-e2e-tests` to generate tests

## Reference

- Template: `docs/feature-spec.md`
- API reference: `docs/api-routes.md`
- Folder structure: `docs/folder-structure.md`
