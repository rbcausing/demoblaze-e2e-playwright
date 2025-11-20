import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import testUsers from '../data/testUsers.json';
import testProducts from '../data/testProducts.json';
import shippingAddresses from '../data/shippingAddresses.json';
import paymentInfo from '../data/paymentInfo.json';

// Extend basic test by providing page objects and test data
export const test = base.extend<{
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  testUsers: typeof testUsers;
  testProducts: typeof testProducts;
  shippingAddresses: typeof shippingAddresses;
  paymentInfo: typeof paymentInfo;
}>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  productPage: async ({ page }, use) => {
    const productPage = new ProductPage(page);
    await use(productPage);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cartPage: async ({ page }: any, use: any) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },

  // eslint-disable-next-line no-empty-pattern
  testUsers: async ({}, use) => {
    await use(testUsers);
  },

  // eslint-disable-next-line no-empty-pattern
  testProducts: async ({}, use) => {
    await use(testProducts);
  },

  // eslint-disable-next-line no-empty-pattern
  shippingAddresses: async ({}, use) => {
    await use(shippingAddresses);
  },

  // eslint-disable-next-line no-empty-pattern
  paymentInfo: async ({}, use) => {
    await use(paymentInfo);
  },
});

export { expect } from '@playwright/test';
