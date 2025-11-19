import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    // Add product to cart before checkout tests
    await homePage.selectPhonesCategory();
    await homePage.clickFirstProduct();

    const productPage = new ProductPage(page);
    await productPage.addToCart();

    // Go to cart and proceed to checkout
    const cartPage = new CartPage(page);
    await cartPage.navigateToCart();
    await cartPage.proceedToCheckout();
  });

  test('should complete full checkout process @smoke', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Fill order form
    await checkoutPage.fillForm('Test User', 'USA', 'New York', '4111111111111111', '12', '2026');

    // Place order
    await checkoutPage.completePurchase();

    // Verify order confirmation
    await checkoutPage.verifyConfirmation();

    // Verify order details are displayed
    const orderDetails = await checkoutPage.getOrderDetails();
    expect(orderDetails).toBeTruthy();
  });

  test('should validate required fields', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Try to place order without filling required fields
    await checkoutPage.completePurchase();

    // In DemoBlaze, the modal stays open if fields are empty
    // Verify modal is still visible
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should handle form submission with valid data', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Fill all required fields
    await checkoutPage.fillForm(
      'John Doe',
      'United States',
      'New York',
      '1234567812345678',
      '12',
      '2025'
    );

    // Place order
    await checkoutPage.completePurchase();

    // Verify success
    await checkoutPage.verifyConfirmation();
  });

  test('should display order details correctly', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Complete order
    await checkoutPage.fillForm('Test User', 'USA', 'New York', '4111111111111111', '12', '2026');

    await checkoutPage.completePurchase();

    // Verify order details contain expected information
    const orderDetails = await checkoutPage.getOrderDetails();
    expect(orderDetails).toContain('Id:');
    expect(orderDetails).toContain('Amount:');
    expect(orderDetails).toContain('Card:');
    expect(orderDetails).toContain('Name:');
  });

  test('should close order modal after completion', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Complete order
    await checkoutPage.fillForm('Test User', 'USA', 'New York', '4111111111111111', '12', '2026');

    await checkoutPage.completePurchase();

    // Click OK to close modal
    await checkoutPage.clickOk();

    // Verify we're back on cart page
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should extract order ID and amount', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // Complete order
    await checkoutPage.fillForm('Test User', 'USA', 'New York', '4111111111111111', '12', '2026');

    await checkoutPage.completePurchase();

    // Extract and verify order details
    const orderId = await checkoutPage.getOrderId();
    const orderAmount = await checkoutPage.getOrderAmount();

    expect(orderId).toBeTruthy();
    expect(orderAmount).toBeTruthy();
  });
});
