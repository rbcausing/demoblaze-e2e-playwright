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
  retries: process.env.CI ? 1 : 0, // Fewer retries for smoke tests
  workers: process.env.CI ? 2 : undefined,

  timeout: 30000, // Shorter timeout for smoke tests

  reporter: [['list'], ['html', { outputFolder: 'playwright-report/smoke', open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL || 'https://www.demoblaze.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off', // No video for fast smoke tests
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    {
      name: 'chromium-smoke',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
