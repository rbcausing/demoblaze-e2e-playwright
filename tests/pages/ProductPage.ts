import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly productImages: Locator;
  readonly sizeSelector: Locator;
  readonly colorSelector: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly buyNowButton: Locator;
  readonly wishlistButton: Locator;
  readonly reviewsSection: Locator;
  readonly productRating: Locator;
  readonly relatedProducts: Locator;
  readonly breadcrumb: Locator;

  constructor(page: Page) {
    super(page);

    // Demoblaze-specific selectors
    this.productTitle = page.locator('h2.name');
    this.productPrice = page.locator('h3.price-container');
    this.productDescription = page.locator('#more-information p');
    this.productImages = page.locator('#imgp img');
    this.addToCartButton = page.locator('a.btn-success');

    // Demoblaze doesn't have these features, but keep for compatibility
    this.sizeSelector = page.locator('[data-testid="size-selector"]');
    this.colorSelector = page.locator('[data-testid="color-selector"]');
    this.quantityInput = page.locator('[data-testid="quantity-input"]');
    this.buyNowButton = page.locator('[data-testid="buy-now-button"]');
    this.wishlistButton = page.locator('[data-testid="wishlist-button"]');
    this.reviewsSection = page.locator('[data-testid="reviews-section"]');
    this.productRating = page.locator('[data-testid="product-rating"]');
    this.relatedProducts = page.locator('[data-testid="related-products"]');
    this.breadcrumb = page.locator('[data-testid="breadcrumb"]');
  }

  async goto(productId: string): Promise<void> {
    // For Demoblaze, we navigate to the product page directly
    await this.page.goto(`/prod.html?idp_=${productId}`);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to a Demoblaze product by clicking on it from the category page
   */
  async navigateToDemoblazeProduct(): Promise<void> {
    // This method assumes we're already on a category page
    await this.page.waitForSelector('.btn.btn-success.btn-lg', { timeout: 10000 });
  }

  async selectSize(_size: string): Promise<void> {
    // Demoblaze doesn't have size selection
    console.log('Size selection not available on Demoblaze');
  }

  async selectColor(_color: string): Promise<void> {
    // Demoblaze doesn't have color selection
    console.log('Color selection not available on Demoblaze');
  }

  async setQuantity(_quantity: number): Promise<void> {
    // Demoblaze doesn't have quantity selection on product page
    console.log('Quantity selection not available on Demoblaze product page');
  }

  async addToCart(): Promise<void> {
    // Set up dialog handler before clicking
    this.page.once('dialog', dialog => dialog.accept());
    await this.addToCartButton.click();
    await this.waitForLoadingToFinish();
  }

  async buyNow(): Promise<void> {
    // Demoblaze doesn't have buy now functionality
    console.log('Buy now not available on Demoblaze');
  }

  async addToWishlist(): Promise<void> {
    // Demoblaze doesn't have wishlist functionality
    console.log('Wishlist not available on Demoblaze');
  }

  async getProductTitle(): Promise<string> {
    return (await this.productTitle.textContent()) || '';
  }

  async getProductPrice(): Promise<string> {
    return (await this.productPrice.textContent()) || '';
  }

  async getProductRating(): Promise<string> {
    // Demoblaze doesn't have ratings
    return 'N/A';
  }

  async scrollToReviews(): Promise<void> {
    // Demoblaze doesn't have reviews section
    console.log('Reviews section not available on Demoblaze');
  }

  async clickRelatedProduct(_index: number): Promise<void> {
    // Demoblaze doesn't have related products
    console.log('Related products not available on Demoblaze');
  }
}
