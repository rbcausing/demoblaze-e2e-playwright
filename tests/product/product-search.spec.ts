import { test, expect } from '../fixtures/testFixtures';

test.describe('Demoblaze Product Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.demoblaze.com/');
    await page.waitForSelector('text=Home');
  });

  test('should navigate to Phones category @smoke', async ({ page }) => {
    await page.click('text=Phones');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { state: 'visible' });

    // Verify we're on phones page
    const productCards = await page.locator('.card-block').count();
    expect(productCards).toBeGreaterThan(0);

    // Verify first product is a phone
    const firstProductTitle = await page.locator('.card-title a').first().textContent();
    expect(firstProductTitle).toContain('Samsung');
  });

  test('should navigate to Laptops category', async ({ page }) => {
    await page.click('text=Laptops');
    await page.waitForSelector('.card-block');

    // Verify we're on laptops page
    const productCards = await page.locator('.card-block').count();
    expect(productCards).toBeGreaterThan(0);

    // Verify first product is a laptop
    const firstProductTitle = await page.locator('.card-title a').first().textContent();
    expect(firstProductTitle).toContain('Sony');
  });

  test('should navigate to Monitors category', async ({ page }) => {
    await page.click('text=Monitors');
    await page.waitForSelector('.card-block');

    // Verify we're on monitors page
    const productCards = await page.locator('.card-block').count();
    expect(productCards).toBeGreaterThan(0);
  });

  test('should display product details correctly', async ({ page }) => {
    // Navigate to product
    await page.click('text=Phones');
    await page.waitForSelector('.card-block');
    await page.click('.card-title a >> nth=0');

    // Verify product details page loads
    await expect(page.locator('h2.name')).toBeVisible();
    await expect(page.locator('h3.price-container')).toBeVisible();
    await expect(page.locator('text=Add to cart')).toBeVisible();
  });

  test('should find luxury laptop correctly', async ({ page }) => {
    await page.click('text=Laptops');
    await page.waitForSelector('.card-block');

    // Get all laptop prices
    const priceElements = await page.locator('h5').allTextContents();
    const prices = priceElements
      .filter(price => price.startsWith('$'))
      .map(price => parseFloat(price.replace('$', '')));

    // Find the most expensive laptop
    const maxPrice = Math.max(...prices);
    const luxuryIndex = prices.indexOf(maxPrice);

    // Click on the luxury laptop
    await page.click(`.card-block >> nth=${luxuryIndex} >> a`);
    await page.waitForSelector('.btn.btn-success.btn-lg');

    // Verify it's the most expensive
    const productPrice = await page.locator('h3.price-container').textContent();
    const productPriceValue = parseFloat(productPrice?.replace('$', '') || '0');
    expect(productPriceValue).toBe(maxPrice);
  });

  test('should navigate back to home from category', async ({ page }) => {
    await page.click('text=Phones');
    await page.waitForSelector('.card-block');

    // Navigate back to home
    await page.click('text=Home');

    // Verify we're back on home page
    await expect(page.locator('text=Home')).toBeVisible();
  });
});
