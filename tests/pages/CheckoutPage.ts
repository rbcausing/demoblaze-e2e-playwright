import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for DemoBlaze Checkout Page
 */
export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Fill checkout form
   * Note: DemoBlaze form fields have IDs but no proper labels or placeholders.
   * Suggestion: Add data-testid attributes (data-testid="checkout-name", etc.) for better testability.
   * Currently using getByRole('textbox') with position-based selection as a last resort.
   */
  async fillForm(
    name: string,
    country: string,
    city: string,
    card: string,
    month: string,
    year: string
  ): Promise<void> {
    // Wait for order modal to be visible
    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: 15000 });

    // Get all textboxes in the dialog - DemoBlaze form fields don't have labels/placeholders
    // We use position-based selection as last resort (fields are in consistent order)
    // TODO: Suggest adding data-testid attributes to DemoBlaze team
    const textboxes = dialog.getByRole('textbox');

    // Fill fields in order: Name, Country, City, Card, Month, Year
    await textboxes.nth(0).fill(name);
    await textboxes.nth(1).fill(country);
    await textboxes.nth(2).fill(city);
    await textboxes.nth(3).fill(card);
    await textboxes.nth(4).fill(month);
    await textboxes.nth(5).fill(year);
  }

  /**
   * Complete purchase
   */
  async completePurchase(): Promise<void> {
    // Purchase button - look for button with "Purchase" text
    const purchaseButton = this.page.getByRole('button', { name: /Purchase/i });
    await purchaseButton.waitFor({ state: 'visible', timeout: 15000 });
    await purchaseButton.click();
    // Wait for confirmation modal to appear
    await this.page
      .getByText('Thank you for your purchase!')
      .waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Verify order confirmation
   */
  async verifyConfirmation(): Promise<void> {
    await expect(this.page.getByText('Thank you for your purchase!')).toBeVisible({
      timeout: 10000,
    });
  }

  /**
   * Fill order form (alias for fillForm with different parameter structure)
   */
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

  /**
   * Click Purchase button (alias for completePurchase)
   */
  async clickPurchase(): Promise<void> {
    await this.completePurchase();
  }

  /**
   * Get confirmation message
   */
  async getConfirmationMessage(): Promise<string> {
    const message = this.page.getByText('Thank you for your purchase!');
    return (await message.textContent()) || '';
  }

  /**
   * Get order details text
   * Note: Using getByText to find the lead paragraph with order details
   * Suggestion: Add data-testid="order-details" for better testability
   */
  async getOrderDetails(): Promise<string> {
    // Order details are in a lead paragraph after the confirmation
    // Find text containing order information patterns
    const detailsText = this.page.getByText(/Id:.*Amount:.*Card:.*Name:/s);
    const text = await detailsText.textContent();
    if (text) {
      return text;
    }
    // Fallback: try to find any text with order details
    const fallbackText = this.page.getByText(/Id:\s*\d+/);
    return (await fallbackText.textContent()) || '';
  }

  /**
   * Extract order ID from order details
   */
  async getOrderId(): Promise<string> {
    const details = await this.getOrderDetails();
    const idMatch = details.match(/Id:\s*(\d+)/);
    return idMatch ? idMatch[1] : '';
  }

  /**
   * Extract order amount from order details
   */
  async getOrderAmount(): Promise<string> {
    const details = await this.getOrderDetails();
    const amountMatch = details.match(/Amount:\s*(\d+)/);
    return amountMatch ? amountMatch[1] : '';
  }

  /**
   * Click OK button to close confirmation modal
   */
  async clickOk(): Promise<void> {
    const okButton = this.page.getByRole('button', { name: /OK|Ok/i });
    await okButton.waitFor({ state: 'visible', timeout: 15000 });
    await okButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
