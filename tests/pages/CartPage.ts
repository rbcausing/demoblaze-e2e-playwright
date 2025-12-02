import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for DemoBlaze Shopping Cart Page
 */
export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to cart page
   */
  async navigateToCart(): Promise<void> {
    await this.page.getByRole('link', { name: 'Cart' }).click();
    // Wait for cart table to be visible
    await this.page.getByRole('table').waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Verify item is in cart by name
   */
  async verifyItem(itemName: string): Promise<void> {
    await expect(this.page.getByText(itemName)).toBeVisible({ timeout: 10000 });
  }

  /**
   * Get cart total price
   */
  async getTotal(): Promise<string> {
    const totalText = this.page.getByText(/Total.*\$|\$.*Total/i);
    const text = await totalText.textContent();
    if (text) {
      const priceMatch = text.match(/\$?(\d+)/);
      return priceMatch ? `$${priceMatch[1]}` : '';
    }
    return '';
  }

  /**
   * Delete first item from cart
   */
  async deleteFirstItem(): Promise<void> {
    const deleteLinks = this.page.getByRole('link', { name: /Delete|delete/i });
    await deleteLinks.first().click();
    await this.waitForLoad();
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout(): Promise<void> {
    const checkoutButton = this.page.getByRole('button', { name: /Place Order|Checkout/i });
    await checkoutButton.waitFor({ state: 'visible', timeout: 15000 });
    await checkoutButton.click();
    // Wait for order modal to appear
    await this.page.getByRole('dialog').waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Get number of items in cart
   */
  async getCartItemsCount(): Promise<number> {
    // Wait for cart table to load
    await this.page.getByRole('table').waitFor({ state: 'visible', timeout: 15000 });

    // Count table rows (excluding header)
    const rows = this.page.getByRole('row');
    const count = await rows.count();
    // Subtract 1 for header row
    return Math.max(0, count - 1);
  }

  /**
   * Get cart item details
   */
  async getCartItemDetails(): Promise<Array<{ title: string; price: string }>> {
    await this.page.getByRole('table').waitFor({ state: 'visible', timeout: 15000 });
    const items: Array<{ title: string; price: string }> = [];

    // Get all rows, filter out header row
    const table = this.page.getByRole('table');
    const dataRows = table.getByRole('row').filter({ hasNotText: /Title|Price|Delete/i });
    const count = await dataRows.count();

    for (let i = 0; i < count; i++) {
      const row = dataRows.nth(i);
      const cells = row.getByRole('cell');
      const cellCount = await cells.count();
      if (cellCount >= 3) {
        const titleCell = cells.nth(1);
        const priceCell = cells.nth(2);
        const title = (await titleCell.textContent()) || '';
        const price = (await priceCell.textContent()) || '';
        if (title.trim() && price.trim()) {
          items.push({ title: title.trim(), price: price.trim() });
        }
      }
    }

    return items;
  }

  /**
   * Click Place Order button (alias for proceedToCheckout)
   */
  async clickPlaceOrder(): Promise<void> {
    await this.proceedToCheckout();
  }

  /**
   * Get total price (alias for getTotal)
   */
  async getTotalPrice(): Promise<string> {
    return await this.getTotal();
  }
}
