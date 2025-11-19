import { Page } from '@playwright/test';

export class DemoblazeProductPage {
  constructor(private page: Page) {}

  async getProductInfo(): Promise<{ title: string; price: string }> {
    await this.page.waitForSelector('h2.name', { state: 'visible', timeout: 15000 });
    const title = (await this.page.locator('h2.name').textContent()) || '';
    const price = (await this.page.locator('h3.price-container').textContent()) || '';
    return { title: title.trim(), price: price.trim() };
  }

  async addToCart(): Promise<void> {
    await this.page.waitForSelector('a.btn-success', { state: 'visible', timeout: 15000 });

    // Set up dialog handler before clicking
    const dialogPromise = this.page.waitForEvent('dialog', { timeout: 10000 });
    await this.page.locator('a.btn-success').click();
    const dialog = await dialogPromise;
    await dialog.accept();
    await this.page.waitForTimeout(1000);
  }
}
