# Implement Feature from Spec

Implement a feature by following its spec document. The spec is the single source of truth — code must match the spec exactly, not the other way around.

## Input

Arguments: `$ARGUMENTS` (path to the spec file, e.g., `docs/specs/posts/posts-crud.spec.md`)

## Steps

### 1. Read the spec

- Read the spec file at the provided path
- Understand: Data Model, Features (sub-features), API Endpoints, Business Rules, UI Behavior, Edge Cases

### 2. Read project conventions

- Read `docs/folder-structure.md` to understand where files go
- Read `docs/api-routes.md` to understand API patterns
- Read existing implementations for reference patterns:
  - Pick one well-implemented feature as reference (e.g., look at an existing route in `src/app/(dashboard)/`)
  - Study its: page.jsx, _components/, services, hooks

### 3. Plan the implementation

Based on the spec, determine which files need to be created or modified:

**API Definitions** (`src/api/<route-name>/`):
- Query keys and endpoint constants

**API Services Layer** (`src/services/<route-name>/`):
- Service functions for each API endpoint, calling the `APIinstance`

**Hooks** (`src/hooks/<route-name>/`):
- React Query hooks for each API operation (queries, mutations)
- Follow existing patterns: `useQuery` for reads, `useMutation` for writes
- Cache invalidation on mutations as described in the spec

**Page & Components** (`src/app/(dashboard)/<route-name>/`):
- `page.jsx` — main page component with layout
- `_components/` — feature-specific components (dialogs, forms, tables, cards, etc.)
- Follow the Features section for what components are needed

### 4. Implement in order

Follow this order to avoid dependency issues:

1. **API Definitions** — endpoint constants
2. **API Services** — request functions
3. **Hooks** — React Query wrappers around API services
4. **Components** — UI components (dialogs, forms, columns, cards)
5. **Page** — main page wiring everything together

### 5. Implementation rules

- Follow the spec's Features section for exact behavior
- Match form fields, validation rules, and error messages from the spec
- Use the same toast messages described in the spec
- Follow loading state descriptions (button text changes, disabled states)
- Handle all Edge Cases listed in the spec
- Follow the project's existing patterns:
  - `react-hook-form` for forms
  - `sonner` for toasts
  - `shadcn/ui` components for UI primitives
  - `TanStack React Query` for server state
  - `lucide-react` for icons
- Do NOT add features, validation, or behavior not described in the spec
- Do NOT skip features described in the spec

### 6. Verify

After implementation:
- Ensure every Feature sub-section from the spec has corresponding code
- Ensure every API endpoint from the spec is implemented
- Ensure every form field from the spec exists with correct validation
- Ensure every acceptance criterion from the spec is addressed
- Update the spec status to `implemented`

### 7. Report

After implementing, output:
- List of files created/modified
- Any spec ambiguities or decisions made during implementation
- Suggested next step: run `/write-e2e-tests` to generate tests

## Reference

- Template: `docs/feature-spec.md`
- API reference: `docs/api-routes.md`
- Folder structure: `docs/folder-structure.md`
