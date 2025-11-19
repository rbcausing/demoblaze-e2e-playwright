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
    // Wait for order modal to be visible
    await this.page.waitForSelector('#orderModal', { state: 'visible', timeout: 15000 });

    await this.page.locator('#name').fill(name);
    await this.page.locator('#country').fill(country);
    await this.page.locator('#city').fill(city);
    await this.page.locator('#card').fill(card);
    await this.page.locator('#month').fill(month);
    await this.page.locator('#year').fill(year);
  }

  async completePurchase(): Promise<void> {
    await this.page.waitForSelector('button[onclick="purchaseOrder()"]', {
      state: 'visible',
      timeout: 15000,
    });
    await this.page.locator('button[onclick="purchaseOrder()"]').click();
    // Wait for confirmation modal to appear
    await this.page.waitForSelector('.sweet-alert', { state: 'visible', timeout: 15000 });
  }

  async verifyConfirmation(): Promise<void> {
    await this.page.waitForSelector('.sweet-alert h2', { state: 'visible', timeout: 15000 });
    await expect(this.page.locator('.sweet-alert h2')).toHaveText('Thank you for your purchase!', {
      timeout: 10000,
    });
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
    await this.page.waitForSelector('.confirm.btn.btn-lg.btn-primary', {
      state: 'visible',
      timeout: 15000,
    });
    await this.page.locator('.confirm.btn.btn-lg.btn-primary').click();
    await this.page.waitForTimeout(1000);
  }

  async orderModal(): Promise<any> {
    return this.page.locator('#orderModal');
  }
}
