import { test, expect } from '@playwright/test';

function srcEvaluate(node) {
  if (typeof node.components.material.data.src === 'string') {
    return node.components.material.data.src;
  } else {
    return node.components.material.data.src.currentSrc;
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:8080/tests/aframe/', { waitUntil: 'domcontentloaded' });
  page.on('console', (msg) => {
    console.log(msg);
  });
});

test.describe('Initial load', () => {
  test('The correct test page is currently loaded', async ({ page }) => {
    await expect(page).toHaveTitle('A-Frame Test');
  });

  test('The medium-rectangle banner is present', async ({ page }) => {
    const banner = await page.locator('#banner1').getAttribute('zesty-banner');
    expect(banner).not.toBeFalsy();
  });

  test('The billboard banner is present', async ({ page }) => {
    const banner = await page.locator('#banner2').getAttribute('zesty-banner');
    expect(banner).not.toBeFalsy();
  });

  test('The mobile-phone-interstitial banner is present', async ({ page }) => {
    const banner = await page.locator('#banner3').getAttribute('zesty-banner');
    expect(banner).not.toBeFalsy();
  });
});

test.describe('Default banners', () => {
  test('The medium-rectangle banner is displaying the correct default image', async ({ page }) => {
    let img;
    const banner = await page.locator('#banner1 > a-plane');
    while (!img) {
      img = await banner.evaluate(srcEvaluate);
      if (!img) await page.waitForTimeout(100);
    }
    expect(img.split('/').pop()).toBe('zesty-default-medium-rectangle.png');
  });

  test('The billboard banner is displaying the correct default image', async ({ page }) => {
    let img;
    const banner = await page.locator('#banner2 > a-plane');
    while (!img) {
      img = await banner.evaluate(srcEvaluate);
      if (!img) await page.waitForTimeout(100);
    }
    expect(img.split('/').pop()).toBe('zesty-default-billboard.png');
  });

  test('The mobile-phone-interstitial banner is displaying the correct default image', async ({ page }) => {
    let img;
    const banner = await page.locator('#banner3 > a-plane');
    while (!img) {
      img = await banner.evaluate(srcEvaluate);
      if (!img) await page.waitForTimeout(100);
    }
    expect(img.split('/').pop()).toBe('zesty-default-mobile-phone-interstitial.png');
  });
});

test.describe('Navigation', () => {
  test('Clicking the banner navigates to a new page', async ({ page, context }) => {
    let img;
    const banner = await page.locator('#banner3 > a-plane');
    while (!img) {
      img = await banner.evaluate(srcEvaluate);
      if (!img) await page.waitForTimeout(100);
    }
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.evaluate(() => document.querySelector('#banner3 > a-plane').click())
    ])
    await newPage.waitForLoadState('domcontentloaded', { timeout: 60000 }); // Adjust timeout as needed
    const title = await newPage.title();
    expect(title).not.toBe('A-Frame Test');
  });
});
