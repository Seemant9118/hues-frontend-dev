// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  // Global test timeout — increased to 90s to accommodate auth-heavy flows
  timeout: 90_000,

  globalSetup: './__tests__/e2e/global-setup.ts',
  testDir: './__tests__/e2e',

  // Only match .spec.ts files to avoid accidentally running other files
  testMatch: '**/*.spec.ts',

  // Run tests sequentially to avoid race conditions on shared auth state
  fullyParallel: false,
  forbidOnly: !!process.env.CI,

  // Allow retries in CI to handle network flakiness
  retries: process.env.CI ? 2 : 0,

  // Reduce workers to avoid auth contention; bump back to 4 only in CI
  workers: process.env.CI ? 2 : 1,

  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',

    // Shared auth state from global-setup
    storageState: './login-auth.json',

    // Record traces always so failures are easy to debug
    trace: 'on',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Per-action timeout (for individual clicks, fills, etc.)
    actionTimeout: 15_000,

    // Navigation timeout (for page.goto, page.waitForURL, etc.)
    navigationTimeout: 30_000,
  },

  /* Configure projects — run only Chromium by default; enable others explicitly */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment if cross-browser testing is needed:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000, // Wait up to 60s for the dev server to be ready
  },
});
