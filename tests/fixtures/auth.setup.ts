import { test as setup, expect } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

/**
 * Authentication setup fixture
 * Creates a logged-in session and saves it to storageState
 * This allows tests to reuse authenticated sessions without logging in each time
 */
const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Ensure the auth directory exists
  try {
    await mkdir(dirname(authFile), { recursive: true });
  } catch (error) {
    // Directory might already exist, which is fine
    console.log('Auth directory check:', error);
  }
  // Generate unique username to avoid conflicts
  const timestamp = Date.now();
  const username = `testuser${timestamp}`;
  const password = 'testpass123';

  // Navigate to DemoBlaze
  await page.goto('https://www.demoblaze.com/');
  await page.waitForLoadState('domcontentloaded');

  // Register new user
  await page.getByRole('link', { name: 'Sign up' }).click();
  // Wait for sign-up modal to be visible with longer timeout for CI
  const signupDialog = page.getByRole('dialog').filter({ hasText: /Sign up/i });
  await signupDialog.waitFor({ state: 'visible', timeout: 15000 });

  // Fill registration form - scope to sign-up dialog
  await signupDialog
    .getByLabel('Username', { exact: false })
    .or(signupDialog.locator('#sign-username'))
    .fill(username);
  await signupDialog
    .getByLabel('Password', { exact: false })
    .or(signupDialog.locator('#sign-password'))
    .fill(password);

  // Submit registration
  page.once('dialog', dialog => {
    expect(dialog.message()).toContain('Sign up successful');
    dialog.accept();
  });

  await signupDialog.getByRole('button', { name: /Sign up|Register/i }).click();
  // Wait for dialog to be handled and sign-up modal to close
  await page.waitForLoadState('domcontentloaded');
  // Ensure sign-up modal is closed before opening login
  await signupDialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
    // Modal might already be closed, which is fine
  });

  // Now login with the same credentials
  await page.getByRole('link', { name: 'Log in' }).click();
  // Wait for login modal to be visible with longer timeout for CI
  const loginDialog = page.getByRole('dialog').filter({ hasText: /Log in/i });
  await loginDialog.waitFor({ state: 'visible', timeout: 15000 });

  // Fill login form - scope to login dialog only to avoid matching sign-up fields
  await loginDialog.locator('#loginusername').fill(username);
  await loginDialog.locator('#loginpassword').fill(password);

  // Submit login - scope to login dialog
  await loginDialog.getByRole('button', { name: /Log in|Login/i }).click();
  // Wait for login to complete - check for welcome message
  await page.waitForLoadState('domcontentloaded');

  // Verify user is logged in with longer timeout for CI
  await expect(page.getByText(`Welcome ${username}`)).toBeVisible({ timeout: 20000 });

  // Save signed-in state to 'playwright/.auth/user.json'
  await page.context().storageState({ path: authFile });
});
