import { defineConfig, devices } from '@playwright/test';

/**
 * Regression test configuration - comprehensive cross-browser testing
 * Run with: npx playwright test --config=playwright-regression.config.ts
 */
export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/debug/**/*.spec.ts'],
  
  fullyParallel: true,
  forbidOnly: true,
  retries: 2, // Always retry for stability
  workers: process.env.CI ? 4 : 3, // More workers for regression
  
  timeout: 90000, // Longer timeout for complex flows
  
  reporter: [
    ['html', { outputFolder: 'playwright-report/regression', open: 'never' }],
    ['json', { outputFile: 'test-results/regression-results.json' }],
    ['junit', { outputFile: 'test-results/regression-results.xml' }],
    ['allure-playwright', { 
      outputFolder: 'allure-results',
      detail: true,
      suiteTitle: true,
    }],
    ['list'],
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'https://www.demoblaze.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20000,
    navigationTimeout: 25000,
  },

  projects: [
    // All desktop browsers
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
    
    // All mobile browsers
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Edge for Windows compatibility
    {
      name: 'msedge',
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },
  ],
});
