import { defineConfig, devices } from '@playwright/test';

/**
 * Development configuration - for local debugging and test development
 * Run with: npx playwright test --config=playwright-dev.config.ts
 */
export default defineConfig({
  testDir: './tests',

  // Include debug tests in dev mode
  testIgnore: [],

  fullyParallel: false, // Run sequentially for easier debugging
  forbidOnly: false, // Allow test.only during development
  retries: 0, // No retries - see failures immediately
  workers: 1, // Single worker for consistent debugging

  timeout: 120000, // Longer timeout for debugging

  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'on-failure' }]],

  use: {
    baseURL: process.env.BASE_URL || 'https://www.demoblaze.com',

    // Enhanced debugging features
    trace: 'on', // Always collect trace
    screenshot: 'on', // Always take screenshots
    video: 'on', // Always record video

    actionTimeout: 30000,
    navigationTimeout: 30000,

    // Slow down operations for debugging
    launchOptions: {
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    },
  },

  projects: [
    {
      name: 'chromium-dev',
      use: {
        ...devices['Desktop Chrome'],
        // Additional dev-specific settings
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
});
