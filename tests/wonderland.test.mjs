import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:8080/tests/wonderland/deploy');
});

test.describe('Initial load', () => {
  test('The correct test page is currently loaded', async ({ page }) => {
    await expect(page).toHaveTitle('Wonderland Test');
  });

  test('All 9 banners are currently loaded', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners.length > 0)
    const bannerCount = await page.evaluate(() => window.testBanners.length);
    expect(bannerCount).toBe(9);
  });
});

test.describe('Standard styles', () => {
  test('The tall standard banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[0].banner != null);
    const banner1 = await page.evaluate(() => window.testBanners[0].banner.imageSrc);
    expect(banner1.split('/').pop()).toBe('zesty-banner-tall.png');
  });

  test('The wide standard banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[1].banner != null);
    const banner2 = await page.evaluate(() => window.testBanners[1].banner.imageSrc);
    expect(banner2.split('/').pop()).toBe('zesty-banner-wide.png');
  });

  test('The square standard banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[2].banner != null);
    const banner3 = await page.evaluate(() => window.testBanners[2].banner.imageSrc);
    expect(banner3.split('/').pop()).toBe('zesty-banner-square.png');
  });
});

test.describe('Minimal styles', () => {
  test('The tall standard banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[3].banner != null);
    const banner4 = await page.evaluate(() => window.testBanners[3].banner.imageSrc);
    expect(banner4.split('/').pop()).toBe('zesty-banner-tall-minimal.png');
  });

  test('The wide standard banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[4].banner != null);
    const banner5 = await page.evaluate(() => window.testBanners[4].banner.imageSrc);
    expect(banner5.split('/').pop()).toBe('zesty-banner-wide-minimal.png');
  });

  test('The square standard banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[5].banner != null);
    const banner6 = await page.evaluate(() => window.testBanners[5].banner.imageSrc);
    expect(banner6.split('/').pop()).toBe('zesty-banner-square-minimal.png');
  });
});

test.describe('Transparent styles', () => {
  test('The tall transparent banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[6].banner != null);
    const banner7 = await page.evaluate(() => window.testBanners[6].banner.imageSrc);
    expect(banner7.split('/').pop()).toBe('zesty-banner-tall-transparent.png');
  });

  test('The wide transparent banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[7].banner != null);
    const banner8 = await page.evaluate(() => window.testBanners[7].banner.imageSrc);
    expect(banner8.split('/').pop()).toBe('zesty-banner-wide-transparent.png');
  });

  test('The square transparent banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[8].banner != null);
    const banner9 = await page.evaluate(() => window.testBanners[8].banner.imageSrc);
    expect(banner9.split('/').pop()).toBe('zesty-banner-square-transparent.png');
  });
});

test.describe('Navigation', () => {
  test('Clicking the banner navigates to a new page', async ({ page, context }) => {
    await page.waitForFunction(() => window.testBanners[0].banner != null);
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.evaluate(() => window.testBanners[0].executeClick())
    ])
    await newPage.waitForLoadState();
    const title = await newPage.title();
    expect(title).not.toBe('Wonderland Test');
  });
});
