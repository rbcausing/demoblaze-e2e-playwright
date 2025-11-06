import { Page } from '@playwright/test';

export class DemoblazeProductPage {
  constructor(private page: Page) {}

  async getProductInfo(): Promise<{ title: string; price: string }> {
    const title = (await this.page.locator('h2.name').textContent()) || '';
    const price = (await this.page.locator('h3.price-container').textContent()) || '';
    return { title, price };
  }

  async addToCart(): Promise<void> {
    await this.page.click('a.btn-success');
    await this.page.on('dialog', dialog => dialog.accept());
  }
}
