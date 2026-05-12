# Update Feature Documentation (Spec)

Update an existing feature spec when a change request comes in. Keeps the spec as the single source of truth by reflecting code changes, new requirements, or bug fixes back into the spec document.

## Input

Arguments: `$ARGUMENTS` (format: `<spec-file-path> [change description]`)

- First argument: path to the existing spec file (e.g., `docs/specs/posts/posts-crud.spec.md`)
- Remaining arguments: description of what changed (optional — if omitted, introspect code to detect changes)

## Steps

### 1. Read the current spec

- Read the spec file at the provided path
- Understand the current Data Model, Features, API Endpoints, Business Rules, Acceptance Criteria, UI Behavior, Edge Cases, and Test Scenarios

### 2. Understand the change

**If change description is provided:**
- Parse the description to understand what was added, modified, or removed

**If no description provided:**
- Read the current code to detect drift from the spec:
  - `src/app/(dashboard)/<route-name>/page.jsx` and `_components/`
  - `src/services/<route-name>/`
  - `src/api/<route-name>/`
  - `src/hooks/<route-name>/`
- Compare code against the spec to find:
  - New fields not matching the Data Model
  - New API endpoints not in the spec
  - New components/dialogs not documented in Features
  - Changed validation rules or form fields
  - New hooks not documented

### 3. Update the spec

Apply changes to the relevant sections:

- **Data Model** — Add/remove/modify fields to match current interfaces
- **Features** — Add new sub-features, update behavior descriptions, modify form fields
- **API Endpoints** — Add new endpoints, update query params
- **Business Rules** — Add/modify rules based on new requirements
- **Acceptance Criteria** — Add new criteria for new functionality, uncheck modified criteria
- **UI Behavior** — Update entry points, form fields, loading states, success/error behavior
- **Edge Cases** — Add new edge cases introduced by the change
- **Test Scenarios** — Add new test scenarios for new functionality, update existing scenarios if behavior changed

### 4. Mark the update

- If the spec was `tested`, set Status back to `implemented` (tests need updating)
- If the spec was `implemented`, keep as `implemented`
- If the spec was `approved`, keep as `approved`
- Add a changelog comment at the bottom of the spec if significant changes were made:

```markdown
<!-- Changelog
- YYYY-MM-DD: [Brief description of what changed]
-->
```

### 5. Update related tests (if needed)

- Check if `__tests__/e2e/<route>/<flow>.spec.ts` exists
- If test scenarios were added or modified, inform the user to run `/write-e2e-tests` to regenerate tests

### 6. Report

After updating, output:
- Summary of sections that were modified
- List of new test scenarios added (if any)
- Whether E2E tests need updating
- Suggested next step

## Reference

- Template: `docs/feature-spec.md`
- API reference: `docs/api-routes.md`
- Folder structure: `docs/folder-structure.md`
