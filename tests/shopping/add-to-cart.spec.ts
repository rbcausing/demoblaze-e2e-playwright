import { test, expect } from '../fixtures/testFixtures';

test.describe('Demoblaze Shopping Cart - Add to Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Demoblaze homepage
    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');
  });

  test('should add a single product to cart @smoke', async ({ page, testProducts }) => {
    const product = testProducts.phones[0]; // Samsung galaxy s6

    // Navigate to Phones category
    await page.click('text=Phones');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { state: 'visible' });

    // Click on the first product (Samsung galaxy s6)
    await page.click('.card-title a >> nth=0');
    await page.waitForSelector('.btn.btn-success.btn-lg');

    // Verify product details
    await expect(page.locator('h2.name')).toContainText(product.name);
    await expect(page.locator('h3.price-container')).toContainText(product.price.toString());

    // Add to cart with dialog handling
    page.once('dialog', dialog => dialog.accept());
    await page.click('text=Add to cart');
    await page.waitForTimeout(1000);

    // Verify cart icon shows item count (Demoblaze doesn't show count in cart icon)
    // Instead, navigate to cart to verify
    await page.click('#cartur');
    await page.waitForSelector('tbody');

    const cartItems = await page.locator('tbody tr').count();
    expect(cartItems).toBe(1);
  });

  test('should add multiple quantities of the same product', async ({ page }) => {
    // Navigate to product
    await page.click('text=Phones');
    await page.waitForSelector('.card-block');
    await page.click('.card-title a >> nth=0');
    await page.waitForSelector('.btn.btn-success.btn-lg');

    // Add to cart multiple times
    for (let i = 0; i < 3; i++) {
      page.once('dialog', dialog => dialog.accept());
      await page.click('text=Add to cart');
      await page.waitForTimeout(1000);
    }

    // Verify cart has multiple quantities
    await page.click('#cartur');
    await page.waitForSelector('tbody');

    const cartItems = await page.locator('tbody tr').count();
    expect(cartItems).toBe(3); // Demoblaze adds each as separate item
  });

  test('should add different products to cart', async ({ page }) => {
    // Add first product (Samsung galaxy s6)
    await page.click('text=Phones');
    await page.waitForSelector('.card-block');
    await page.click('.card-title a >> nth=0');
    await page.waitForSelector('.btn.btn-success.btn-lg');

    page.once('dialog', dialog => dialog.accept());
    await page.click('text=Add to cart');
    await page.waitForTimeout(1000);

    // Navigate back to home and add second product
    await page.click('text=Home');
    await page.click('text=Laptops');
    await page.waitForSelector('.card-block');
    await page.click('.card-title a >> nth=0');
    await page.waitForSelector('.btn.btn-success.btn-lg');

    page.once('dialog', dialog => dialog.accept());
    await page.click('text=Add to cart');
    await page.waitForTimeout(1000);

    // Verify both products in cart
    await page.click('#cartur');
    await page.waitForSelector('tbody');

    const cartItems = await page.locator('tbody tr').count();
    expect(cartItems).toBe(2);
  });

  test('should show success message when adding to cart', async ({ page }) => {
    await page.click('text=Phones');
    await page.waitForSelector('.card-block');
    await page.click('.card-title a >> nth=0');
    await page.waitForSelector('.btn.btn-success.btn-lg');

    // Set up dialog handler to capture the message
    let dialogMessage = '';
    page.once('dialog', dialog => {
      dialogMessage = dialog.message();
      dialog.accept();
    });

    await page.click('text=Add to cart');
    await page.waitForTimeout(1000);

    // Verify success message in dialog
    expect(dialogMessage).toContain('Product added');
  });
});
