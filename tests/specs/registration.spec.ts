import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('User Registration', () => {
  test('should open sign up modal @smoke', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    await homePage.clickSignUp();

    // Verify sign up modal opens
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
  });

  test('should register new user successfully', async ({ page }) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const uniquePassword = 'testpass123';

    const homePage = new HomePage(page);
    await homePage.navigate();

    await homePage.clickSignUp();

    // Fill registration form
    // Note: DemoBlaze form fields don't have proper labels, using getByPlaceholder or getByRole as fallback
    const dialog = page.getByRole('dialog');
    const usernameField = dialog
      .getByPlaceholder(/username/i)
      .or(dialog.getByRole('textbox').first());
    const passwordField = dialog
      .getByPlaceholder(/password/i)
      .or(
        dialog.getByRole('textbox', { name: /password/i }).or(dialog.getByRole('textbox').nth(1))
      );
    await usernameField.fill(uniqueUsername);
    await passwordField.fill(uniquePassword);

    // Submit registration
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('Sign up successful');
      dialog.accept();
    });

    await page.getByRole('button', { name: /Sign up|Register/i }).click();
    await page.waitForLoadState('domcontentloaded');
  });

  test('should show error for duplicate username', async ({ page }) => {
    const timestamp = Date.now();
    const username = `duplicate${timestamp}`;
    const password = 'testpass123';

    const homePage = new HomePage(page);
    await homePage.navigate();

    // Register first time
    await homePage.clickSignUp();
    const dialog1 = page.getByRole('dialog');
    const usernameField1 = dialog1
      .getByPlaceholder(/username/i)
      .or(dialog1.getByRole('textbox').first());
    const passwordField1 = dialog1
      .getByPlaceholder(/password/i)
      .or(dialog1.getByRole('textbox').nth(1));
    await usernameField1.fill(username);
    await passwordField1.fill(password);

    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /Sign up|Register/i }).click();
    await page.waitForLoadState('domcontentloaded');

    // Try to register again with same username
    await homePage.clickSignUp();
    const dialog2 = page.getByRole('dialog');
    const usernameField2 = dialog2
      .getByPlaceholder(/username/i)
      .or(dialog2.getByRole('textbox').first());
    const passwordField2 = dialog2
      .getByPlaceholder(/password/i)
      .or(dialog2.getByRole('textbox').nth(1));
    await usernameField2.fill(username);
    await passwordField2.fill(password);

    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('This user already exist');
      dialog.accept();
    });

    await page.getByRole('button', { name: /Sign up|Register/i }).click();
    await page.waitForLoadState('domcontentloaded');
  });

  test('should close sign up modal correctly', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    await homePage.clickSignUp();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Close modal using close button
    const closeButton = page.getByRole('button', { name: /Close/i });
    await closeButton.click();
    // Wait for modal to close using auto-waiting
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
