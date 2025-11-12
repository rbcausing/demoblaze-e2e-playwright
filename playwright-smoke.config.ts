import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke test configuration - fast critical path validation
 * Run with: npx playwright test --config=playwright-smoke.config.ts
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/smoke/**/*.spec.ts',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0, // Increased retries for CI stability
  workers: process.env.CI ? 2 : undefined,

  timeout: 45000, // Increased timeout for CI environment

  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'test-results/smoke-results.json' }],
        ['junit', { outputFile: 'test-results/smoke-results.xml' }],
      ]
    : [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL || 'https://www.demoblaze.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure', // Enable video for debugging CI failures
    actionTimeout: 15000, // Increased for CI
    navigationTimeout: 20000, // Increased for CI
  },

  projects: [
    {
      name: 'chromium-smoke',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-smoke',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-smoke',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
