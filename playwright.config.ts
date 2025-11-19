import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for DemoBlaze E2E Testing
 * Production-grade configuration with resilient locators and proper CI/CD setup
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Match test files */
  testMatch: '**/*.spec.ts',
  
  /* Ignore fixture and utility files */
  testIgnore: ['**/fixtures/**', '**/utils/**', '**/pages/**', '**/config/**', '**/data/**'],

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry logic - optimized for stability */
  retries: process.env.CI ? 0 : 0, // No retries to speed up CI

  /* Worker configuration - optimized for CI vs local */
  workers: process.env.CI ? 4 : undefined, // Increased to 4 workers for faster CI

  /* Global timeout for each test */
  timeout: 30000, // 30 seconds per test - optimized for CI

  /* Expect timeout for assertions */
  expect: {
    timeout: 8000, // 8 seconds for assertions
  },

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/results.xml' }],
      ]
    : [
        ['html', { outputFolder: 'playwright-report', open: 'on-failure' }],
        ['list'], // Console output for local development
      ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.BASE_URL || 'https://www.demoblaze.com',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Global timeout for actions */
    actionTimeout: 10000,

    /* Global timeout for navigation */
    navigationTimeout: 15000,

    /* Ignore HTTPS errors if needed for certain environments */
    ignoreHTTPSErrors: false,
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      testDir: './tests/fixtures',
    },

    // Desktop browsers - Chromium only in CI for speed, all browsers locally
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    
    // Firefox and WebKit - only run locally or when TEST_ALL_BROWSERS=true
    ...(process.env.CI && !process.env.TEST_ALL_BROWSERS
      ? []
      : [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            dependencies: ['setup'],
          },
          {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            dependencies: ['setup'],
          },
        ]),

    // Mobile viewports - skip in CI by default to speed up runs
    // Set SKIP_MOBILE=false to enable mobile testing
    ...(process.env.CI || process.env.SKIP_MOBILE
      ? []
      : [
          {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
            dependencies: ['setup'],
          },
          {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
            dependencies: ['setup'],
          },
        ]),
  ],
});
