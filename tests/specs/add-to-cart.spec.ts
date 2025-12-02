import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';

test.describe('Add to Cart', () => {
  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
  });

  test('should add a single product to cart', async ({ page }) => {
    const homePage = new HomePage(page);
    const cartPage = new CartPage(page);

    // Navigate to Phones category
    await homePage.selectPhonesCategory();

    // Click on the first product
    await homePage.clickFirstProduct();

    // Verify we're on product page
    const productPage = new ProductPage(page);
    const productInfo = await productPage.getProductInfo();
    expect(productInfo.title).toBeTruthy();
    expect(productInfo.price).toBeTruthy();

    // Add to cart
    await productPage.addToCart();

    // Verify cart - navigate and check
    await cartPage.navigateToCart();
    const cartItems = await cartPage.getCartItemsCount();
    expect(cartItems).toBe(1);
  });

  test('should add multiple quantities of the same product', async ({ page }) => {
    const homePage = new HomePage(page);
    const cartPage = new CartPage(page);
    const productPage = new ProductPage(page);

    // Navigate to product
    await homePage.selectPhonesCategory();
    await homePage.clickFirstProduct();

    // Add to cart multiple times
    for (let i = 0; i < 3; i++) {
      await productPage.addToCart();
      // Navigate back to product if needed (after first add)
      if (i < 2) {
        await page.goBack();
        await homePage.waitForLoad();
      }
    }

    // Verify cart has multiple quantities
    await cartPage.navigateToCart();
    const cartItems = await cartPage.getCartItemsCount();
    expect(cartItems).toBe(3); // DemoBlaze adds each as separate item
  });

  test('should add different products to cart', async ({ page }) => {
    const homePage = new HomePage(page);
    const cartPage = new CartPage(page);
    const productPage = new ProductPage(page);

    // Add first product (Phone)
    await homePage.selectPhonesCategory();
    await homePage.clickFirstProduct();
    await productPage.addToCart();

    // Navigate back and add second product (Laptop)
    await homePage.navigate();
    await homePage.selectLaptopsCategory();
    await homePage.clickFirstProduct();
    await productPage.addToCart();

    // Verify both products in cart
    await cartPage.navigateToCart();
    const cartItems = await cartPage.getCartItemsCount();
    expect(cartItems).toBe(2);
  });

  test('should show success message when adding to cart', async ({ page }) => {
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);

    // Navigate to product
    await homePage.selectPhonesCategory();
    await homePage.clickFirstProduct();

    // Set up dialog handler to capture the message
    let dialogMessage = '';
    page.once('dialog', dialog => {
      dialogMessage = dialog.message();
      dialog.accept();
    });

    // Add to cart
    await productPage.addToCart();

    // Verify success message in dialog
    expect(dialogMessage).toContain('Product added');
  });

  test('should verify product details in cart', async ({ page }) => {
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    // Navigate to product and get details
    await homePage.selectPhonesCategory();
    await homePage.clickFirstProduct();
    const productInfo = await productPage.getProductInfo();

    // Add to cart
    await productPage.addToCart();

    // Verify product in cart
    await cartPage.navigateToCart();
    await cartPage.verifyItem(productInfo.title);
  });
});
