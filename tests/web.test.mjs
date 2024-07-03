import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:8080/tests/web/');
});

test.describe('Initial load', () => {
  test('The correct test page is currently loaded', async ({ page }) => {
    await expect(page).toHaveTitle('Web Test');
  });

  test('All 3 banners are currently loaded', async ({ page }) => {
    const bannerCount = await page.evaluate(
      () => document.getElementsByTagName('zesty-web').length
    );
    expect(bannerCount).toBe(3);
  });
});

test.describe('Default banners', () => {
  test('The medium-rectangle banner is present', async ({ page }) => {
    await page.waitForFunction(() => document.getElementById('banner1').shadowRoot.children[0]);
    const banner1 = await page.evaluate(
      () => document.getElementById('banner1').shadowRoot.children[0].src
    );
    expect(banner1.split('/').pop()).toBe('zesty-default-medium-rectangle.png');
  });

  test('The billboard banner is present', async ({ page }) => {
    await page.waitForFunction(() => document.getElementById('banner2').shadowRoot.children[0]);
    const banner2 = await page.evaluate(
      () => document.getElementById('banner2').shadowRoot.children[0].src
    );
    expect(banner2.split('/').pop()).toBe('zesty-default-billboard.png');
  });

  test('The mobile-phone-interstitial banner is present', async ({ page }) => {
    await page.waitForFunction(() => document.getElementById('banner3').shadowRoot.children[0]);
    const banner3 = await page.evaluate(
      () => document.getElementById('banner3').shadowRoot.children[0].src
    );
    expect(banner3.split('/').pop()).toBe('zesty-default-mobile-phone-interstitial.png');
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

test.describe('Prebid', () => {
  async function injectIFrame(page, url, image) {
    await page.waitForFunction(() => document.querySelector('#zesty-div-medium-rectangle') != null);
    await page.evaluate(([url, image]) => {
      const iframe = document.createElement('iframe');
      iframe.id = 'injected';
      document.querySelector('#zesty-div-medium-rectangle').appendChild(iframe)
      iframe.contentDocument.write(`<html><body><a href="${url}"><img src="${image}"></a></body></html>`);
    }, [url, image]);
  }

  test('@skip Ad creative is loaded once bids is no longer null', async ({ page }) => {
    await injectIFrame(page, 'https://www.example.com', 'https://picsum.photos/300/250');
    await new Promise(res => setTimeout(res, 5000));
    const img = await page.evaluate(
      () => document.getElementById('banner1').shadowRoot.children[0].src
    );
    expect(img.split('/').pop()).toBe('250');
  });

  test('@skip A new ad creative is loaded after passing visibility check', async ({ page }) => {
    await injectIFrame(page, 'https://www.example.com', 'https://picsum.photos/300/250');
    await new Promise(res => setTimeout(res, 15000));
    await page.evaluate(() => document.querySelector('#injected').remove());
    await injectIFrame(page, 'https://www.example.com', 'https://picsum.photos/300/300');
    await new Promise(res => setTimeout(res, 5000));
    const img = await page.evaluate(
      () => document.getElementById('banner1').shadowRoot.children[0].src
    );
    expect(img.split('/').pop()).toBe('300');
  });
});