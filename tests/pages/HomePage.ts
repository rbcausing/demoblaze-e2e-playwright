import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for DemoBlaze Homepage
 * Handles navigation, product browsing, and category selection
 */
export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to DemoBlaze homepage
   */
  async navigate(): Promise<void> {
    await this.page.goto('https://www.demoblaze.com/', {
      waitUntil: 'domcontentloaded',
    });
    await this.waitForLoad();
    await this.page.getByRole('link', { name: 'Home' }).waitFor({ state: 'visible' });
  }

  /**
   * Click on Home link
   */
  async clickHome(): Promise<void> {
    await this.page.getByRole('link', { name: 'Home' }).click();
    await this.waitForLoad();
  }

  /**
   * Click on Contact link
   */
  async clickContact(): Promise<void> {
    await this.page.getByRole('link', { name: 'Contact' }).click();
  }

  /**
   * Click on About us link
   */
  async clickAboutUs(): Promise<void> {
    await this.page.getByRole('link', { name: 'About us' }).click();
  }

  /**
   * Click on Cart link
   */
  async clickCart(): Promise<void> {
    await this.page.getByRole('link', { name: 'Cart' }).click();
    await this.waitForLoad();
  }

  /**
   * Click on Log in link
   */
  async clickLogIn(): Promise<void> {
    await this.page.getByRole('link', { name: 'Log in' }).click();
  }

  /**
   * Click on Sign up link
   */
  async clickSignUp(): Promise<void> {
    await this.page.getByRole('link', { name: 'Sign up' }).click();
  }

  /**
   * Select a product category
   * @param category - Category name: 'Laptops', 'Phones', or 'Monitors'
   */
  async selectCategory(category: string): Promise<void> {
    await this.page.getByRole('link', { name: category }).click();
    await this.page.locator('.card-block').first().waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Select Laptops category
   */
  async selectLaptopsCategory(): Promise<void> {
    await this.selectCategory('Laptops');
  }

  /**
   * Select Phones category
   */
  async selectPhonesCategory(): Promise<void> {
    await this.selectCategory('Phones');
  }

  /**
   * Select Monitors category
   */
  async selectMonitorsCategory(): Promise<void> {
    await this.selectCategory('Monitors');
  }

  /**
   * Click on the first product in the current category
   */
  async clickFirstProduct(): Promise<void> {
    const productLinks = this.page
      .getByRole('link')
      .filter({ hasText: /Samsung|Nokia|Sony|MacBook|Dell|ASUS|Apple|HP|Lenovo|Monitor/i });
    await productLinks.first().click();
    await this.waitForLoad();
  }

  /**
   * Add the first product in the current category to cart
   * Handles JavaScript dialog confirmation
   */
  async addFirstProductToCart(): Promise<void> {
    await this.clickFirstProduct();
    await this.addToCartFromProductPage();
  }

  /**
   * Add product to cart from product detail page
   */
  async addToCartFromProductPage(): Promise<void> {
    const addToCartButton = this.page.getByRole('link', { name: 'Add to cart' });
    await addToCartButton.waitFor({ state: 'visible', timeout: 15000 });

    const dialogPromise = this.page.waitForEvent('dialog', { timeout: 10000 });
    await addToCartButton.click();
    const dialog = await dialogPromise;
    await dialog.accept();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Find and add the most expensive (luxury) item to cart
   */
  async findAndAddLuxuryItem(): Promise<void> {
    await this.page.locator('.card-block').first().waitFor({ state: 'visible', timeout: 10000 });

    const productLinks = this.page.getByRole('link').filter({
      hasNotText: /Home|Contact|About|Cart|Log|Sign|Add to cart/i,
    });
    const productCount = await productLinks.count();

    if (productCount === 0) {
      throw new Error('No products found on page');
    }

    let maxPrice = 0;
    let luxuryIndex = 0;

    for (let i = 0; i < productCount; i++) {
      const productLink = productLinks.nth(i);
      const productName = await productLink.textContent();

      if (!productName || !productName.trim()) continue;

      await productLink.click();
      await this.waitForLoad();

      const priceHeading = this.page.getByRole('heading', { level: 3 }).filter({ hasText: '$' });
      const priceText = await priceHeading.textContent();

      if (priceText) {
        const priceMatch = priceText.match(/\$(\d+)/);
        if (priceMatch) {
          const price = parseFloat(priceMatch[1]);
          if (!isNaN(price) && price > maxPrice) {
            maxPrice = price;
            luxuryIndex = i;
          }
        }
      }

      await this.page.goBack();
      await this.waitForLoad();
      await this.page.waitForLoadState('domcontentloaded');
    }

    if (maxPrice === 0) {
      throw new Error('No valid product prices found');
    }

    const luxuryLink = productLinks.nth(luxuryIndex);
    await luxuryLink.click();
    await this.waitForLoad();

    await this.addToCartFromProductPage();
  }

  /**
   * Navigate to Laptops and add the most expensive laptop
   */
  async addLuxuryLaptopToCart(): Promise<void> {
    await this.selectLaptopsCategory();
    await this.findAndAddLuxuryItem();
  }

  /**
   * Get the number of products displayed on the current page
   */
  async getProductCount(): Promise<number> {
    // Count products by counting "Add to cart" buttons
    return await this.page.getByRole('link', { name: 'Add to cart' }).count();
  }

  /**
   * Get all product titles from the current page
   */
  async getProductTitles(): Promise<string[]> {
    const productLinks = this.page.getByRole('link').filter({
      hasNotText: /Home|Contact|About|Cart|Log|Sign|Add to cart/i,
    });
    const count = await productLinks.count();
    const titles: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await productLinks.nth(i).textContent();
      if (text && text.trim()) titles.push(text.trim());
    }
    return titles;
  }
}
