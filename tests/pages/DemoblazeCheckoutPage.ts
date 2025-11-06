import { Page, expect } from '@playwright/test';

export class DemoblazeCheckoutPage {
  constructor(private page: Page) {}

  async fillForm(
    name: string,
    country: string,
    city: string,
    card: string,
    month: string,
    year: string
  ): Promise<void> {
    await this.page.fill('#name', name);
    await this.page.fill('#country', country);
    await this.page.fill('#city', city);
    await this.page.fill('#card', card);
    await this.page.fill('#month', month);
    await this.page.fill('#year', year);
  }

  async completePurchase(): Promise<void> {
    await this.page.click('button[onclick="purchaseOrder()"]');
  }

  async verifyConfirmation(): Promise<void> {
    await expect(this.page.locator('.sweet-alert h2')).toHaveText('Thank you for your purchase!');
  }

  // Additional methods for compatibility with existing tests
  async fillOrderForm(orderData: {
    name: string;
    country: string;
    city: string;
    creditCard: string;
    month: string;
    year: string;
  }): Promise<void> {
    await this.fillForm(
      orderData.name,
      orderData.country,
      orderData.city,
      orderData.creditCard,
      orderData.month,
      orderData.year
    );
  }

  async clickPurchase(): Promise<void> {
    await this.completePurchase();
  }

  async getConfirmationMessage(): Promise<string> {
    return (await this.page.locator('.sweet-alert h2').textContent()) || '';
  }

  async getOrderDetails(): Promise<string> {
    return (await this.page.locator('.sweet-alert .lead').textContent()) || '';
  }

  async getOrderId(): Promise<string> {
    const details = await this.getOrderDetails();
    const idMatch = details.match(/Id:\s*(\d+)/);
    return idMatch ? idMatch[1] : '';
  }

  async getOrderAmount(): Promise<string> {
    const details = await this.getOrderDetails();
    const amountMatch = details.match(/Amount:\s*(\d+)/);
    return amountMatch ? amountMatch[1] : '';
  }

  async clickOk(): Promise<void> {
    await this.page.click('.confirm.btn.btn-lg.btn-primary');
  }

  async orderModal(): Promise<any> {
    return this.page.locator('#orderModal');
  }
}
