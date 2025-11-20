import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

const authFile = 'playwright/.auth/user.json';

test.describe('User Logout', () => {
  test('should handle logout functionality', async ({ page }) => {
    // Register and login first
    const timestamp = Date.now();
    const username = `logouttest${timestamp}`;
    const password = 'testpass123';

    const homePage = new HomePage(page);
    await homePage.navigate();

    // Register
    await homePage.clickSignUp();
    const signupDialog = page.getByRole('dialog');
    const signupUsername = signupDialog
      .getByPlaceholder(/username/i)
      .or(signupDialog.getByRole('textbox').first());
    const signupPassword = signupDialog
      .getByPlaceholder(/password/i)
      .or(signupDialog.getByRole('textbox').nth(1));
    await signupUsername.fill(username);
    await signupPassword.fill(password);
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /Sign up|Register/i }).click();
    await page.waitForLoadState('domcontentloaded');

    // Login
    await homePage.clickLogIn();
    const loginDialog = page.getByRole('dialog');
    const loginUsername = loginDialog
      .getByPlaceholder(/username/i)
      .or(loginDialog.getByRole('textbox').first());
    const loginPassword = loginDialog
      .getByPlaceholder(/password/i)
      .or(loginDialog.getByRole('textbox').nth(1));
    await loginUsername.fill(username);
    await loginPassword.fill(password);
    await page.getByRole('button', { name: /Log in|Login/i }).click();
    await page.waitForLoadState('domcontentloaded');

    // Verify logged in
    await expect(page.getByText(`Welcome ${username}`)).toBeVisible({ timeout: 10000 });

    // Logout
    await page.getByRole('link', { name: /Log out|Logout/i }).click();
    await page.waitForLoadState('domcontentloaded');

    // Verify logged out - check that welcome message is gone and login link is visible
    await expect(page.getByText(`Welcome ${username}`)).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible({ timeout: 5000 });
  });

  test.describe('Authenticated User', () => {
    test.use({ storageState: authFile });

    test('should logout from authenticated session', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.navigate();

      // Verify user is logged in
      await expect(page.getByText(/Welcome/)).toBeVisible({ timeout: 10000 });

      // Logout
      await page.getByRole('link', { name: /Log out|Logout/i }).click();
      await page.waitForLoadState('domcontentloaded');

      // Verify logged out
      await expect(page.getByText(/Welcome/)).not.toBeVisible();
      await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible({ timeout: 5000 });
    });
  });
});
