import { test, expect } from '../fixtures/testFixtures';
import { TestHelpers } from '../utils/helpers';

test.describe('Demoblaze Smoke Tests - Critical Functionality', () => {
  test('should load homepage successfully @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/', { waitUntil: 'load' });

    await expect(page).toHaveTitle(/STORE/, { timeout: 10000 });
    await expect(page.locator('text=Home')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Phones')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Laptops')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Monitors')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to product categories @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Home', { timeout: 10000 });

    await page.click('text=Phones');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { state: 'visible', timeout: 15000 });
    const phoneProducts = await page.locator('.card-block').count();
    expect(phoneProducts).toBeGreaterThan(0);

    await page.click('text=Laptops');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { state: 'visible', timeout: 15000 });
    const laptopProducts = await page.locator('.card-block').count();
    expect(laptopProducts).toBeGreaterThan(0);
  });

  test('should add product to cart @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Home', { timeout: 10000 });

    await page.click('text=Phones');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { state: 'visible', timeout: 15000 });
    await page.click('.card-title a >> nth=0');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.btn.btn-success.btn-lg', { state: 'visible', timeout: 15000 });

    const dialogPromise = page.waitForEvent('dialog', { timeout: 10000 });
    await page.click('text=Add to cart');
    const dialog = await dialogPromise;
    await dialog.accept();
    await page.waitForTimeout(1000);

    await page.click('#cartur');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('tbody', { state: 'visible', timeout: 15000 });
    const cartItems = await page.locator('tbody tr').count();
    expect(cartItems).toBe(1);
  });

  test('should proceed to checkout @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Home', { timeout: 10000 });

    await page.click('text=Phones');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.card-block', { state: 'visible', timeout: 15000 });
    await page.click('.card-title a >> nth=0');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.btn.btn-success.btn-lg', { state: 'visible', timeout: 15000 });

    const dialogPromise = page.waitForEvent('dialog', { timeout: 10000 });
    await page.click('text=Add to cart');
    const dialog = await dialogPromise;
    await dialog.accept();
    await page.waitForTimeout(1000);

    await page.click('#cartur');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('tbody', { state: 'visible', timeout: 15000 });
    await page.click('button.btn-success');

    await expect(page.locator('#orderModal')).toBeVisible({ timeout: 15000 });
  });

  test('should open user authentication modals @smoke', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/', { waitUntil: 'domcontentloaded' });

    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('text=Home')).toBeVisible({ timeout: 10000 });

    await TestHelpers.ensureMobileMenuExpanded(page);

    await page.click('#signin2');
    await expect(page.locator('#signInModal')).toBeVisible({ timeout: 10000 });

    await page.locator('#signInModal .close').click();
    await expect(page.locator('#signInModal')).toBeHidden({ timeout: 5000 });

    await expect(page.locator('.modal-backdrop')).toHaveCount(0, { timeout: 5000 });

    await TestHelpers.ensureMobileMenuExpanded(page);

    await page.click('#login2');
    await expect(page.locator('#logInModal')).toBeVisible({ timeout: 10000 });
  });
});
