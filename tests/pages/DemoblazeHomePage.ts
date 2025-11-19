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
  readonly cartLink = this.page.locator('#cartur');
  readonly logInLink = this.page.locator('text=Log in');
  readonly signUpLink = this.page.locator('text=Sign up');

  // Category navigation - using exact selectors from Demoblaze
  // Categories use onclick handlers: byCat('notebook'), byCat('phone'), byCat('monitor')
  readonly laptopsCategory = this.page.locator('a[onclick="byCat(\'notebook\')"]');
  readonly phonesCategory = this.page.locator('a[onclick="byCat(\'phone\')"]');
  readonly monitorsCategory = this.page.locator('a[onclick="byCat(\'monitor\')"]');

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
    const categoryLower = category.toLowerCase();
    if (categoryLower === 'laptops') {
      await this.laptopsCategory.click();
    } else if (categoryLower === 'phones') {
      await this.phonesCategory.click();
    } else if (categoryLower === 'monitors') {
      await this.monitorsCategory.click();
    } else {
      throw new Error(`Unknown category: ${category}`);
    }
    // Wait for products to load
    await this.page.waitForSelector('.card-block', { state: 'visible', timeout: 15000 });
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
    // Wait for products to be visible
    await this.page.waitForSelector('.card-block', { state: 'visible', timeout: 15000 });

    // Click on the first product link within card-block
    await this.page.locator('.card-block .card-title a').first().click();
    await this.page.waitForSelector('a.btn-success', { state: 'visible', timeout: 15000 });

    // Set up dialog handler before clicking
    const dialogPromise = this.page.waitForEvent('dialog', { timeout: 10000 });
    await this.page.locator('a.btn-success').click();
    const dialog = await dialogPromise;
    await dialog.accept();
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
    await this.page.waitForSelector('.card-block', { state: 'visible', timeout: 15000 });

    const productCards = await this.page.locator('.card-block').all();

    let maxPrice = 0;
    let luxuryCardIndex = 0;
    const validPrices = [];

    // Parse prices and find the most expensive item
    for (let i = 0; i < productCards.length; i++) {
      try {
        const priceElement = await productCards[i].locator('h5').textContent();
        if (priceElement && priceElement.trim().startsWith('$')) {
          const priceText = priceElement.trim().replace('$', '').split(' ')[0]; // Handle cases like "$1100 *includes tax"
          const price = parseFloat(priceText);
          if (!isNaN(price)) {
            validPrices.push(price);

            if (price > maxPrice) {
              maxPrice = price;
              luxuryCardIndex = i;
            }
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
    // Click on the product title link within the card
    await luxuryCard.locator('.card-title a').first().click();
    await this.page.waitForSelector('a.btn-success', { state: 'visible', timeout: 15000 });

    // Handle add to cart dialog
    const dialogPromise = this.page.waitForEvent('dialog', { timeout: 10000 });
    await this.page.locator('a.btn-success').click();
    const dialog = await dialogPromise;
    await dialog.accept();
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
    await this.page.waitForSelector('.card-block', { state: 'visible', timeout: 15000 });
    await this.page.locator('.card-block .card-title a').nth(index).click();
    await this.page.waitForSelector('a.btn-success', { state: 'visible', timeout: 15000 });

    const dialogPromise = this.page.waitForEvent('dialog', { timeout: 10000 });
    await this.page.locator('a.btn-success').click();
    const dialog = await dialogPromise;
    await dialog.accept();
    await this.page.waitForTimeout(1000);
  }
}
