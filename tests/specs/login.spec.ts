import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

const authFile = 'playwright/.auth/user.json';

test.describe('User Login', () => {
  test('should open login modal', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    await homePage.clickLogIn();

    // Verify login modal opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Log in')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    // First register a user
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    const password = 'testpass123';

    const homePage = new HomePage(page);
    await homePage.navigate();

    // Register user
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

    // Now login with the same credentials
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

    // Verify user is logged in
    await expect(page.getByText(`Welcome ${username}`)).toBeVisible({ timeout: 10000 });
  });

  test('should show error for invalid login', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    await homePage.clickLogIn();

    // Fill with invalid credentials
    const invalidDialog = page.getByRole('dialog');
    const invalidUsername = invalidDialog
      .getByPlaceholder(/username/i)
      .or(invalidDialog.getByRole('textbox').first());
    const invalidPassword = invalidDialog
      .getByPlaceholder(/password/i)
      .or(invalidDialog.getByRole('textbox').nth(1));
    await invalidUsername.fill('invaliduser99999');
    await invalidPassword.fill('wrongpassword');

    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('User does not exist');
      dialog.accept();
    });

    await page.getByRole('button', { name: /Log in|Login/i }).click();
    await page.waitForLoadState('domcontentloaded');
  });

  test('should close login modal correctly', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    await homePage.clickLogIn();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Close modal
    const closeBtn = page.getByRole('button', { name: /Close/i });
    await closeBtn.click();
    // Wait for modal to close using auto-waiting
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test.describe('Authenticated User', () => {
    test.use({ storageState: authFile });

    test('should show welcome message when logged in', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.navigate();

      // Verify user is logged in (welcome message should be visible)
      await expect(page.getByText(/Welcome/)).toBeVisible({ timeout: 10000 });
    });
  });
});
