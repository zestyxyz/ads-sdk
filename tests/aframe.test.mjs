import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:8080/tests/aframe/');
});

test.describe('Initial load', () => {
  test('The correct test page is currently loaded', async ({ page }) => {
    await expect(page).toHaveTitle('A-Frame Test');
  });

  test('The tall banner is present', async ({ page }) => {
    const banner = await page.locator('#banner1').getAttribute('zesty-banner');
    expect(banner).not.toBeFalsy();
  });

  test('The wide banner is present', async ({ page }) => {
    const banner = await page.locator('#banner2').getAttribute('zesty-banner');
    expect(banner).not.toBeFalsy();
  });

  test('The square banner is present', async ({ page }) => {
    const banner = await page.locator('#banner3').getAttribute('zesty-banner');
    expect(banner).not.toBeFalsy();
  });
});

test.describe('Standard styles', () => {
  test('The tall standard banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner1 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('zesty-banner-tall.png');
  });

  test('The wide standard banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner2 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('zesty-banner-wide.png');
  });

  test('The square standard banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner3 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('zesty-banner-square.png');
  });
});

test.describe('Minimal styles', () => {
  test('The tall minimal banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner4 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('zesty-banner-tall-minimal.png');
  });

  test('The wide minimal banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner5 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('zesty-banner-wide-minimal.png');
  });

  test('The square minimal banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner6 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('zesty-banner-square-minimal.png');
  });
});

test.describe('Transparent styles', () => {
  test('The tall transparent banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner7 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('zesty-banner-tall-transparent.png');
  });

  test('The wide transparent banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner8 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('zesty-banner-wide-transparent.png');
  });

  test('The square transparent banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner9 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('zesty-banner-square-transparent.png');
  });
});

test.describe('Navigation', () => {
  test('Clicking the banner navigates to a new page', async ({ page, context }) => {
    await page.waitForSelector('#banner9 > a-plane', { state: 'attached' });
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.evaluate(() => document.querySelector('#banner9 > a-plane').click())
    ])
    await newPage.waitForLoadState();
    const title = await newPage.title();
    expect(title).not.toBe('A-Frame Test');
  });
});
