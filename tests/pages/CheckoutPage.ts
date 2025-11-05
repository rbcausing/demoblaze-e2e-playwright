import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface PaymentInfo {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

export class CheckoutPage extends BasePage {
  readonly shippingSection: Locator;
  readonly billingSection: Locator;
  readonly paymentSection: Locator;
  readonly orderSummary: Locator;
  readonly placeOrderButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateSelect: Locator;
  readonly zipCodeInput: Locator;
  readonly countrySelect: Locator;
  readonly phoneInput: Locator;
  readonly cardNumberInput: Locator;
  readonly expiryMonthSelect: Locator;
  readonly expiryYearSelect: Locator;
  readonly cvvInput: Locator;
  readonly cardholderNameInput: Locator;
  readonly sameAsBillingCheckbox: Locator;
  readonly orderTotal: Locator;
  readonly shippingCost: Locator;
  readonly taxAmount: Locator;

  // Demoblaze-specific selectors
  readonly orderModal: Locator;
  readonly nameInput: Locator;
  readonly countryInput: Locator;
  readonly cityInputDemoblaze: Locator;
  readonly cardInput: Locator;
  readonly monthInput: Locator;
  readonly yearInput: Locator;
  readonly purchaseButton: Locator;
  readonly confirmationModal: Locator;

  constructor(page: Page) {
    super(page);
    
    // Demoblaze-specific selectors
    this.orderModal = page.locator('#orderModal');
    this.nameInput = page.locator('#name');
    this.countryInput = page.locator('#country');
    this.cityInputDemoblaze = page.locator('#city');
    this.cardInput = page.locator('#card');
    this.monthInput = page.locator('#month');
    this.yearInput = page.locator('#year');
    this.purchaseButton = page.locator('button[onclick="purchaseOrder()"]');
    this.confirmationModal = page.locator('.sweet-alert');
    
    // Keep generic selectors for backward compatibility
    this.shippingSection = page.locator('[data-testid="shipping-section"]');
    this.billingSection = page.locator('[data-testid="billing-section"]');
    this.paymentSection = page.locator('[data-testid="payment-section"]');
    this.orderSummary = page.locator('[data-testid="order-summary"]');
    this.placeOrderButton = page.locator('[data-testid="place-order-button"]');
    this.firstNameInput = page.locator('[data-testid="first-name"]');
    this.lastNameInput = page.locator('[data-testid="last-name"]');
    this.addressInput = page.locator('[data-testid="address"]');
    this.cityInput = page.locator('[data-testid="city"]');
    this.stateSelect = page.locator('[data-testid="state"]');
    this.zipCodeInput = page.locator('[data-testid="zip-code"]');
    this.countrySelect = page.locator('[data-testid="country"]');
    this.phoneInput = page.locator('[data-testid="phone"]');
    this.cardNumberInput = page.locator('[data-testid="card-number"]');
    this.expiryMonthSelect = page.locator('[data-testid="expiry-month"]');
    this.expiryYearSelect = page.locator('[data-testid="expiry-year"]');
    this.cvvInput = page.locator('[data-testid="cvv"]');
    this.cardholderNameInput = page.locator('[data-testid="cardholder-name"]');
    this.sameAsBillingCheckbox = page.locator('[data-testid="same-as-billing"]');
    this.orderTotal = page.locator('[data-testid="order-total"]');
    this.shippingCost = page.locator('[data-testid="shipping-cost"]');
    this.taxAmount = page.locator('[data-testid="tax-amount"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout');
    await this.waitForPageLoad();
  }

  /**
   * Fill Demoblaze order form
   */
  async fillDemoblazeOrderForm(orderData: {
    name: string;
    country: string;
    city: string;
    creditCard: string;
    month: string;
    year: string;
  }): Promise<void> {
    await this.nameInput.fill(orderData.name);
    await this.countryInput.fill(orderData.country);
    await this.cityInputDemoblaze.fill(orderData.city);
    await this.cardInput.fill(orderData.creditCard);
    await this.monthInput.fill(orderData.month);
    await this.yearInput.fill(orderData.year);
  }

  async fillShippingAddress(address: ShippingAddress): Promise<void> {
    // For Demoblaze, we combine first and last name
    await this.nameInput.fill(`${address.firstName} ${address.lastName}`);
    await this.countryInput.fill(address.country);
    await this.cityInputDemoblaze.fill(address.city);
  }

  async fillPaymentInfo(payment: PaymentInfo): Promise<void> {
    await this.cardInput.fill(payment.cardNumber);
    await this.monthInput.fill(payment.expiryMonth);
    await this.yearInput.fill(payment.expiryYear);
  }

  async useSameAsBillingAddress(): Promise<void> {
    // Demoblaze doesn't have separate billing address
    console.log('Same as billing not applicable on Demoblaze');
  }

  async placeOrder(): Promise<void> {
    await this.purchaseButton.click();
    await this.waitForPageLoad();
  }

  async getOrderTotal(): Promise<string> {
    // Demoblaze shows total in confirmation modal
    const details = await this.getOrderDetails();
    const amountMatch = details.match(/Amount:\s*(\d+)/);
    return amountMatch ? `$${amountMatch[1]}` : '';
  }

  async getShippingCost(): Promise<string> {
    // Demoblaze doesn't show separate shipping cost
    return '$0.00';
  }

  async getTaxAmount(): Promise<string> {
    // Demoblaze doesn't show separate tax amount
    return '$0.00';
  }

  async scrollToPaymentSection(): Promise<void> {
    // Demoblaze has a modal, so scrolling isn't needed
    console.log('Scrolling not needed for Demoblaze modal');
  }

  async isFormValid(): Promise<boolean> {
    // Check if all required fields are filled
    const name = await this.nameInput.inputValue();
    const country = await this.countryInput.inputValue();
    const city = await this.cityInputDemoblaze.inputValue();
    const card = await this.cardInput.inputValue();
    const month = await this.monthInput.inputValue();
    const year = await this.yearInput.inputValue();
    
    return !!(name && country && city && card && month && year);
  }

  /**
   * Get order confirmation details from Demoblaze
   */
  async getOrderDetails(): Promise<string> {
    return await this.page.locator('.sweet-alert .lead').textContent() || '';
  }

  /**
   * Get order ID from confirmation
   */
  async getOrderId(): Promise<string> {
    const details = await this.getOrderDetails();
    const idMatch = details.match(/Id:\s*(\d+)/);
    return idMatch ? idMatch[1] : '';
  }

  /**
   * Get order amount from confirmation
   */
  async getOrderAmount(): Promise<string> {
    const details = await this.getOrderDetails();
    const amountMatch = details.match(/Amount:\s*(\d+)/);
    return amountMatch ? amountMatch[1] : '';
  }

  /**
   * Click OK on confirmation modal
   */
  async clickOk(): Promise<void> {
    await this.page.click('.confirm.btn.btn-lg.btn-primary');
  }
}
