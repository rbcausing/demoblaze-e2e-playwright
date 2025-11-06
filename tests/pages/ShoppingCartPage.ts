import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CartItem {
  name: string;
  price: string;
  quantity: number;
  size?: string;
  color?: string;
}

export class ShoppingCartPage extends BasePage {
  readonly cartItems: Locator;
  readonly cartEmptyMessage: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly updateCartButton: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly shipping: Locator;
  readonly total: Locator;
  readonly promoCodeInput: Locator;
  readonly applyPromoButton: Locator;
  readonly promoCodeMessage: Locator;

  // Demoblaze-specific selectors
  readonly cartTable: Locator;
  readonly cartRows: Locator;
  readonly totalPrice: Locator;
  readonly placeOrderButton: Locator;
  readonly deleteLinks: Locator;

  constructor(page: Page) {
    super(page);

    // Demoblaze-specific selectors
    this.cartTable = page.locator('tbody');
    this.cartRows = page.locator('tbody tr');
    this.totalPrice = page.locator('#totalp');
    this.placeOrderButton = page.locator('button.btn-success');
    this.deleteLinks = page.locator('td a');

    // Keep generic selectors for backward compatibility
    this.cartItems = page.locator('[data-testid="cart-item"]');
    this.cartEmptyMessage = page.locator('[data-testid="cart-empty-message"]');
    this.checkoutButton = page.locator('[data-testid="checkout-button"]');
    this.continueShoppingButton = page.locator('[data-testid="continue-shopping-button"]');
    this.updateCartButton = page.locator('[data-testid="update-cart-button"]');
    this.subtotal = page.locator('[data-testid="subtotal"]');
    this.tax = page.locator('[data-testid="tax"]');
    this.shipping = page.locator('[data-testid="shipping"]');
    this.total = page.locator('[data-testid="total"]');
    this.promoCodeInput = page.locator('[data-testid="promo-code-input"]');
    this.applyPromoButton = page.locator('[data-testid="apply-promo-button"]');
    this.promoCodeMessage = page.locator('[data-testid="promo-code-message"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Demoblaze cart page
   */
  async navigateToDemoblazeCart(): Promise<void> {
    await this.page.click('#cartur');
    await this.page.waitForSelector('tbody');
  }

  async getCartItemsCount(): Promise<number> {
    // Wait for cart to load
    await this.page.waitForSelector('.success', { timeout: 10000 });

    // Count the number of items in the cart
    const items = await this.cartRows.count();
    return items;
  }

  async getCartItems(): Promise<CartItem[]> {
    const items: CartItem[] = [];
    const count = await this.getCartItemsCount();

    for (let i = 0; i < count; i++) {
      const title = (await this.page.locator('td:nth-child(2)').nth(i).textContent()) || '';
      const price = (await this.page.locator('td:nth-child(3)').nth(i).textContent()) || '';

      items.push({
        name: title,
        price: price,
        quantity: 1, // Demoblaze doesn't show quantity in cart
        size: undefined,
        color: undefined,
      });
    }

    return items;
  }

  async updateItemQuantity(_itemIndex: number, _newQuantity: number): Promise<void> {
    // Demoblaze doesn't support quantity updates in cart
    console.log('Quantity updates not supported on Demoblaze');
  }

  async removeItem(itemIndex: number): Promise<void> {
    await this.deleteLinks.nth(itemIndex).click();
    await this.page.waitForTimeout(1000); // Wait for update
  }

  async proceedToCheckout(): Promise<void> {
    await this.placeOrderButton.click();
  }

  async continueShopping(): Promise<void> {
    // Demoblaze doesn't have continue shopping button
    await this.page.goBack();
  }

  async applyPromoCode(_code: string): Promise<void> {
    // Demoblaze doesn't have promo codes
    console.log('Promo codes not available on Demoblaze');
  }

  async getSubtotal(): Promise<string> {
    return await this.getTotal();
  }

  async getTotal(): Promise<string> {
    return (await this.totalPrice.textContent()) || '';
  }

  async getPromoCodeMessage(): Promise<string> {
    return '';
  }

  async isCartEmpty(): Promise<boolean> {
    const count = await this.getCartItemsCount();
    return count === 0;
  }

  async clearCart(): Promise<void> {
    const itemCount = await this.getCartItemsCount();
    for (let i = itemCount - 1; i >= 0; i--) {
      await this.removeItem(i);
    }
  }
}
