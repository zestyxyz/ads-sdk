import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:8080/tests/babylonjs/');
});

test.describe('Initial load', () => {
  test('The correct test page is currently loaded', async ({ page }) => {
    await expect(page).toHaveTitle('Babylon.js Test');
  });

  test('All 3 banners are currently loaded', async ({ page }) => {
    const meshesLength = await page.evaluate(() => window.scene.meshes.length);
    expect(meshesLength).toBe(7); // 4 XR setup-related meshes, 3 banners
  });
});

test.describe('Default banners', () => {
  test('The medium-rectangle banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.scene.meshes[4].material != null);
    const banner1 = await page.evaluate(
      () => window.scene.meshes[4].material.diffuseTexture.name
    );
    expect(banner1.split('/').pop()).toBe('zesty-default-medium-rectangle.png');
  });

  test('The billboard banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.scene.meshes[5].material != null);
    const banner2 = await page.evaluate(
      () => window.scene.meshes[5].material.diffuseTexture.name
    );
    expect(banner2.split('/').pop()).toBe('zesty-default-billboard.png');
  });

  test('The mobile-phone-interstitial banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.scene.meshes[6].material != null);
    const banner3 = await page.evaluate(
      () => window.scene.meshes[6].material.diffuseTexture.name
    );
    expect(banner3.split('/').pop()).toBe('zesty-default-mobile-phone-interstitial.png');
  });
});

test.describe('Navigation', () => {
  test('Clicking the banner navigates to a new page', async ({ page, context }) => {
    await page.waitForFunction(() => window.scene.meshes[6].actionManager != null);
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.evaluate(() => window.scene.meshes[6].actionManager.actions[0].func())
    ])
    await newPage.waitForLoadState();
    const title = await newPage.title();
    expect(title).not.toBe('Babylon.js Test');
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
    await injectIFrame(page, 'https://www.example.com', 'https://picsum.photos/300/250');
    await new Promise(res => setTimeout(res, 5000));
    const img = await page.evaluate(
      () => window.scene.meshes[4].material.diffuseTexture.url
    );
    expect(img.split('/').pop()).toBe('250');
  });

  test('A new ad creative is loaded after passing visibility check', async ({ page }) => {
    await injectIFrame(page, 'https://www.example.com', 'https://picsum.photos/300/250');
    await new Promise(res => setTimeout(res, 8000));
    await page.evaluate(() => document.querySelector('#injected').remove());
    await injectIFrame(page, 'https://www.example.com', 'https://picsum.photos/300/300');
    await new Promise(res => setTimeout(res, 8000));
    const img = await page.evaluate(
      () => window.scene.meshes[4].material.diffuseTexture.url
    );
    expect(img.split('/').pop()).toBe('300');
  });
});