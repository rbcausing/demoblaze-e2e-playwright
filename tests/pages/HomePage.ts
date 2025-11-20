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
    // Wait for navigation to be visible
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
   * Note: Using getByRole with 'Cart' text as DemoBlaze doesn't have data-testid
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
    const categoryMap: Record<string, string> = {
      Laptops: 'Laptops',
      Phones: 'Phones',
      Monitors: 'Monitors',
    };

    const categoryName = categoryMap[category] || category;
    await this.page.getByRole('link', { name: categoryName }).click();
    // Wait for products to load - look for product cards
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
    // Find the first product link by looking for product titles
    // Products are in cards with links - use getByRole to find the first product link
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
   * Handles JavaScript dialog confirmation
   */
  async addToCartFromProductPage(): Promise<void> {
    // Wait for Add to cart button to be visible
    const addToCartButton = this.page.getByRole('link', { name: 'Add to cart' });
    await addToCartButton.waitFor({ state: 'visible', timeout: 15000 });

    // Set up dialog handler before clicking
    const dialogPromise = this.page.waitForEvent('dialog', { timeout: 10000 });
    await addToCartButton.click();
    const dialog = await dialogPromise;
    await dialog.accept();
    // Wait for dialog to close - use waitForLoadState instead of timeout
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Find and add the most expensive (luxury) item to cart
   * Parses all product prices and identifies the highest-priced item
   * Note: Uses getByRole to find products. For price comparison, navigates to each product page.
   * This is a last-resort approach when prices aren't easily accessible on listing page.
   * Suggestion: Add data-testid="product-price" to product cards for better testability.
   */
  async findAndAddLuxuryItem(): Promise<void> {
    // Wait for products to be visible
    await this.page.locator('.card-block').first().waitFor({ state: 'visible', timeout: 10000 });

    // Get all product links (exclude navigation links)
    const productLinks = this.page.getByRole('link').filter({
      hasNotText: /Home|Contact|About|Cart|Log|Sign|Add to cart/i,
    });
    const productCount = await productLinks.count();

    if (productCount === 0) {
      throw new Error('No products found on page');
    }

    let maxPrice = 0;
    let luxuryIndex = 0;

    // For each product, navigate to its page and check price
    for (let i = 0; i < productCount; i++) {
      try {
        // Get product link by index (using nth as last resort for product list)
        const productLink = productLinks.nth(i);
        const productName = await productLink.textContent();

        if (!productName || !productName.trim()) continue;

        // Navigate to product page
        await productLink.click();
        await this.waitForLoad();

        // Get price from product detail page using getByRole
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

        // Go back to product list
        await this.page.goBack();
        await this.waitForLoad();
        // Wait a bit for page to stabilize
        await this.page.waitForLoadState('domcontentloaded');
      } catch (error) {
        // If error, try to go back and continue
        try {
          await this.page.goBack();
          await this.waitForLoad();
        } catch {
          // If can't go back, navigate to home
          await this.navigate();
        }
        continue;
      }
    }

    if (maxPrice === 0) {
      throw new Error('No valid product prices found');
    }

    // Navigate to the luxury product
    const luxuryLink = productLinks.nth(luxuryIndex);
    await luxuryLink.click();
    await this.waitForLoad();

    // Add to cart
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
   * Note: Uses getByRole to find product links, filtering out navigation links
   */
  async getProductTitles(): Promise<string[]> {
    // Product titles are in links - exclude navigation and action links
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
