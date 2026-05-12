# Tech Stack & Setup

## Core Framework

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 14.x | App Router |
| Language | JavaScript/JSX | ESNext | Core application logic |
| Runtime | React | 18.x | UI library |
| Styling | Tailwind CSS | 3.4.x | Utility-first CSS |
| UI Components | Radix UI | latest | Headless accessible components |
| Package Manager | npm | 10.x | Package manager |

## Key Libraries

| Category | Library | Purpose |
|----------|---------|---------|
| Data Fetching | TanStack Query v5 | Server state, caching, background refetch |
| HTTP Client | Axios | API requests |
| Tables | TanStack Table v8 | Data tables with sorting, filtering |
| Charts | Recharts | Dashboard charts and visualizations |
| Dates | Moment / Dayjs | Date manipulation and formatting |
| State | React Context | Client-side global state |
| Icons | Lucide React | Icon library |
| Carousels | Embla / Drag & Drop | react-dnd, react-drag-drop-files |
| Editor | React Quill | WYSIWYG Editor |

## Dev Tooling

| Tool | Purpose |
|------|---------|
| ESLint & Prettier | Linting + formatting |
| Husky | Git hooks (pre-commit, commit-msg |
| lint-staged | Run formatting on staged files before commit |
| Playwright | Integration / E2E testing |
| Vitest | Unit tests |

---

## Scripts

```bash
npm run dev           # Start dev server
npm run build         # App build
npm run lint          # ESLint check
npm run test          # Run Vitest unit tests
npm run test:e2e      # Run Playwright integration tests (headless)
```

---

## Project Structure

```
hues-frontend/
  __tests__/          # Testing modules (Vitest unit_tests & Playwright e2e)
  dictonaries/        # i18n configurations
  public/             # Static assets
  src/
    api/              # API path/endpoint configurations
    app/              # Next.js App Router (incl. dashboard, auth)
    components/       # Shared UI components
    context/          # React Context providers
    hooks/            # Custom React hooks
    services/         # API Client & Domain-specific business logic 
  docs/               # Project documentation
    specs/            # Feature specifications
```

---

## Next.js Configuration

Standard Next 14 configuration with `jsconfig.json` defining absolute import aliases. Sentry is integrated via `sentry.client.config.js`, `sentry.server.config.js`, etc. Internationalization is set up via `next-intl`.

---

## ESLint & Prettier Configuration

- Configuration based on `eslint-config-airbnb` and `eslint-config-next`
- Prettier is configured via `.prettierrc` to handle Tailwind CSS class sorting.

---

## Git Hooks

- **pre-commit**: `npx lint-staged` (runs ESLint and Prettier formatting on components)

---

## Local Setup

```bash
# 1. Clone and install
git clone <repo>
cd hues-frontend
npm install

# 2. Set up environment variables
cp .env.example .env  # Configure API URLs

# 3. Run dev server
npm run dev

# 4. Run tests
npm run test:e2e
```
