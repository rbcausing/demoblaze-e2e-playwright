import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    headless: false, // Force headed mode
    // Ignore SSL certificate errors
    ignoreHTTPSErrors: true,
    // Additional settings for public WiFi
    acceptDownloads: true,
    bypassCSP: true,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ignoreHTTPSErrors: true,
        // Additional browser args for public networks
        launchOptions: {
          args: [
            '--ignore-certificate-errors',
            '--ignore-ssl-errors',
            '--ignore-certificate-errors-spki-list',
            '--disable-web-security',
            '--allow-running-insecure-content',
          ],
        },
      },
    },
  ],
});
