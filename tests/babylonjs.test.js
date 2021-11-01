import { expect, test, describe, jest } from '@jest/globals';

describe('Initial load', () => {
  test('The correct test page is currently loaded', async () => {
    await page.goto('http://localhost:8080/tests/babylonjs/');
    await expect(page.title()).resolves.toBe('Babylon.js Test');
  });

  test('All 9 banners are currently loaded', async () => {
    await page.waitForTimeout(3000);
    const meshesLength = await page.evaluate(() => window.scene.meshes.length);
    expect(meshesLength).toBe(13); // 4 XR setup-related meshes, 9 banners
  });
});

describe('Standard styles', () => {
  test('The tall standard banner is present', async () => {
    const banner1 = await page.evaluate(
      () => window.scene.meshes[4]._material._diffuseTexture.name
    );
    expect(banner1).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-tall.png');
  });

  test('The wide standard banner is present', async () => {
    const banner2 = await page.evaluate(
      () => window.scene.meshes[5]._material._diffuseTexture.name
    );
    expect(banner2).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-wide.png');
  });

  test('The square standard banner is present', async () => {
    const banner3 = await page.evaluate(
      () => window.scene.meshes[6]._material._diffuseTexture.name
    );
    expect(banner3).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-square.png');
  });
});

describe('Minimal styles', () => {
  test('The tall standard banner is present', async () => {
    const banner4 = await page.evaluate(
      () => window.scene.meshes[7]._material._diffuseTexture.name
    );
    expect(banner4).toBe(
      'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-tall-minimal.png'
    );
  });

  test('The wide standard banner is present', async () => {
    const banner5 = await page.evaluate(
      () => window.scene.meshes[8]._material._diffuseTexture.name
    );
    expect(banner5).toBe(
      'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-wide-minimal.png'
    );
  });

  test('The square standard banner is present', async () => {
    const banner6 = await page.evaluate(
      () => window.scene.meshes[9]._material._diffuseTexture.name
    );
    expect(banner6).toBe(
      'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-square-minimal.png'
    );
  });
});

describe('Transparent styles', () => {
  test('The tall transparent banner is present', async () => {
    const banner7 = await page.evaluate(
      () => window.scene.meshes[10]._material._diffuseTexture.name
    );
    expect(banner7).toBe(
      'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-tall-transparent.png'
    );
  });

  test('The wide transparent banner is present', async () => {
    const banner8 = await page.evaluate(
      () => window.scene.meshes[11]._material._diffuseTexture.name
    );
    expect(banner8).toBe(
      'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-wide-transparent.png'
    );
  });

  test('The square transparent banner is present', async () => {
    const banner9 = await page.evaluate(
      () => window.scene.meshes[12]._material._diffuseTexture.name
    );
    expect(banner9).toBe(
      'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-square-transparent.png'
    );
  });
});

describe('Navigation', () => {
  test('Clicking the banner navigates to a new page', async () => {
    const pageTarget = page.target();
    await page.evaluate(() => window.scene.meshes[12].actionManager.actions[0].func());
    const newTarget = await browser.waitForTarget((target) => target.opener() === pageTarget);
    const newPage = await newTarget.page();
    await expect(newPage.title()).resolves.not.toBe('Babylon.js Test');
  });
});
