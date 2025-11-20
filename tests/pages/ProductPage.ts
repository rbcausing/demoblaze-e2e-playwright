import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for DemoBlaze Product Detail Page
 */
export class ProductPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Get product information (title and price)
   * Note: DemoBlaze doesn't have data-testid attributes.
   * Suggestion: Add data-testid="product-title" and data-testid="product-price" for better testability
   */
  async getProductInfo(): Promise<{ title: string; price: string }> {
    // Product title is in h2 heading - use getByRole for heading
    // Filter by visible heading that's not in navigation
    const titleElement = this.page
      .getByRole('heading', { level: 2 })
      .filter({ hasNotText: /Home|Contact|About|Cart|Log|Sign/ });
    await titleElement.waitFor({ state: 'visible', timeout: 15000 });
    const title = (await titleElement.textContent()) || '';

    // Price is in h3 heading - use getByRole for heading
    const priceElement = this.page.getByRole('heading', { level: 3 }).filter({ hasText: '$' });
    const price = (await priceElement.textContent()) || '';

    return { title: title.trim(), price: price.trim() };
  }

  /**
   * Add product to cart
   * Handles JavaScript dialog confirmation
   */
  async addToCart(): Promise<void> {
    // Wait for product details to be visible (indicates page is loaded)
    await this.page
      .locator('.product-content, .product-details, #tbodyid')
      .waitFor({ state: 'visible', timeout: 10000 });

    // Get Add to cart button - auto-wait handles visibility
    const addToCartButton = this.page.getByRole('link', { name: 'Add to cart' });

    // Set up dialog handler before clicking
    const dialogPromise = this.page.waitForEvent('dialog', { timeout: 10000 });
    await addToCartButton.click();
    const dialog = await dialogPromise;
    await dialog.accept();
    // Brief wait for dialog to close
    await this.page.waitForTimeout(500);
  }

  /**
   * Get product title
   */
  async getProductTitle(): Promise<string> {
    const info = await this.getProductInfo();
    return info.title;
  }

  /**
   * Get product price
   */
  async getProductPrice(): Promise<string> {
    const info = await this.getProductInfo();
    return info.price;
  }
}
