import { expect, test, describe, jest, beforeAll } from '@jest/globals';

jest.setTimeout(10000);

describe('Initial load', () => {
    test('The correct test page is currently loaded', async () => {
        await page.goto('http://localhost:8080/tests/wonderland/deploy');
        await expect(page.title()).resolves.toBe('Wonderland Test');
    });
    /*
    test('All 9 banners are currently loaded', async () => {
        await page.waitForTimeout(6000);
        const bannerCount = await page.evaluate(() => window.testBanners.length);
        expect(bannerCount).toBe(9);
    });*/
})
