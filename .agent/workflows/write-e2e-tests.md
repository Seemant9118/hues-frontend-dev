---
description: 
---

# Write Playwright E2E Tests from Spec

You are writing Playwright end-to-end tests for a Next.js admin panel. Generate a complete `*.spec.ts` test file based on a feature spec document.

## Input

The user will provide a spec file path (e.g., `docs/specs/users/users-list.spec.md`). Read the spec file first to understand the feature, data model, components, API endpoints, and test scenarios.

## Project Context

- **Test directory:** `__tests__/e2e/` (organized by feature, e.g., `__tests__/e2e/users/`, `__tests__/e2e/languages/`)
- **Config:** `playwright.config.js` — baseURL is `http://localhost:3000`
- **Auth:** Tests depend on `global-setup.ts` and `login-auth.json` which handles global state storage. All non-auth tests reuse saved auth automatically.
- **Framework:** Next.js App Router with client components, TanStack React Query, Radix UI primitives, shadcn/ui components

## Testing Strategy

### Philosophy

Every feature follows: **Spec First -> Implement -> Test**

1. Define the feature spec (business rules, acceptance criteria, edge cases)
2. Write Playwright integration tests based on the spec
3. Implement the feature (tests start passing)
4. Update spec status to `tested`

### Workflow: Adding a New Feature

```
Step 0:  Run /create-feature-docs <route-name> <flow-name>
         Scaffolds the spec from the template, pre-fills from code if available

Step 1:  Review the generated docs/specs/<module>/<feature>.spec.md
         Fill in any TODO markers, validate business rules and edge cases
         Set status: approved

Step 2:  Run /write-e2e-tests docs/specs/<module>/<feature>.spec.md
         Write test cases from the spec's "Test Scenarios" table

Step 3:  Implement the feature (or run /implement-feature)
         Tests start passing

Step 4:  Update spec — check off acceptance criteria
         Set status: tested
```

### Directory Structure

Organization: **route > flow**. Each route (page) is a folder. Each user flow within that page is a separate spec + test file.

```
docs/specs/<route>/<flow>.spec.md   ->   __tests__/e2e/<route>/<flow>.spec.ts
```

Rules:
- Every `docs/specs/<route>/<flow>.spec.md` has a matching `__tests__/e2e/<route>/<flow>.spec.ts`
- One flow = one spec = one test file
- If a flow grows beyond ~15 test scenarios, consider splitting it further

### Real Backend (Default)
- All CRUD flows (posts, tags, events, languages, users) test against staging
- Tests create real data, verify it appears, then clean up
- Auth uses fixed test phone + OTP on staging

### Mocked (Exceptions Only)
- **Login flow** — OTP is fixed but mocking is acceptable for testing error states
- **Network errors** — 500s, timeouts, offline states
- **Edge cases** — empty lists, pagination boundaries that are hard to set up with real data

### Auth Strategy

Login once per test suite, not per test:

1. `auth.fixture.ts` performs a real login (test phone + fixed OTP)
2. Saves auth tokens to Playwright's `storageState`
3. All other test files reuse the authenticated session
4. No test repeats the login flow unnecessarily

### Test Data Strategy

**Creation:**
- Tests that need data (e.g., "edit a post") create it at the start via the UI or API
- Use unique identifiers (timestamps/random suffixes) to avoid collisions

**Cleanup:**
- Tests clean up after themselves (delete created posts, tags, etc.)
- Use `test.afterEach` or `test.afterAll` for cleanup
- If cleanup fails, it should not fail the test — log a warning instead

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Spec doc | `kebab-case.spec.md` | `create-post.spec.md` |
| Test file | `kebab-case.spec.ts` | `create-post.spec.ts` |
| Test describe | Feature name | `Login Page - OTP Flow` |
| Test name | Behavior description | `valid OTP redirects to dashboard` |
| Fixture | `kebab-case.fixture.ts` | `auth.fixture.ts` |

## Conventions (follow these exactly)

### File Structure
```
import { expect, type Page, test } from '@playwright/test';

// Constants
const PAGE_URL = './feature-name/';

// Helpers (navigation, common actions)

// Test sections organized by feature area using test.describe()
```

### Navigation Helpers
Always create two helpers:
1. `gotoPage(page)` — navigates and waits for heading to be visible (15s timeout)
2. `gotoPageWithData(page)` — navigates, waits for API response AND first table row to be visible

```typescript
async function gotoPage(page: Page) {
  await page.goto(PAGE_URL);
  await expect(page.getByRole('heading', { name: /feature/i })).toBeVisible({
    timeout: 15_000,
  });
}

async function gotoPageWithData(page: Page) {
  const apiPromise = page.waitForResponse(
    (res) => res.url().includes('/api-endpoint') && res.ok(),
    { timeout: 15_000 },
  );
  await gotoPage(page);
  await apiPromise;
  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 10_000,
  });
}
```

### API Response Assertions
Always use `waitForResponse` to verify API calls are triggered with correct params:
```typescript
const apiPromise = page.waitForResponse(
  (res) =>
    res.url().includes('/endpoint') &&
    res.url().includes('param=value') &&
    res.ok(),
  { timeout: 10_000 },
);
// ... trigger action ...
const response = await apiPromise;
expect(response.ok()).toBeTruthy();
```

**Important:** Set up `waitForResponse` BEFORE triggering the action that causes the request.

### Selectors (priority order)
1. `page.getByRole()` — for standard HTML roles (heading, button, option, columnheader, combobox)
2. `page.getByText()` — for visible text content
3. `page.getByLabel()` — for form inputs
4. `page.getByPlaceholder()` — for search inputs
5. `page.locator('[data-slot="..."]')` — for shadcn/Radix components:
   - `[data-slot="checkbox"]` for Checkbox
   - `[data-slot="popover-trigger"]` for Popover triggers (use `button[data-slot="popover-trigger"]` with `{ hasText }` to disambiguate from column header buttons)
6. `page.locator('table tbody tr')` — for table rows

### Select/Dropdown Filters
Target selects via their label text, then navigate to the combobox:
```typescript
const selectTrigger = page
  .getByText(/filter label text/i)
  .locator('..')
  .getByRole('combobox');
await selectTrigger.click();
await page.getByRole('option', { name: /option text/i }).click();
```

### Timeouts
- Navigation/page load: `15_000`
- API responses: `10_000`
- Element visibility: `10_000`
- Default (Playwright): leave as-is

### Test Organization
Group tests into `test.describe` blocks by feature area:
- Layout (page renders, columns visible, header, filters present)
- Loading state
- Individual filter sections (one describe per filter)
- Combined filters
- Infinite scroll / pagination
- URL persistence
- CRUD flows (use `test.describe.serial` for dependent operations)

### Infinite Scroll
Use `scrollIntoViewIfNeeded()` on the last table row rather than manual scroll evaluation:
```typescript
const lastRow = page.locator('table tbody tr').last();
await lastRow.scrollIntoViewIfNeeded();
```

### URL Filter Persistence
Test by: apply filter -> assert URL contains param -> reload -> assert API call includes the param.

## Running Tests

```bash
npm run test:e2e              # All E2E tests

# Run a specific spec
npx playwright test __tests__/e2e/auth/login.spec.ts

# Run tests matching a grep pattern
npx playwright test --grep "create post"
```

## Steps

1. Read the spec file provided by the user
2. Read the actual page implementation files (page.tsx, columns.tsx, components) to understand exact text, selectors, and API endpoints
3. Read existing test files in `__tests__/e2e/` for reference patterns
4. Generate the complete test file covering all test scenarios from the spec
5. Write the file to `__tests__/e2e/{feature-name}/{feature-name}.spec.ts`
6. Run the tests with `npx playwright test __tests__/e2e/{feature-name}/ --reporter=list` and fix any failures

## Spec file: $ARGUMENTS
