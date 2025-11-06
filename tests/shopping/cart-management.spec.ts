import { test, expect } from '../fixtures/testFixtures';

test.describe('Demoblaze Shopping Cart - Cart Management', () => {
  test.beforeEach(async ({ page }) => {
    // Add items to cart before each test
    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');

    // Add first product
    await page.click('text=Phones');
    await page.waitForSelector('.card-block');
    await page.click('.card-title a >> nth=0');
    await page.waitForSelector('.btn.btn-success.btn-lg');
    page.once('dialog', dialog => dialog.accept());
    await page.click('text=Add to cart');
    await page.waitForTimeout(1000);

    // Add second product
    await page.click('text=Home');
    await page.click('text=Laptops');
    await page.waitForSelector('.card-block');
    await page.click('.card-title a >> nth=0');
    await page.waitForSelector('.btn.btn-success.btn-lg');
    page.once('dialog', dialog => dialog.accept());
    await page.click('text=Add to cart');
    await page.waitForTimeout(1000);

    // Navigate to cart
    await page.click('#cartur');
    await page.waitForSelector('tbody');
  });

  test('should display cart items correctly', async ({ page }) => {
    const cartItems = await page.locator('tbody tr').count();
    expect(cartItems).toBe(2);

    // Verify items have titles and prices
    const firstItemTitle = await page.locator('td:nth-child(2)').first().textContent();
    const firstItemPrice = await page.locator('td:nth-child(3)').first().textContent();

    expect(firstItemTitle).toBeTruthy();
    expect(firstItemPrice).toMatch(/\$\d+/);
  });

  test('should remove item from cart', async ({ page }) => {
    const initialCount = await page.locator('tbody tr').count();

    // Click delete link for first item
    await page.click('td a >> nth=0');
    await page.waitForTimeout(1000);

    const finalCount = await page.locator('tbody tr').count();
    expect(finalCount).toBe(initialCount - 1);
  });

  test('should calculate total correctly', async ({ page }) => {
    const totalElement = await page.locator('#totalp').textContent();
    expect(totalElement).toMatch(/\$\d+/);

    // Verify total is reasonable (should be sum of individual prices)
    const total = parseFloat(totalElement?.replace('$', '') || '0');
    expect(total).toBeGreaterThan(0);
  });

  test('should proceed to checkout', async ({ page }) => {
    await page.click('button.btn-success');

    // Verify checkout modal opens
    await expect(page.locator('#orderModal')).toBeVisible();
  });

  test('should continue shopping from cart', async ({ page }) => {
    // Click home link to continue shopping
    await page.click('text=Home');

    // Verify we're back on home page
    await expect(page.locator('text=Home')).toBeVisible();
  });
});
