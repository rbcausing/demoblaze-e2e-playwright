/**
 * Utility functions for e-commerce testing
 */
import { Page } from '@playwright/test';

export class TestHelpers {
  /**
   * Generate a random email address for testing
   */
  static generateRandomEmail(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `test-${random}-${timestamp}@example.com`;
  }

  /**
   * Generate a random phone number
   */
  static generateRandomPhone(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `+1${areaCode}${exchange}${number}`;
  }

  /**
   * Format price string to number
   */
  static parsePrice(priceString: string): number {
    return parseFloat(priceString.replace(/[$,]/g, ''));
  }

  /**
   * Calculate total with tax and shipping
   */
  static calculateTotal(subtotal: number, taxRate: number = 0.08, shipping: number = 0): number {
    const tax = subtotal * taxRate;
    return subtotal + tax + shipping;
  }

  /**
   * Generate a random string of specified length
   */
  static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Wait for a specific amount of time
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Format credit card number with spaces
   */
  static formatCreditCard(cardNumber: string): string {
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  }

  /**
   * Generate a random product ID
   */
  static generateProductId(): string {
    return `prod-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Calculate discount amount
   */
  static calculateDiscount(originalPrice: number, discountPercent: number): number {
    return originalPrice * (discountPercent / 100);
  }

  /**
   * Ensure mobile navigation menu is expanded if needed
   */
  static async ensureMobileMenuExpanded(page: Page): Promise<void> {
    const togglerVisible = await page
      .locator('.navbar-toggler')
      .isVisible()
      .catch(() => false);

    if (togglerVisible) {
      const classes = await page.locator('.navbar-collapse').getAttribute('class');
      const menuCollapsed = !classes?.includes('show');

      if (menuCollapsed) {
        await page.click('.navbar-toggler');
        await page.waitForTimeout(500);
      }
    }
  }
}
