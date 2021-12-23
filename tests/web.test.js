import { expect, test, describe, jest, beforeAll } from '@jest/globals';

jest.setTimeout(10000);

describe('Initial load', () => {
  test('The correct test page is currently loaded', async () => {
    await page.goto('http://localhost:8080/tests/web/');
    await expect(page.title()).resolves.toBe('Web Test');
  });

  test('All 9 banners are currently loaded', async () => {
    await page.waitForTimeout(3000);
    await Promise.all([
      page.waitForSelector('#banner1'),
      page.waitForSelector('#banner2'),
      page.waitForSelector('#banner3'),
      page.waitForSelector('#banner4'),
      page.waitForSelector('#banner5'),
      page.waitForSelector('#banner6'),
      page.waitForSelector('#banner7'),
      page.waitForSelector('#banner8'),
      page.waitForSelector('#banner9'),
    ]);
    const bannerCount = await page.evaluate(
      () => document.getElementsByTagName('zesty-web').length
    );
    expect(bannerCount).toBe(9);
  });
});

describe('Standard styles', () => {
  test('The tall standard banner is present', async () => {
    await page.waitForTimeout(1000);
    const banner1 = await page.evaluate(
      () => document.getElementById('banner1').shadowRoot.children[0].src
    );
    expect(banner1.split('/').pop()).toBe('zesty-banner-tall.png');
  });

  test('The wide standard banner is present', async () => {
    const banner2 = await page.evaluate(
      () => document.getElementById('banner2').shadowRoot.children[0].src
    );
    expect(banner2.split('/').pop()).toBe('zesty-banner-wide.png');
  });

  test('The square standard banner is present', async () => {
    const banner3 = await page.evaluate(
      () => document.getElementById('banner3').shadowRoot.children[0].src
    );
    expect(banner3.split('/').pop()).toBe('zesty-banner-square.png');
  });
});

describe('Minimal styles', () => {
  test('The tall standard banner is present', async () => {
    const banner4 = await page.evaluate(
      () => document.getElementById('banner4').shadowRoot.children[0].src
    );
    expect(banner4.split('/').pop()).toBe('zesty-banner-tall-minimal.png');
  });

  test('The wide standard banner is present', async () => {
    const banner5 = await page.evaluate(
      () => document.getElementById('banner5').shadowRoot.children[0].src
    );
    expect(banner5.split('/').pop()).toBe('zesty-banner-wide-minimal.png');
  });

  test('The square standard banner is present', async () => {
    const banner6 = await page.evaluate(
      () => document.getElementById('banner6').shadowRoot.children[0].src
    );
    expect(banner6.split('/').pop()).toBe('zesty-banner-square-minimal.png');
  });
});

describe('Transparent styles', () => {
  test('The tall transparent banner is present', async () => {
    const banner7 = await page.evaluate(
      () => document.getElementById('banner7').shadowRoot.children[0].src
    );
    expect(banner7.split('/').pop()).toBe('zesty-banner-tall-transparent.png');
  });

  test('The wide transparent banner is present', async () => {
    const banner8 = await page.evaluate(
      () => document.getElementById('banner8').shadowRoot.children[0].src
    );
    expect(banner8.split('/').pop()).toBe('zesty-banner-wide-transparent.png');
  });

  test('The square transparent banner is present', async () => {
    const banner9 = await page.evaluate(
      () => document.getElementById('banner9').shadowRoot.children[0].src
    );
    expect(banner9.split('/').pop()).toBe('zesty-banner-square-transparent.png');
  });
});

describe('Navigation', () => {
  test('Clicking the banner navigates to a new page', async () => {
    const pageTarget = page.target();
    await page.evaluate(() => document.getElementById('banner1').shadowRoot.children[0].click());
    const newTarget = await browser.waitForTarget((target) => target.opener() === pageTarget);
    const newPage = await newTarget.page();
    await expect(newPage.title()).resolves.not.toBe('Web Test');
  });
});
