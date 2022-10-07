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
    expect(img.split('/').pop()).toBe('QmSasURHs9AHTmJA7W98QsZ884zb6VVgFfF85Wf3HpNcBb');
  });

  test('The wide standard banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner2 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('QmeBbzTnaMqedDaBRuxtjJCJMBwtbWuuXVsNNAAV6LQopF');
  });

  test('The square standard banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner3 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('Qmbu9MAHHxB7JCTyyt291upMMMqZCjtoqbrvDMG56Lug3z');
  });
});

test.describe('Minimal styles', () => {
  test('The tall minimal banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner4 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('QmPCtWL6HhRJaeEPj3y26GSEofchLfWyX79kan2QZ66bbu');
  });

  test('The wide minimal banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner5 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('QmYwZ7BxeG1drdPcPo61vH4yLaMiBo5UypymfKC6T3kehV');
  });

  test('The square minimal banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner6 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('QmYWsEm5m2MbVRHk4G4gUfH3qyNSiraVm5BS4FUxjfp6KU');
  });
});

test.describe('Transparent styles', () => {
  test('The tall transparent banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner7 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('QmRiTKTFNDbe8tq7xXdWcyXqRAWsKKgbGdiz6wofrCceua');
  });

  test('The wide transparent banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner8 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('QmPHHXwUXHog4KtwYmPKU1bqCJ7MJ9mwPV799HaHE6MQS3');
  });

  test('The square transparent banner is displaying the correct default image', async ({ page }) => {
    const banner = await page.locator('#banner9 > a-plane');
    const img = await banner.evaluate(node => node.components.material.data.src.currentSrc);
    expect(img.split('/').pop()).toBe('QmQ3nGPFJKeTdhW3zSzgYDttARQDCbrqqh7aCSAs4Lc6pH');
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
