import { test, expect } from '../fixtures/testFixtures';

test.describe('Demoblaze Smoke Tests - Critical Functionality', () => {
  test('should load homepage successfully @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/');

    // Verify page loads
    await expect(page).toHaveTitle(/STORE/);
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Phones')).toBeVisible();
    await expect(page.locator('text=Laptops')).toBeVisible();
    await expect(page.locator('text=Monitors')).toBeVisible();
  });

  test('should navigate to product categories @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');

    // Test Phones category
    await page.click('text=Phones');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { state: 'visible' });
    const phoneProducts = await page.locator('.card-block').count();
    expect(phoneProducts).toBeGreaterThan(0);

    // Test Laptops category
    await page.click('text=Laptops');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { state: 'visible' });
    const laptopProducts = await page.locator('.card-block').count();
    expect(laptopProducts).toBeGreaterThan(0);
  });

  test('should add product to cart @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');

    // Navigate to first product
    await page.click('text=Phones');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { state: 'visible' });
    await page.click('.card-title a >> nth=0');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.btn.btn-success.btn-lg', { state: 'visible' });

    // Add to cart with proper dialog handling
    await Promise.all([
      page.waitForEvent('dialog').then(dialog => dialog.accept()),
      page.click('text=Add to cart'),
    ]);
    // Wait a bit for cart update (dialog closes immediately)
    await page.waitForTimeout(500);

    // Verify product was added by checking cart
    await page.click('#cartur');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('tbody', { state: 'visible' });
    const cartItems = await page.locator('tbody tr').count();
    expect(cartItems).toBe(1);
  });

  test('should proceed to checkout @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');

    // Add product to cart
    await page.click('text=Phones');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { state: 'visible' });
    await page.click('.card-title a >> nth=0');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.btn.btn-success.btn-lg', { state: 'visible' });

    // Add to cart with proper dialog handling
    await Promise.all([
      page.waitForEvent('dialog').then(dialog => dialog.accept()),
      page.click('text=Add to cart'),
    ]);
    // Wait a bit for cart update (dialog closes immediately)
    await page.waitForTimeout(500);

    // Go to cart and proceed to checkout
    await page.click('#cartur');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('tbody', { state: 'visible' });
    await page.click('button.btn-success');

    // Verify checkout modal opens
    await expect(page.locator('#orderModal')).toBeVisible({ timeout: 10000 });
  });

  test('should open user authentication modals @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');

    // Test sign up modal - use ID selector for navigation link
    await page.click('#signin2');
    await expect(page.locator('#signInModal')).toBeVisible({ timeout: 5000 });
    await page.click('#signInModal .close');
    await page.waitForTimeout(300); // Wait for modal close animation
    await expect(page.locator('#signInModal')).toBeHidden();

    // Test login modal - use ID selector for navigation link
    await page.click('#login2');
    await expect(page.locator('#logInModal')).toBeVisible({ timeout: 10000 });
  });
});
