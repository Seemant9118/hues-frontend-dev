# Folder Structure

Complete directory layout for the **HUES Frontend** Next.js application.

```text
hues-frontend/
├── __tests__/                  # Testing files (Vitest for unit_tests, Playwright for e2e)
├── .agent/                    # Agentic coding configuration
├── .github/                   # GitHub Actions (S3 deployment, etc.)
├── .husky/                    # Git hooks (pre-commit, commit-msg)
├── dictonaries/               # i18n localization JSON files (grouped by domain)
├── docs/                      # Project documentation (folder structure, feature specs, etc.)
├── public/                    # Static assets (images, icons, etc.)
│   ├── assets/
│   └── icons/
├── src/                       # Main source code
│   ├── api/                   # Endpoint definitions per domain
│   │   ├── adminApi/
│   │   ├── dashboard/
│   │   ├── user_auth/
│   │   └── ...
│   ├── app/                   # Next.js App Router
│   │   └── [locale]/          # Internationalization wrapper
│   │       ├── (auth)/        # Authentication routes
│   │       ├── (dashboard)/   # Main application/dashboard routes
│   │       │   └── dashboard/ # Nested dashboard sub-routes
│   │       ├── (landing-page)/# Landing/public pages
│   │       ├── api/           # Local API route handlers
│   │       ├── layout.js      # Root localized layout
│   │       └── page.jsx       # Main entry page
│   ├── appUtils/              # Common utilities used across the App router
│   ├── components/            # UI components (modular & reusable)
│   │   ├── ui/                # Base UI components (shadcn-like)
│   │   ├── Form/              # Reusable form components
│   │   ├── Modals/            # Global/Shared modals
│   │   ├── dashboard/         # Dashboard-specific components
│   │   └── ...
│   ├── context/               # React Context providers
│   ├── hooks/                 # Project-wide custom React hooks
│   ├── i18n/                  # Localization configuration (messages, etc.)
│   ├── lib/                   # Library configurations (firebase, locale, etc.)
│   ├── services/              # API Client & Domain-specific business logic
│   │   ├── Dashboard_Services/
│   │   ├── User_Auth_Service/
│   │   ├── axios-client.js
│   │   └── index.js           # API instance configuration
│   └── globals/               # Global styles/styles configuration
├── Dockerfile                 # Containerization config
├── package.json               # Dependencies and scripts
└── next.config.mjs            # Next.js configuration
```

---

## Key Conventions

### 1. Data Fetching Architecture
The application follows a structured three-layer API integration pattern:
1. **API Layer (`src/api/`)**: Defines endpoint paths and keys (e.g., `src/api/dashboard/dashboardApi.js`).
2. **Services Layer (`src/services/`)**: Implements functions to fetch data using a configured `APIinstance` (Axios wrapper), handling query params and transformations (e.g., `src/services/Dashboard_Services/DashboardServices.js`).
3. **Consumption Layer**: Components or Hooks call these services to fetch data for the UI.

### 2. Localization (i18n)
- The project uses `next-intl` or similar for internationalization.
- Routes are wrapped in `[locale]`.
- Localization strings are stored in `dictonaries/` (Note the spelling in the root folder).

### 3. Folder Navigation
- **(auth)**: Contains login, registration, and password recovery routes.
- **(dashboard)**: Contains the core feature routes like Sales, Purchases, Inventory, and Catalogue.
- **components/ui**: Contains the primitive UI elements used for building layout modules.

### 4. Code Colocation
- Domain-specific logic is often grouped in subfolders within `src/api`, `src/services`, and `src/components`.

### 5. Utilities
- `src/appUtils`: Contains logic specific to the application flow (error handling, redirection, validation).
- `src/lib`: Contains generic library wrappers or configuration (config files for Firebase, RBAC, etc.).

---

## Tooling & Config
- **Deployment**: Configured for S3/GitHub Actions (.github/workflows).
- **Hooks**: Husky handles pre-commit checks.
- **State Management**: React Context, typically initialized in `src/context`.
- **Styling**: Tailored global CSS and satoshi fonts within the app router.
