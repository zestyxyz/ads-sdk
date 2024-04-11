import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:8080/tests/threejs/');
});

test.describe('Initial load', () => {
  test('The correct test page is currently loaded', async ({ page }) => {
    await expect(page).toHaveTitle('Three.js Test');
  });

  test('All 9 banners are currently loaded', async ({ page }) => {
    const bannerCount = await page.evaluate(() => window.scene.children.length);
    expect(bannerCount).toBe(9);
  });
});

test.describe('Standard styles', () => {
  test('The tall standard banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.scene.children[0].banner.src != null);
    const banner1 = await page.evaluate(() => window.scene.children[0].banner.src);
    expect(banner1.split('/').pop()).toBe('zesty-banner-tall.png');
  });

  test('The wide standard banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.scene.children[1].banner.src != null);
    const banner2 = await page.evaluate(() => window.scene.children[1].banner.src);
    expect(banner2.split('/').pop()).toBe('zesty-banner-wide.png');
  });

  test('The square standard banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.scene.children[2].banner.src != null);
    const banner3 = await page.evaluate(() => window.scene.children[2].banner.src);
    expect(banner3.split('/').pop()).toBe('zesty-banner-square.png');
  });
});

test.describe('Transparent styles', () => {
  test('The tall transparent banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.scene.children[6].banner.src != null);
    const banner7 = await page.evaluate(() => window.scene.children[6].banner.src);
    expect(banner7.split('/').pop()).toBe('zesty-banner-tall-transparent.png');
  });

  test('The wide transparent banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.scene.children[7].banner.src != null);
    const banner8 = await page.evaluate(() => window.scene.children[7].banner.src);
    expect(banner8.split('/').pop()).toBe('zesty-banner-wide-transparent.png');
  });

  test('The square transparent banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.scene.children[8].banner.src != null);
    const banner9 = await page.evaluate(() => window.scene.children[8].banner.src);
    expect(banner9.split('/').pop()).toBe('zesty-banner-square-transparent.png');
  });
});

test.describe('Navigation', () => {
  test('Clicking the banner navigates to a new page', async ({ page, context }) => {
    await page.waitForFunction(() => window.scene.children[0].banner.url);
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.evaluate(() => window.scene.children[0].onClick())
    ])
    await newPage.waitForLoadState();
    const title = await newPage.title();
    expect(title).not.toBe('Three.js Test');
  });
});