import { test, expect } from '../fixtures/testFixtures';

test.describe('Demoblaze Shopping Cart - Add to Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Demoblaze homepage with better network handling
    await page.goto('https://www.demoblaze.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Home', { timeout: 10000 });
  });

  test('should add a single product to cart @smoke', async ({ page, testProducts }) => {
    const product = testProducts.phones[0]; // Samsung galaxy s6

    // Navigate to Phones category with better waits
    await page.click('text=Phones');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { state: 'visible', timeout: 15000 });

    // Click on the first product (Samsung galaxy s6)
    await page.click('.card-title a >> nth=0');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.btn.btn-success.btn-lg', { timeout: 15000 });

    // Verify product details with timeout
    await expect(page.locator('h2.name')).toContainText(product.name, { timeout: 10000 });
    await expect(page.locator('h3.price-container')).toContainText(product.price.toString(), {
      timeout: 10000,
    });

    // Add to cart with proper dialog handling
    const dialogPromise = page.waitForEvent('dialog', { timeout: 10000 });
    await page.click('text=Add to cart');
    const dialog = await dialogPromise;
    await dialog.accept();
    await page.waitForTimeout(1000);

    // Verify cart - navigate and check
    await page.click('#cartur');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('tbody', { timeout: 15000 });

    const cartItems = await page.locator('tbody tr').count();
    expect(cartItems).toBe(1);
  });

  test('should add multiple quantities of the same product', async ({ page }) => {
    // Navigate to product with better waits
    await page.click('text=Phones');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { timeout: 15000 });
    await page.click('.card-title a >> nth=0');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.btn.btn-success.btn-lg', { timeout: 15000 });

    // Add to cart multiple times with proper dialog handling
    for (let i = 0; i < 3; i++) {
      const dialogPromise = page.waitForEvent('dialog', { timeout: 10000 });
      await page.click('text=Add to cart');
      const dialog = await dialogPromise;
      await dialog.accept();
      await page.waitForTimeout(1000);
    }

    // Verify cart has multiple quantities with better waits
    await page.click('#cartur');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('tbody', { timeout: 15000 });

    const cartItems = await page.locator('tbody tr').count();
    expect(cartItems).toBe(3); // Demoblaze adds each as separate item
  });

  test('should add different products to cart', async ({ page }) => {
    // Add first product (Samsung galaxy s6) with better waits
    await page.click('text=Phones');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { timeout: 15000 });
    await page.click('.card-title a >> nth=0');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.btn.btn-success.btn-lg', { timeout: 15000 });

    const dialogPromise1 = page.waitForEvent('dialog', { timeout: 10000 });
    await page.click('text=Add to cart');
    const dialog1 = await dialogPromise1;
    await dialog1.accept();
    await page.waitForTimeout(1000);

    // Navigate back to home and add second product with better waits
    await page.click('text=Home');
    await page.waitForLoadState('domcontentloaded');
    await page.click('text=Laptops');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { timeout: 15000 });
    await page.click('.card-title a >> nth=0');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.btn.btn-success.btn-lg', { timeout: 15000 });

    const dialogPromise2 = page.waitForEvent('dialog', { timeout: 10000 });
    await page.click('text=Add to cart');
    const dialog2 = await dialogPromise2;
    await dialog2.accept();
    await page.waitForTimeout(1000);

    // Verify both products in cart with better waits
    await page.click('#cartur');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('tbody', { timeout: 15000 });

    const cartItems = await page.locator('tbody tr').count();
    expect(cartItems).toBe(2);
  });

  test('should show success message when adding to cart', async ({ page }) => {
    // Navigate to product with better waits
    await page.click('text=Phones');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { timeout: 15000 });
    await page.click('.card-title a >> nth=0');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.btn.btn-success.btn-lg', { timeout: 15000 });

    // Set up dialog handler to capture the message with timeout
    const dialogPromise = page.waitForEvent('dialog', { timeout: 10000 });
    await page.click('text=Add to cart');
    const dialog = await dialogPromise;
    const dialogMessage = dialog.message();
    await dialog.accept();
    await page.waitForTimeout(1000);

    // Verify success message in dialog
    expect(dialogMessage).toContain('Product added');
  });
});
