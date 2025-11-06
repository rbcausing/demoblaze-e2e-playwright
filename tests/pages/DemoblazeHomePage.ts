import { Page } from '@playwright/test';

/**
 * Page Object Model for Demoblaze.com Homepage
 * Handles navigation, product browsing, and category selection
 *
 * @example
 * ```typescript
 * const homePage = new DemoblazeHomePage(page);
 * await homePage.navigate();
 * await homePage.selectCategory('Laptops');
 * await homePage.addLuxuryLaptopToCart();
 * ```
 */
export class DemoblazeHomePage {
  constructor(private page: Page) {}

  // Navigation elements
  readonly homeLink = this.page.locator('text=Home');
  readonly contactLink = this.page.locator('text=Contact');
  readonly aboutUsLink = this.page.locator('text=About us');
  readonly cartLink = this.page.locator('text=Cart');
  readonly logInLink = this.page.locator('text=Log in');
  readonly signUpLink = this.page.locator('text=Sign up');

  // Category navigation - using exact selectors from Demoblaze
  readonly laptopsCategory = this.page.locator('text=Laptops');
  readonly phonesCategory = this.page.locator('text=Phones');
  readonly monitorsCategory = this.page.locator('text=Monitors');

  // Product elements - using exact selectors
  readonly productCards = this.page.locator('.card');
  readonly productTitles = this.page.locator('.card-title a');
  readonly productPrices = this.page.locator('h5');
  readonly addToCartButton = this.page.locator('text=Add to cart');

  /**
   * Navigate to Demoblaze homepage and wait for page load
   * @throws {Error} If navigation fails or timeout is reached
   */
  async navigate(): Promise<void> {
    try {
      await this.page.goto('https://www.demoblaze.com/', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Wait for key elements to be visible
      await this.page.waitForSelector('text=Home', { timeout: 10000 });
    } catch (error) {
      throw new Error(`Navigation to Demoblaze failed: ${error}`);
    }
  }

  /**
   * Select a product category from the navigation menu
   * @param category - Category name: 'Laptops', 'Phones', or 'Monitors'
   */
  async selectCategory(category: string): Promise<void> {
    if (category.toLowerCase() === 'laptops') {
      await this.page.click('a[onclick="byCat(\'notebook\')"]');
    } else {
      await this.page.click(`text=${category}`);
    }
    await this.page.waitForSelector('.card-block');
  }

  /**
   * Convenience method to navigate directly to Laptops category
   */
  async selectLaptopsCategory(): Promise<void> {
    await this.selectCategory('Laptops');
  }

  /**
   * Add the first product in the current category to cart
   * Handles JavaScript dialog confirmation
   */
  async addFirstProductToCart(): Promise<void> {
    await this.page.click('.card-title a >> nth=0');
    await this.page.waitForSelector('.btn.btn-success.btn-lg', { timeout: 10000 });

    // Set up dialog handler before clicking
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await this.page.click('text=Add to cart');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Intelligent algorithm to find and add the most expensive (luxury) item to cart
   * Parses all product prices and identifies the highest-priced item
   *
   * @throws {Error} If no valid product prices are found
   *
   * @example
   * ```typescript
   * await homePage.selectLaptopsCategory();
   * await homePage.findLuxuryItem(); // Automatically adds MacBook Pro ($1100)
   * ```
   */
  async findLuxuryItem(): Promise<void> {
    await this.page.waitForSelector('.card-block', { timeout: 10000 });

    const productCards = await this.page.locator('.card-block').all();

    let maxPrice = 0;
    let luxuryCardIndex = 0;
    const validPrices = [];

    // Parse prices and find the most expensive item
    for (let i = 0; i < productCards.length; i++) {
      try {
        const priceElement = await productCards[i].locator('h5').textContent();
        if (priceElement && priceElement.startsWith('$')) {
          const price = parseFloat(priceElement.replace('$', ''));
          validPrices.push(price);

          if (price > maxPrice) {
            maxPrice = price;
            luxuryCardIndex = i;
          }
        }
      } catch (error) {
        // Skip products without valid prices
        continue;
      }
    }

    if (validPrices.length === 0) {
      throw new Error('No valid product prices found');
    }

    const luxuryCard = productCards[luxuryCardIndex];
    await luxuryCard.locator('a').first().click();
    await this.page.waitForSelector('.btn.btn-success.btn-lg', { timeout: 10000 });

    // Handle add to cart dialog
    this.page.once('dialog', dialog => dialog.accept());
    await this.page.click('.btn.btn-success.btn-lg');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Convenience method: Navigate to Laptops and add the most expensive laptop
   * Combines selectLaptopsCategory() and findLuxuryItem()
   */
  async addLuxuryLaptopToCart(): Promise<void> {
    await this.selectLaptopsCategory();
    await this.findLuxuryItem();
  }

  /**
   * Navigate to the shopping cart page
   */
  async clickCart(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the total number of products displayed on the current page
   * @returns Number of product cards
   */
  async getProductCount(): Promise<number> {
    return await this.productCards.count();
  }

  /**
   * Get all product titles from the current page
   * @returns Array of product title strings
   */
  async getProductTitles(): Promise<string[]> {
    return await this.productTitles.allTextContents();
  }

  /**
   * Get all product prices from the current page
   * @returns Array of price strings (e.g., ["$360", "$820"])
   */
  async getProductPrices(): Promise<string[]> {
    return await this.productPrices.allTextContents();
  }

  /**
   * Add a specific product to cart by its index position
   * @param index - Zero-based index of the product (0 = first product)
   */
  async addProductToCartByIndex(index: number): Promise<void> {
    await this.productTitles.nth(index).click();
    await this.page.waitForSelector('.btn.btn-success.btn-lg', { timeout: 10000 });

    this.page.once('dialog', dialog => dialog.accept());
    await this.page.click('text=Add to cart');
    await this.page.waitForTimeout(1000);
  }
}
