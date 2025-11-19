import { Page } from '@playwright/test';

/**
 * Base Page Object Model class
 * Provides common functionality for all page objects
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for page to load completely
   * Uses networkidle to ensure all network requests are complete
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for DOM content to be loaded
   * Faster alternative to networkidle when network activity is not critical
   */
  async waitForDOMContent(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get current page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Navigate to a URL
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.waitForLoad();
  }
}
