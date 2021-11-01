import { expect, test, describe, jest, beforeAll } from '@jest/globals';

jest.setTimeout(10000);

describe('Initial load', () => {
  test('The correct test page is currently loaded', async () => {
    await page.goto('http://localhost:8080/tests/threejs/');
    await expect(page.title()).resolves.toBe('Three.js Test');
  });

  test('All 9 banners are currently loaded', async () => {
    await page.waitForTimeout(3000);
    const bannerCount = await page.evaluate(() => window.scene.children.length);
    expect(bannerCount).toBe(9);
  });
});

describe('Standard styles', () => {
  test('The tall standard banner is present', async () => {
    const banner1 = await page.evaluate(() => window.scene.children[0].banner.src);
    expect(banner1).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-tall.png');
  });

  test('The wide standard banner is present', async () => {
    const banner2 = await page.evaluate(() => window.scene.children[1].banner.src);
    expect(banner2).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-wide.png');
  });

  test('The square standard banner is present', async () => {
    const banner3 = await page.evaluate(() => window.scene.children[2].banner.src);
    expect(banner3).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-square.png');
  });
});

describe('Minimal styles', () => {
  test('The tall standard banner is present', async () => {
    const banner4 = await page.evaluate(() => window.scene.children[3].banner.src);
    expect(banner4).toBe(
      'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-tall-minimal.png'
    );
  });

  test('The wide standard banner is present', async () => {
    const banner5 = await page.evaluate(() => window.scene.children[4].banner.src);
    expect(banner5).toBe(
      'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-wide-minimal.png'
    );
  });

  test('The square standard banner is present', async () => {
    const banner6 = await page.evaluate(() => window.scene.children[5].banner.src);
    expect(banner6).toBe(
      'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-square-minimal.png'
    );
  });
});

describe('Transparent styles', () => {
  test('The tall transparent banner is present', async () => {
    const banner7 = await page.evaluate(() => window.scene.children[6].banner.src);
    expect(banner7).toBe(
      'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-tall-transparent.png'
    );
  });

  test('The wide transparent banner is present', async () => {
    const banner8 = await page.evaluate(() => window.scene.children[7].banner.src);
    expect(banner8).toBe(
      'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-wide-transparent.png'
    );
  });

  test('The square transparent banner is present', async () => {
    const banner9 = await page.evaluate(() => window.scene.children[8].banner.src);
    expect(banner9).toBe(
      'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-square-transparent.png'
    );
  });
});

describe('Navigation', () => {
  test('Clicking the banner navigates to a new page', async () => {
    const pageTarget = page.target();
    await page.evaluate(() => window.scene.children[0].onClick());
    const newTarget = await browser.waitForTarget((target) => target.opener() === pageTarget);
    const newPage = await newTarget.page();
    await expect(newPage.title()).resolves.not.toBe('Three.js Test');
  });
});
