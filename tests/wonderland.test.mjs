import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:8080/tests/wonderland/deploy');
  await page.waitForFunction(() => window.testBanners != undefined);
});

test.describe('Initial load', () => {
  test('The correct test page is currently loaded', async ({ page }) => {
    await expect(page).toHaveTitle('Wonderland Test');
  });

  test('All 9 banners are currently loaded', async ({ page }) => {
    const bannerCount = await page.evaluate(() => window.testBanners.length);
    expect(bannerCount).toBe(9);
  });
});

test.describe('Standard styles', () => {
  test('The tall standard banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[0].banner != null);
    const banner1 = await page.evaluate(() => window.testBanners[0].banner.imageSrc);
    expect(banner1.split('/').pop()).toBe('QmSasURHs9AHTmJA7W98QsZ884zb6VVgFfF85Wf3HpNcBb');
  });

  test('The wide standard banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[1].banner != null);
    const banner2 = await page.evaluate(() => window.testBanners[1].banner.imageSrc);
    expect(banner2.split('/').pop()).toBe('QmeBbzTnaMqedDaBRuxtjJCJMBwtbWuuXVsNNAAV6LQopF');
  });

  test('The square standard banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[2].banner != null);
    const banner3 = await page.evaluate(() => window.testBanners[2].banner.imageSrc);
    expect(banner3.split('/').pop()).toBe('Qmbu9MAHHxB7JCTyyt291upMMMqZCjtoqbrvDMG56Lug3z');
  });
});

test.describe('Minimal styles', () => {
  test('The tall minimal banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[3].banner != null);
    const banner4 = await page.evaluate(() => window.testBanners[3].banner.imageSrc);
    expect(banner4.split('/').pop()).toBe('QmPCtWL6HhRJaeEPj3y26GSEofchLfWyX79kan2QZ66bbu');
  });

  test('The wide minimal banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[4].banner != null);
    const banner5 = await page.evaluate(() => window.testBanners[4].banner.imageSrc);
    expect(banner5.split('/').pop()).toBe('QmYwZ7BxeG1drdPcPo61vH4yLaMiBo5UypymfKC6T3kehV');
  });

  test('The square minimal banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[5].banner != null);
    const banner6 = await page.evaluate(() => window.testBanners[5].banner.imageSrc);
    expect(banner6.split('/').pop()).toBe('QmYWsEm5m2MbVRHk4G4gUfH3qyNSiraVm5BS4FUxjfp6KU');
  });
});

test.describe('Transparent styles', () => {
  test('The tall transparent banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[6].banner != null);
    const banner7 = await page.evaluate(() => window.testBanners[6].banner.imageSrc);
    expect(banner7.split('/').pop()).toBe('QmRiTKTFNDbe8tq7xXdWcyXqRAWsKKgbGdiz6wofrCceua');
  });

  test('The wide transparent banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[7].banner != null);
    const banner8 = await page.evaluate(() => window.testBanners[7].banner.imageSrc);
    expect(banner8.split('/').pop()).toBe('QmPHHXwUXHog4KtwYmPKU1bqCJ7MJ9mwPV799HaHE6MQS3');
  });

  test('The square transparent banner is present', async ({ page }) => {
    await page.waitForFunction(() => window.testBanners[8].banner != null);
    const banner9 = await page.evaluate(() => window.testBanners[8].banner.imageSrc);
    expect(banner9.split('/').pop()).toBe('QmQ3nGPFJKeTdhW3zSzgYDttARQDCbrqqh7aCSAs4Lc6pH');
  });
});

test.describe('Navigation', () => {
  test('Clicking the banner navigates to a new page', async ({ page, context }) => {
    await page.waitForFunction(() => window.testBanners[0].banner != null);
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.evaluate(() => window.testBanners[0].executeClick())
    ])
    await newPage.waitForLoadState();
    const title = await newPage.title();
    expect(title).not.toBe('Wonderland Test');
  });
});
