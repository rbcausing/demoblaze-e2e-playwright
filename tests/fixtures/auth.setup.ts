import { test as setup, expect } from '@playwright/test';

/**
 * Authentication setup fixture
 * Creates a logged-in session and saves it to storageState
 * This allows tests to reuse authenticated sessions without logging in each time
 */
const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Generate unique username to avoid conflicts
  const timestamp = Date.now();
  const username = `testuser${timestamp}`;
  const password = 'testpass123';

  // Navigate to DemoBlaze
  await page.goto('https://www.demoblaze.com/');
  await page.waitForLoadState('domcontentloaded');

  // Register new user
  await page.getByRole('link', { name: 'Sign up' }).click();
  // Wait for modal to be visible instead of timeout
  await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 });

  // Fill registration form
  await page
    .getByLabel('Username', { exact: false })
    .or(page.locator('#sign-username'))
    .fill(username);
  await page
    .getByLabel('Password', { exact: false })
    .or(page.locator('#sign-password'))
    .fill(password);

  // Submit registration
  page.once('dialog', dialog => {
    expect(dialog.message()).toContain('Sign up successful');
    dialog.accept();
  });

  await page.getByRole('button', { name: /Sign up|Register/i }).click();
  // Wait for dialog to be handled
  await page.waitForLoadState('domcontentloaded');

  // Now login with the same credentials
  await page.getByRole('link', { name: 'Log in' }).click();
  // Wait for login modal to be visible
  await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 });

  // Fill login form
  await page
    .getByLabel('Username', { exact: false })
    .or(page.locator('#loginusername'))
    .fill(username);
  await page
    .getByLabel('Password', { exact: false })
    .or(page.locator('#loginpassword'))
    .fill(password);

  // Submit login
  await page.getByRole('button', { name: /Log in|Login/i }).click();
  // Wait for login to complete - check for welcome message
  await page.waitForLoadState('domcontentloaded');

  // Verify user is logged in
  await expect(page.getByText(`Welcome ${username}`)).toBeVisible({ timeout: 10000 });

  // Save signed-in state to 'playwright/.auth/user.json'
  await page.context().storageState({ path: authFile });
});
