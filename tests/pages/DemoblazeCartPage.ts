import { Page, expect } from '@playwright/test';

export class DemoblazeCartPage {
  constructor(private page: Page) {}

  async navigateToCart(): Promise<void> {
    await this.page.locator('#cartur').click();
    await this.page.waitForSelector('tbody', { state: 'visible', timeout: 15000 });
  }

  async verifyItem(itemName: string): Promise<void> {
    // Instead of exact match, check if any cart item contains the name
    await expect(this.page.locator(`text=${itemName}`)).toBeVisible({ timeout: 10000 });
  }

  async getTotal(): Promise<string> {
    return (await this.page.locator('#totalp').textContent()) || '';
  }

  async deleteItem(): Promise<void> {
    await this.page.waitForSelector('tbody tr td a', { state: 'visible', timeout: 15000 });
    await this.page.locator('tbody tr td a').first().click();
    await this.page.waitForTimeout(1500); // Wait for cart to update
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.waitForSelector('button.btn-success', { state: 'visible', timeout: 15000 });
    await this.page.locator('button.btn-success').click();
    // Wait for order modal to appear
    await this.page.waitForSelector('#orderModal', { state: 'visible', timeout: 15000 });
  }

  // Additional methods for compatibility with existing tests
  async goto(): Promise<void> {
    await this.navigateToCart();
  }

  async getCartItemsCount(): Promise<number> {
    // Wait for cart table to load
    await this.page.waitForSelector('tbody', { state: 'visible', timeout: 15000 });

    // Count the number of items in the cart (excluding header row if present)
    const rows = await this.page.locator('tbody tr').all();
    // Filter out empty rows or header rows
    let count = 0;
    for (const row of rows) {
      const cells = await row.locator('td').count();
      if (cells > 0) {
        const firstCellText = await row.locator('td').first().textContent();
        // Skip if it's a header row
        if (firstCellText && !firstCellText.trim().toLowerCase().includes('pic')) {
          count++;
        }
      }
    }
    return count;
  }

  async getCartItemDetails(): Promise<Array<{ title: string; price: string }>> {
    await this.page.waitForSelector('tbody', { state: 'visible', timeout: 15000 });
    const items = [];
    const rows = await this.page.locator('tbody tr').all();

    for (const row of rows) {
      const cells = await row.locator('td').count();
      if (cells >= 3) {
        // Title is in 2nd column (index 1), Price is in 3rd column (index 2)
        const title = (await row.locator('td').nth(1).textContent()) || '';
        const price = (await row.locator('td').nth(2).textContent()) || '';
        // Skip header rows
        if (title.trim() && !title.trim().toLowerCase().includes('title')) {
          items.push({ title: title.trim(), price: price.trim() });
        }
      }
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
