import { test, expect } from '../fixtures/testFixtures';

test.describe('Demoblaze Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Add items to cart before checkout tests with better waits
    await page.goto('https://www.demoblaze.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Home', { timeout: 10000 });

    // Add product to cart with proper error handling
    await page.click('text=Phones');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { timeout: 15000 });
    await page.click('.card-title a >> nth=0');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.btn.btn-success.btn-lg', { timeout: 15000 });

    // Handle dialog properly
    const dialogPromise = page.waitForEvent('dialog', { timeout: 10000 });
    await page.click('text=Add to cart');
    const dialog = await dialogPromise;
    await dialog.accept();
    await page.waitForTimeout(1000);

    // Go to cart and proceed to checkout with better waits
    await page.click('#cartur');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('tbody', { timeout: 15000 });
    await page.click('button.btn-success');
    await page.waitForSelector('#orderModal', { timeout: 15000 });
  });

  test('should complete full checkout process @smoke', async ({ page }) => {
    // Fill order form
    await page.fill('#name', 'Test User');
    await page.fill('#country', 'USA');
    await page.fill('#city', 'New York');
    await page.fill('#card', '4111111111111111');
    await page.fill('#month', '12');
    await page.fill('#year', '2026');

    // Place order
    await page.click('button[onclick="purchaseOrder()"]');

    // Verify order confirmation
    await expect(page.locator('.sweet-alert h2')).toHaveText('Thank you for your purchase!');

    // Verify order details are displayed
    await expect(page.locator('.sweet-alert .lead')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to place order without filling required fields
    await page.click('button[onclick="purchaseOrder()"]');

    // In Demoblaze, the modal stays open if fields are empty
    // Verify modal is still visible
    await expect(page.locator('#orderModal')).toBeVisible();
  });

  test('should handle form submission with valid data', async ({ page }) => {
    // Fill all required fields
    await page.fill('#name', 'John Doe');
    await page.fill('#country', 'United States');
    await page.fill('#city', 'New York');
    await page.fill('#card', '1234567812345678');
    await page.fill('#month', '12');
    await page.fill('#year', '2025');

    // Place order
    await page.click('button[onclick="purchaseOrder()"]');

    // Verify success
    await expect(page.locator('.sweet-alert h2')).toHaveText('Thank you for your purchase!');
  });

  test('should display order details correctly', async ({ page }) => {
    // Complete order
    await page.fill('#name', 'Test User');
    await page.fill('#country', 'USA');
    await page.fill('#city', 'New York');
    await page.fill('#card', '4111111111111111');
    await page.fill('#month', '12');
    await page.fill('#year', '2026');

    await page.click('button[onclick="purchaseOrder()"]');

    // Verify order details contain expected information
    const orderDetails = await page.locator('.sweet-alert .lead').textContent();
    expect(orderDetails).toContain('Id:');
    expect(orderDetails).toContain('Amount:');
    expect(orderDetails).toContain('Card:');
    expect(orderDetails).toContain('Name:');
  });

  test('should close order modal after completion', async ({ page }) => {
    // Complete order
    await page.fill('#name', 'Test User');
    await page.fill('#country', 'USA');
    await page.fill('#city', 'New York');
    await page.fill('#card', '4111111111111111');
    await page.fill('#month', '12');
    await page.fill('#year', '2026');

    await page.click('button[onclick="purchaseOrder()"]');

    // Click OK to close modal
    await page.click('.confirm.btn.btn-lg.btn-primary');

    // Verify we're back on cart page
    await expect(page.locator('tbody')).toBeVisible();
  });
});
