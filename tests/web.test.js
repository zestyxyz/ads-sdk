import { expect, test, describe, jest, beforeAll } from '@jest/globals';

describe('Initial load', () => {        
    test('The correct test page is currently loaded', async () => {
        await page.goto('http://localhost:8080/tests/web/');
        await expect(page.title()).resolves.toBe('Web Test');
    });

    test.only('All 9 banners are currently loaded', async () => {
        //const bannerCount = 9;
        const bannerCount = await page.evaluate(() => document.getElementsByTagName('zesty-web').length);
        expect(bannerCount).toBe(9);
    });
});

describe('Standard styles', () => {
    test('The tall standard banner is present', async () => {
        const banner1 = await page.waitForSelector('#banner1');
        expect(banner1).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-tall.png');
    })

    test('The wide standard banner is present', async () => {
        const banner2 = await page.waitForSelector('#banner2');
        expect(banner2).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-wide.png');
    });
    
    test('The square standard banner is present', async () => {
        const banner3 = await await page.waitForSelector('#banner3');
        expect(banner3).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-square.png');
    });
});

describe('Minimal styles', () => {
    test('The tall standard banner is present', async () => {
        const banner4 = await page.waitForSelector('#banner4');
        expect(banner4).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-tall-minimal.png');
    })

    test('The wide standard banner is present', async () => {
        const banner5 = await page.waitForSelector('#banner5');
        expect(banner5).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-wide-minimal.png');
    });
    
    test('The square standard banner is present', async () => {
        const banner6 = await page.waitForSelector('#banner6');
        expect(banner6).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-square-minimal.png');
    });
});

describe('Transparent styles', () => {
    test('The tall transparent banner is present', async () => {
        const banner7 = await page.waitForSelector('#banner7');
        expect(banner7).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-tall-transparent.png');
    })

    test('The wide transparent banner is present', async () => {
        const banner8 = await page.waitForSelector('#banner8');
        expect(banner8).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-wide-transparent.png');
    });
    
    test('The square transparent banner is present', async () => {
        const banner9 = await page.waitForSelector('#banner9');
        expect(banner9).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-square-transparent.png');
    });
});

describe('Navigation', () => {
    test('Clicking the banner navigates to a new page', async () => {
        //const pageTarget = page.target();
        const banner = await page.waitForSelector('#banner1');
        banner.click();
        //banner.shadowRoot.children[0].click();
        //await page.evaluate(() => document.querySelector('#DEFAULT_URI').click());
        await page.waitForNavigation();
        //const newTarget = await browser.waitForTarget(target => target.opener() === pageTarget);
        const newPage = await newTarget.page();
        await expect(newPage.title()).resolves.not.toBe('Web Test');
    });
});
