import { test, expect } from '../fixtures/testFixtures';

test.describe('Demoblaze User Authentication', () => {
  test('should open sign up modal @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');

    // Click sign up link - use ID selector for reliability
    await page.click('#signin2');

    // Verify sign up modal opens
    await expect(page.locator('#signInModal')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#signInModal >> text=Sign up')).toBeVisible();
  });

  test('should open login modal', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');

    // Click log in link
    await page.click('#login2');

    // Verify login modal opens
    await expect(page.locator('#logInModal')).toBeVisible();
    await expect(page.locator('#logInModal >> text=Log in')).toBeVisible();
  });

  test('should register new user successfully', async ({ page }) => {
    const timestamp = Date.now();
    const uniqueUsername = `testuser${timestamp}`;
    const uniquePassword = 'testpass123';

    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');

    // Open sign up modal
    await page.click('#signin2');
    await page.waitForSelector('#signInModal');

    // Fill registration form
    await page.fill('#sign-username', uniqueUsername);
    await page.fill('#sign-password', uniquePassword);

    // Submit registration
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('Sign up successful');
      dialog.accept();
    });

    await page.click('button[onclick="register()"]');
    await page.waitForTimeout(2000); // Wait for dialog to appear and be handled
  });

  test('should login with valid credentials', async ({ page }) => {
    // First register a user
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    const password = 'testpass123';

    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');

    // Register user
    await page.click('#signin2');
    await page.waitForSelector('#signInModal');
    await page.fill('#sign-username', username);
    await page.fill('#sign-password', password);

    page.once('dialog', dialog => dialog.accept());
    await page.click('button[onclick="register()"]');
    await page.waitForTimeout(2000);

    // Now login with the same credentials
    await page.click('#login2');
    await page.waitForSelector('#logInModal');
    await page.fill('#loginusername', username);
    await page.fill('#loginpassword', password);
    await page.click('button[onclick="logIn()"]');
    await page.waitForTimeout(2000);

    // Verify user is logged in (username should appear in navigation)
    await expect(page.locator(`#nameofuser`)).toContainText(`Welcome ${username}`);
  });

  test('should show error for duplicate username', async ({ page }) => {
    const timestamp = Date.now();
    const username = `duplicate${timestamp}`;
    const password = 'testpass123';

    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');

    // Register first time
    await page.click('#signin2');
    await page.waitForSelector('#signInModal');
    await page.fill('#sign-username', username);
    await page.fill('#sign-password', password);

    page.once('dialog', dialog => dialog.accept());
    await page.click('button[onclick="register()"]');
    await page.waitForTimeout(2000);

    // Try to register again with same username
    await page.click('#signin2');
    await page.waitForSelector('#signInModal');
    await page.fill('#sign-username', username);
    await page.fill('#sign-password', password);

    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('This user already exist');
      dialog.accept();
    });

    await page.click('button[onclick="register()"]');
    await page.waitForTimeout(2000);
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');

    // Open login modal
    await page.click('#login2');
    await page.waitForSelector('#logInModal');

    // Fill with invalid credentials
    await page.fill('#loginusername', 'invaliduser99999');
    await page.fill('#loginpassword', 'wrongpassword');

    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('User does not exist');
      dialog.accept();
    });

    await page.click('button[onclick="logIn()"]');
    await page.waitForTimeout(2000);
  });

  test('should close modals correctly', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');

    // Open sign up modal
    await page.click('#signin2');
    await page.waitForSelector('#signInModal');

    // Close modal
    await page.click('#signInModal .close');
    await page.waitForTimeout(500);

    // Verify modal is closed
    await expect(page.locator('#signInModal')).not.toBeVisible();
  });

  test('should handle logout functionality', async ({ page }) => {
    // Register and login first
    const timestamp = Date.now();
    const username = `logouttest${timestamp}`;
    const password = 'testpass123';

    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');

    // Register
    await page.click('#signin2');
    await page.waitForSelector('#signInModal');
    await page.fill('#sign-username', username);
    await page.fill('#sign-password', password);
    page.once('dialog', dialog => dialog.accept());
    await page.click('button[onclick="register()"]');
    await page.waitForTimeout(2000);

    // Login
    await page.click('#login2');
    await page.waitForSelector('#logInModal');
    await page.fill('#loginusername', username);
    await page.fill('#loginpassword', password);
    await page.click('button[onclick="logIn()"]');
    await page.waitForTimeout(2000);

    // Verify logged in
    await expect(page.locator(`#nameofuser`)).toContainText(`Welcome ${username}`);

    // Logout
    await page.click('#logout2');
    await page.waitForTimeout(1000);

    // Verify logged out (Log in link should be visible again)
    await expect(page.locator('text=Log in')).toBeVisible();
  });
});
