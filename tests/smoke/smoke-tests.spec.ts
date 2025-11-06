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
    await page.waitForSelector('.card-block');
    const phoneProducts = await page.locator('.card-block').count();
    expect(phoneProducts).toBeGreaterThan(0);

    // Test Laptops category
    await page.click('text=Laptops');
    await page.waitForSelector('.card-block');
    const laptopProducts = await page.locator('.card-block').count();
    expect(laptopProducts).toBeGreaterThan(0);
  });

  test('should add product to cart @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');

    // Navigate to first product
    await page.click('text=Phones');
    await page.waitForSelector('.card-block');
    await page.click('.card-title a >> nth=0');
    await page.waitForSelector('.btn.btn-success.btn-lg');

    // Add to cart
    page.once('dialog', dialog => dialog.accept());
    await page.click('text=Add to cart');
    await page.waitForTimeout(1000);

    // Verify product was added by checking cart
    await page.click('#cartur');
    await page.waitForSelector('tbody');
    const cartItems = await page.locator('tbody tr').count();
    expect(cartItems).toBe(1);
  });

  test('should proceed to checkout @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');

    // Add product to cart
    await page.click('text=Phones');
    await page.waitForSelector('.card-block');
    await page.click('.card-title a >> nth=0');
    await page.waitForSelector('.btn.btn-success.btn-lg');
    page.once('dialog', dialog => dialog.accept());
    await page.click('text=Add to cart');
    await page.waitForTimeout(1000);

    // Go to cart and proceed to checkout
    await page.click('#cartur');
    await page.waitForSelector('tbody');
    await page.click('button.btn-success');

    // Verify checkout modal opens
    await expect(page.locator('#orderModal')).toBeVisible();
  });

  test('should open user authentication modals @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');

    // Test sign up modal - use ID selector for navigation link
    await page.click('#signin2');
    await expect(page.locator('#signInModal')).toBeVisible();
    await page.click('#signInModal .close');
    await page.waitForTimeout(500);

    // Test login modal - use ID selector for navigation link
    await page.click('#login2');
    await expect(page.locator('#logInModal')).toBeVisible();
  });
});
