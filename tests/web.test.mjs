import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:8080/tests/web/');
});

test.describe('Initial load', () => {
  test('The correct test page is currently loaded', async ({ page }) => {
    await expect(page).toHaveTitle('Web Test');
  });

  test('All 9 banners are currently loaded', async ({ page }) => {
    const bannerCount = await page.evaluate(
      () => document.getElementsByTagName('zesty-web').length
    );
    expect(bannerCount).toBe(9);
  });
});

test.describe('Standard styles', () => {
  test('The tall standard banner is present', async ({ page }) => {
    await page.waitForFunction(() => document.getElementById('banner1').shadowRoot.children[0]);
    const banner1 = await page.evaluate(
      () => document.getElementById('banner1').shadowRoot.children[0].src
    );
    expect(banner1.split('/').pop()).toBe('zesty-default-mobile-phone-interstitial.png');
  });

  test('The wide standard banner is present', async ({ page }) => {
    await page.waitForFunction(() => document.getElementById('banner2').shadowRoot.children[0]);
    const banner2 = await page.evaluate(
      () => document.getElementById('banner2').shadowRoot.children[0].src
    );
    expect(banner2.split('/').pop()).toBe('zesty-default-billboard.png');
  });

  test('The square standard banner is present', async ({ page }) => {
    await page.waitForFunction(() => document.getElementById('banner3').shadowRoot.children[0]);
    const banner3 = await page.evaluate(
      () => document.getElementById('banner3').shadowRoot.children[0].src
    );
    expect(banner3.split('/').pop()).toBe('zesty-default-med-rectangle.png');
  });
});

test.describe('Navigation', () => {
  test('Clicking the banner navigates to a new page', async ({ page, context }) => {
    await page.waitForFunction(() => document.getElementById('banner1').shadowRoot.children[0]);
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.evaluate(() => document.getElementById('banner1').shadowRoot.children[0].click())
    ])
    await newPage.waitForLoadState();
    const title = await newPage.title();
    expect(title).not.toBe('Web Test');
  });
});
