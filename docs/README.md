# Dev Toolkit

A shareable collection of templates and AI workflows for spec-driven frontend development. Works with **Claude Code** and **Google Antigravity** (or any AI tool that supports saved prompts).

## Why This Exists

AI coding tools work best when they have structured context about your project. Without it, every prompt starts from zero — you repeat yourself, get inconsistent output, and waste time correcting.

This toolkit solves that by providing:
1. **Templates** — standardised docs that describe your project to any AI tool
2. **Workflows** — reusable prompts for common tasks (spec writing, implementation, testing, updates)

Once set up, any developer on the team can run a workflow and get consistent, high-quality output regardless of which AI tool or model they use.

---

## What's Inside

```
claude-toolkit/
  README.md
  templates/                         # Documentation templates (copy to your project)
    feature-spec.md                  # Feature specification template
    api-routes.md                    # API endpoint reference template
    folder-structure.md              # Project structure documentation template
    tech-stack.md                    # Tech stack & setup guide template
  .claude/commands/                  # Claude Code workflows
    create-feature-docs.md
    update-feature-docs.md
    implement-feature.md
    write-e2e-tests.md
  antigravity/.agent/workflows/      # Google Antigravity workflows
    create-feature-docs.md
    update-feature-docs.md
    implement-feature.md
    write-e2e-tests.md
```

---

## Getting Started

### Step 1: Set Up Project Documentation

The workflows depend on three docs that describe your project. Copy the templates and fill them in for your project:

```bash
# Verify the docs folder structure exists and has standard templates
ls docs/
# Edit feature-spec.md, folder-structure.md, tech-stack.md etc.
```

Then edit each file to match your project:

| File | What to fill in |
|------|----------------|
| `docs/api-routes.md` | Every API endpoint your frontend consumes, grouped by module. Include methods, routes, query params, request/response shapes. |
| `docs/folder-structure.md` | Your project's directory tree with comments explaining what each folder is for. Include architecture patterns, naming conventions, data flow. |
| `docs/tech-stack.md` | Framework, libraries, dev tools, scripts, local setup instructions, deployment info. |

These files serve two purposes:
- **For AI tools**: Give the model enough context to write correct code without guessing
- **For developers**: Onboarding docs that stay up to date because the team uses them daily

### Step 2: Install Workflows

#### Claude Code

*Already natively available if using Claude tools to interact.*

Workflows become available as slash commands: `/create-feature-docs`, `/update-feature-docs`, `/implement-feature`, `/write-e2e-tests`.

#### Google Antigravity

*Already natively available since `.agent` is checked into version control.*

Workflows appear in the Agent Manager when you type `/`.

#### Other AI Tools

The workflow files are plain markdown with step-by-step instructions. You can:
- Paste them directly into any AI chat as a prompt
- Add them to your tool's custom instructions/saved prompts
- Reference them in your tool's configuration (e.g., Cursor rules, Windsurf workflows, etc.)

### Step 3: Create Feature Specs

```bash
mkdir -p docs/specs
```

Feature specs go in `docs/specs/<module>/<feature>.spec.md`. Use the workflows to generate them (see below).

---

## Workflows

### `/create-feature-docs`

**What:** Scaffolds a new feature spec from the template.

**When to use:** Starting work on a new feature, or documenting an existing feature that lacks a spec.

**Input:** Route name and flow name (e.g., `posts posts-crud`)

**What it does:**
1. Reads `docs/feature-spec.md` for structure
2. Reads `docs/api-routes.md` for relevant API endpoints
3. Introspects existing code (if the feature is already built) to pre-fill sections
4. Creates `docs/specs/<route>/<flow>.spec.md` with status `draft`

**Output:** A spec file with Data Model, Features, API Endpoints, Business Rules, Acceptance Criteria, UI Behavior, Edge Cases, and Test Scenarios.

---

### `/update-feature-docs`

**What:** Updates an existing spec when requirements change.

**When to use:** A change request comes in, a bug reveals missing spec detail, or code has drifted from the spec.

**Input:** Path to the spec file + optional description of what changed

**What it does:**
1. Reads the current spec
2. If no description given, introspects code to detect drift
3. Updates affected sections (data model, features, test scenarios, etc.)
4. Adds a changelog comment
5. Adjusts spec status if needed (e.g., `tested` -> `implemented` if tests need updating)

---

### `/implement-feature`

**What:** Implements a feature by following its spec document exactly.

**When to use:** After a spec is approved and you want to generate the implementation.

**Input:** Path to the spec file

**What it does:**
1. Reads the spec for requirements
2. Reads `docs/folder-structure.md` and existing code for conventions
3. Creates/modifies files in order: interfaces -> API services -> hooks -> components -> page
4. Follows the spec's exact behavior, form fields, validation, toast messages, and edge cases
5. Updates spec status to `implemented`

---

### `/write-e2e-tests`

**What:** Generates Playwright E2E test files from a spec's Test Scenarios section.

**When to use:** After a feature is implemented and you want to generate tests.

**Input:** Path to the spec file

**What it does:**
1. Reads the spec's Test Scenarios tables
2. Reads the implementation code for exact selectors and API endpoints
3. Generates a complete `e2e/<route>/<flow>.spec.ts` file
4. Runs the tests and fixes failures

---

## Development Workflow

The toolkit supports a **Spec-First** development process:

```
1. /create-feature-docs <route> <flow>     Create the spec
2. Review and approve the spec              Fill in gaps, validate rules
3. /implement-feature <spec-path>           Build it from the spec
4. /write-e2e-tests <spec-path>             Generate tests from the spec
5. Run tests, iterate                       Fix failures, update spec
```

When requirements change later:
```
/update-feature-docs <spec-path> "added bulk delete support"
```

This keeps specs, code, and tests in sync.

---

## Templates Reference

### `feature-spec.md`

The core template. Sections:

| Section | Purpose |
|---------|---------|
| Header | Feature name, status (`draft`/`approved`/`implemented`/`tested`), route, flow, overview |
| Data Model | Entity fields with types and descriptions |
| Features | Numbered sub-features — each with description, behavior, trigger, form fields, API calls, success/error handling |
| API Endpoints | Method/endpoint/description table, query params, response shapes |
| Business Rules | Domain rules (optional — can be embedded in Features instead) |
| Acceptance Criteria | Checkbox list of what "done" means |
| UI Behavior | Entry point, forms, loading states, success/error behavior |
| Edge Cases | What happens in unusual situations |
| Test Scenarios | Given/When/Then tables grouped by sub-feature |

### `api-routes.md`

Documents every API endpoint the frontend consumes. Grouped by module with methods, routes, query params, request bodies, and response shapes.

### `folder-structure.md`

Project directory tree with architecture patterns, naming conventions, and data flow description.

### `tech-stack.md`

Framework, libraries, dev tools, scripts, setup instructions, and deployment info.

---

## Customisation

The templates and workflows are starting points. Adapt them to your project:

- **Different test runner?** Modify `write-e2e-tests.md` to match your tool (Cypress, Vitest, etc.)
- **Different framework?** Update `implement-feature.md` with your project's conventions
- **No E2E tests?** Remove `write-e2e-tests.md` — the other workflows work independently
- **Extra docs?** Add more templates to `templates/` and reference them in your workflows
- **Project-specific patterns?** Add a `docs/conventions.md` and reference it from the workflows

The workflows reference file paths like `docs/api-routes.md` and `docs/folder-structure.md`. If your docs live elsewhere, update the paths in the workflow files.
