import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Demoblaze E2E Testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  // Exclude debug tests from normal test runs
  testIgnore: ['**/debug/**/*.spec.ts'],
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry logic - optimized for stability */
  retries: process.env.CI ? 2 : 0,
  
  /* Worker configuration - optimized for CI vs local */
  workers: process.env.CI ? 2 : undefined, // Changed from 1 to 2 for better CI performance
  
  /* Global timeout for each test */
  timeout: 60000, // 60 seconds per test (Demoblaze can be slow)
  
  /* Expect timeout for assertions */
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI 
    ? [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/results.xml' }],
        ['./tests/utils/customReporter.ts'],
        ['allure-playwright', { 
          outputFolder: 'allure-results',
          detail: true,
          suiteTitle: true,
          environmentInfo: {
            'Test Environment': process.env.BASE_URL || 'https://www.demoblaze.com',
            'Node Version': process.version,
            'OS': process.platform,
          }
        }],
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
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: process.env.CI ? 'retain-on-failure' : 'off', // Save resources locally
    
    /* Global timeout for actions - optimized for Demoblaze's dialog interactions */
    actionTimeout: 15000, // Reduced from 30s - most actions are quick
    
    /* Global timeout for navigation - Demoblaze pages load within 10s typically */
    navigationTimeout: 20000, // Reduced from 30s
    
    /* Ignore HTTPS errors if needed for certain environments */
    ignoreHTTPSErrors: false,
  },

  /* Configure projects for major browsers */
  projects: [
    // Desktop browsers - primary testing targets
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports - conditional based on environment
    ...(process.env.SKIP_MOBILE ? [] : [
      {
        name: 'mobile-chrome',
        use: { ...devices['Pixel 5'] },
      },
      {
        name: 'Mobile Safari',
        use: { ...devices['iPhone 12'] },
      },
    ]),
  ],
});
