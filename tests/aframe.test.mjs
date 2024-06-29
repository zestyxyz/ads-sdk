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

  test('Ad creative is loaded once bids is no longer null', async ({ page }) => {
    const banner = await page.locator('#banner1 > a-plane');
    await injectIFrame(page, 'https://www.example.com', 'https://picsum.photos/300/250');
    await new Promise(res => setTimeout(res, 5000));
    const img = await banner.evaluate(srcEvaluate);
    expect(img.split('/').pop()).toBe('250');
  });

  test('A new ad creative is loaded after passing visibility check', async ({ page }) => {
    const banner = await page.locator('#banner1 > a-plane');
    await injectIFrame(page, 'https://www.example.com', 'https://picsum.photos/300/250');
    await new Promise(res => setTimeout(res, 15000));
    await page.evaluate(() => document.querySelector('#injected').remove());
    await injectIFrame(page, 'https://www.example.com', 'https://picsum.photos/300/300');
    await new Promise(res => setTimeout(res, 5000));
    const img = await banner.evaluate(srcEvaluate);
    expect(img.split('/').pop()).toBe('300');
  });
});