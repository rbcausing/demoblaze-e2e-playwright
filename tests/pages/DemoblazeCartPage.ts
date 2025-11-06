import { Page, expect } from '@playwright/test';

export class DemoblazeCartPage {
  constructor(private page: Page) {}

  async navigateToCart(): Promise<void> {
    await this.page.click('#cartur');
    await this.page.waitForSelector('tbody');
  }

  async verifyItem(itemName: string): Promise<void> {
    // Instead of exact match, check if any cart item contains the name
    await expect(this.page.locator(`text=${itemName}`)).toBeVisible({ timeout: 10000 });
  }

  async getTotal(): Promise<string> {
    return (await this.page.locator('#totalp').textContent()) || '';
  }

  async deleteItem(): Promise<void> {
    await this.page.click('td a >> nth=0');
    await this.page.waitForTimeout(1000); // Wait for update
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.click('button.btn-success');
  }

  // Additional methods for compatibility with existing tests
  async goto(): Promise<void> {
    await this.navigateToCart();
  }

  async getCartItemsCount(): Promise<number> {
    // Wait for cart to load
    await this.page.waitForSelector('.success', { timeout: 10000 });

    // Count the number of items in the cart
    const items = await this.page.locator('tbody tr').count();
    return items;
  }

  async getCartItemDetails(): Promise<Array<{ title: string; price: string }>> {
    const items = [];
    const count = await this.getCartItemsCount();

    for (let i = 0; i < count; i++) {
      const title = (await this.page.locator('td:nth-child(2)').nth(i).textContent()) || '';
      const price = (await this.page.locator('td:nth-child(3)').nth(i).textContent()) || '';
      items.push({ title, price });
    }

    return items;
  }

  async clickPlaceOrder(): Promise<void> {
    await this.proceedToCheckout();
  }

  async getTotalPrice(): Promise<string> {
    return await this.getTotal();
  }
}
