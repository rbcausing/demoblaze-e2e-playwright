import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly navigationMenu: Locator;
  readonly featuredProducts: Locator;
  readonly cartIcon: Locator;
  readonly userAccountIcon: Locator;
  readonly categoryLinks: Locator;
  readonly banner: Locator;
  readonly newsletterSignup: Locator;

  // Demoblaze-specific navigation elements
  readonly homeLink: Locator;
  readonly contactLink: Locator;
  readonly aboutUsLink: Locator;
  readonly cartLink: Locator;
  readonly logInLink: Locator;
  readonly signUpLink: Locator;

  // Demoblaze category navigation
  readonly laptopsCategory: Locator;
  readonly phonesCategory: Locator;
  readonly monitorsCategory: Locator;

  // Demoblaze product elements
  readonly productCards: Locator;
  readonly productTitles: Locator;
  readonly productPrices: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);

    // Demoblaze navigation elements
    this.homeLink = page.locator('text=Home');
    this.contactLink = page.locator('text=Contact');
    this.aboutUsLink = page.locator('text=About us');
    this.cartLink = page.locator('text=Cart');
    this.logInLink = page.locator('text=Log in');
    this.signUpLink = page.locator('text=Sign up');

    // Demoblaze category navigation
    this.laptopsCategory = page.locator('text=Laptops');
    this.phonesCategory = page.locator('text=Phones');
    this.monitorsCategory = page.locator('text=Monitors');

    // Demoblaze product elements
    this.productCards = page.locator('.card');
    this.productTitles = page.locator('.card-title a');
    this.productPrices = page.locator('h5');
    this.addToCartButton = page.locator('text=Add to cart');

    // Keep generic selectors for backward compatibility (will be removed in future)
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.searchButton = page.locator('[data-testid="search-button"]');
    this.navigationMenu = page.locator('[data-testid="main-navigation"]');
    this.featuredProducts = page.locator('[data-testid="featured-products"]');
    this.cartIcon = page.locator('[data-testid="cart-icon"]');
    this.userAccountIcon = page.locator('[data-testid="user-account-icon"]');
    this.categoryLinks = page.locator('[data-testid="category-link"]');
    this.banner = page.locator('[data-testid="hero-banner"]');
    this.newsletterSignup = page.locator('[data-testid="newsletter-signup"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Demoblaze homepage with proper error handling
   */
  async navigateToDemoblaze(): Promise<void> {
    try {
      await this.page.goto('https://www.demoblaze.com/', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Wait for key elements to be visible
      await this.page.waitForSelector('text=Home', { timeout: 10000 });
    } catch (error) {
      console.error('Navigation failed:', error);
      throw error;
    }
  }

  /**
   * Select a category using Demoblaze's category navigation
   */
  async selectCategory(categoryName: string): Promise<void> {
    if (categoryName.toLowerCase() === 'laptops') {
      // Use the exact onclick method for laptops
      await this.page.click('a[onclick="byCat(\'notebook\')"]');
    } else if (categoryName.toLowerCase() === 'phones') {
      await this.page.click('a[onclick="byCat(\'phone\')"]');
    } else if (categoryName.toLowerCase() === 'monitors') {
      await this.page.click('a[onclick="byCat(\'monitor\')"]');
    } else {
      await this.page.click(`text=${categoryName}`);
    }

    // Wait for the product container to load
    await this.page.waitForSelector('.card-block');
  }

  /**
   * Search for products using Demoblaze's category-based navigation
   * Note: Demoblaze doesn't have a traditional search, so we navigate to categories
   */
  async searchForProduct(productName: string): Promise<void> {
    // For Demoblaze, we'll navigate to the appropriate category based on product type
    if (
      productName.toLowerCase().includes('laptop') ||
      productName.toLowerCase().includes('notebook')
    ) {
      await this.selectCategory('Laptops');
    } else if (
      productName.toLowerCase().includes('phone') ||
      productName.toLowerCase().includes('mobile')
    ) {
      await this.selectCategory('Phones');
    } else if (
      productName.toLowerCase().includes('monitor') ||
      productName.toLowerCase().includes('display')
    ) {
      await this.selectCategory('Monitors');
    } else {
      // Default to laptops if we can't determine category
      await this.selectCategory('Laptops');
    }
  }

  async clickCategory(categoryName: string): Promise<void> {
    await this.selectCategory(categoryName);
  }

  async clickCartIcon(): Promise<void> {
    await this.cartLink.click();
  }

  async clickUserAccountIcon(): Promise<void> {
    await this.logInLink.click();
  }

  async getFeaturedProductsCount(): Promise<number> {
    return await this.productCards.count();
  }

  /**
   * Add a product to cart by index
   */
  async addProductToCartByIndex(index: number): Promise<void> {
    await this.productTitles.nth(index).click();

    // Wait for product page to load
    await this.page.waitForSelector('.btn.btn-success.btn-lg', { timeout: 10000 });

    // Set up dialog handler before clicking
    this.page.once('dialog', dialog => dialog.accept());
    await this.page.click('text=Add to cart');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Find and add the most expensive (luxury) product to cart
   * Used for testing premium product selection
   */
  async findAndAddLuxuryItem(): Promise<void> {
    await this.page.waitForSelector('.card-block', { timeout: 10000 });

    const productCards = await this.page.locator('.card-block').all();
    let maxPrice = 0;
    let luxuryCardIndex = 0;

    // Find the most expensive item
    for (let i = 0; i < productCards.length; i++) {
      try {
        const priceElement = await productCards[i].locator('h5').textContent();
        if (priceElement && priceElement.startsWith('$')) {
          const price = parseFloat(priceElement.replace('$', ''));
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

    const luxuryCard = productCards[luxuryCardIndex];
    await luxuryCard.locator('a').first().click();
    await this.page.waitForSelector('.btn.btn-success.btn-lg', { timeout: 10000 });

    this.page.once('dialog', dialog => dialog.accept());
    await this.page.click('.btn.btn-success.btn-lg');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Newsletter signup (not available on Demoblaze)
   * @param _email - Email address (unused)
   */
  async signupForNewsletter(_email: string): Promise<void> {
    // Demoblaze doesn't have newsletter signup functionality
  }
}
