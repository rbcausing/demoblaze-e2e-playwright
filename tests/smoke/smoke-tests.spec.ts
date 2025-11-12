import { test, expect } from '../fixtures/testFixtures';

test.describe('Demoblaze Smoke Tests - Critical Functionality', () => {
  test('should load homepage successfully @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
      // Ignore networkidle timeout - site may have ongoing requests
    });

    // Verify page loads with increased timeout for CI
    await expect(page).toHaveTitle(/STORE/, { timeout: 15000 });
    await expect(page.locator('text=Home')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Phones')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Laptops')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Monitors')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to product categories @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Home', { timeout: 10000 });

    // Test Phones category with better waits
    await page.click('text=Phones');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { state: 'visible', timeout: 15000 });
    const phoneProducts = await page.locator('.card-block').count();
    expect(phoneProducts).toBeGreaterThan(0);

    // Test Laptops category with better waits
    await page.click('text=Laptops');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { state: 'visible', timeout: 15000 });
    const laptopProducts = await page.locator('.card-block').count();
    expect(laptopProducts).toBeGreaterThan(0);
  });

  test('should add product to cart @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Home', { timeout: 10000 });

    // Navigate to first product with better waits
    await page.click('text=Phones');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { state: 'visible', timeout: 15000 });
    await page.click('.card-title a >> nth=0');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.btn.btn-success.btn-lg', { state: 'visible', timeout: 15000 });

    // Add to cart with proper dialog handling and increased timeout
    const dialogPromise = page.waitForEvent('dialog', { timeout: 10000 });
    await page.click('text=Add to cart');
    const dialog = await dialogPromise;
    await dialog.accept();
    // Wait for cart update
    await page.waitForTimeout(1000);

    // Verify product was added by checking cart with better waits
    await page.click('#cartur');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('tbody', { state: 'visible', timeout: 15000 });
    const cartItems = await page.locator('tbody tr').count();
    expect(cartItems).toBe(1);
  });

  test('should proceed to checkout @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Home', { timeout: 10000 });

    // Add product to cart with better waits
    await page.click('text=Phones');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { state: 'visible', timeout: 15000 });
    await page.click('.card-title a >> nth=0');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.btn.btn-success.btn-lg', { state: 'visible', timeout: 15000 });

    // Add to cart with proper dialog handling and timeout
    const dialogPromise = page.waitForEvent('dialog', { timeout: 10000 });
    await page.click('text=Add to cart');
    const dialog = await dialogPromise;
    await dialog.accept();
    // Wait for cart update
    await page.waitForTimeout(1000);

    // Go to cart and proceed to checkout with better waits
    await page.click('#cartur');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('tbody', { state: 'visible', timeout: 15000 });
    await page.click('button.btn-success');

    // Verify checkout modal opens with increased timeout
    await expect(page.locator('#orderModal')).toBeVisible({ timeout: 15000 });
  });

  test('should open user authentication modals @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/', { waitUntil: 'domcontentloaded' });

    // Wait for page to be fully loaded with timeout
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Home')).toBeVisible({ timeout: 10000 });

    // Wait for any auto-opening modals to appear and dismiss them if present
    // Using waitFor with a short timeout to avoid hanging if no modal appears
    const autoModal = page.locator('.modal.show, .modal.fade.show');
    try {
      await autoModal.waitFor({ state: 'visible', timeout: 3000 });
      // If modal is visible, close it
      await page.locator('.modal.show .close, .modal.fade.show .close').first().click();
      await autoModal.waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      // No auto-modal appeared, continue
    }

    // Test sign up modal with increased timeout
    await page.click('#signin2');
    await expect(page.locator('#signInModal')).toBeVisible({ timeout: 10000 });

    // Close sign up modal and wait for it to fully disappear
    await page.locator('#signInModal .close').click();
    await expect(page.locator('#signInModal')).toBeHidden({ timeout: 5000 });

    // Ensure modal backdrop is gone with increased timeout
    await expect(page.locator('.modal-backdrop')).toHaveCount(0, { timeout: 5000 });

    // Test login modal with increased timeout
    await page.click('#login2');
    await expect(page.locator('#logInModal')).toBeVisible({ timeout: 10000 });
  });
});
