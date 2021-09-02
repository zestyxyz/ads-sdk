import { expect, test, describe, jest, beforeAll } from '@jest/globals';

jest.setTimeout(10000);

const getImageSrc = async (banner) => {
    return await (await (await (await (await (await banner.getProperty('components'))
        .getProperty('material'))
        .getProperty('data'))
        .getProperty('src'))
        .getProperty('currentSrc'))
        .jsonValue();
}

describe('Initial load', () => {        
    test('The correct test page is currently loaded', async () => {
        await page.goto('http://localhost:8080/aframe/');
        await expect(page.title()).resolves.toBe('A-Frame Test');
    });
    
    test('The tall banner is present', async () => {
        const banner = await page.evaluate(() => document.querySelector('#banner1').getAttribute('zesty-banner'));
        expect(banner).not.toBeFalsy();
    });

    test('The wide banner is present', async () => {
        const banner = await page.evaluate(() => document.querySelector('#banner2').getAttribute('zesty-banner'));
        expect(banner).not.toBeFalsy();
    });
    
    test('The square banner is present', async () => {
        const banner = await page.evaluate(() => document.querySelector('#banner3').getAttribute('zesty-banner'));
        expect(banner).not.toBeFalsy();
    });
});

describe('Standard styles', () => {
    test('The tall standard banner is displaying the correct default image', async () => {    
        const banner = await page.waitForSelector('#banner1 > a-plane');
        const img = await getImageSrc(banner);    
        expect(img).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-tall.png');
    });
    
    test('The wide standard banner is displaying the correct default image', async () => {    
        const banner = await page.waitForSelector('#banner2 > a-plane');
        const img = await getImageSrc(banner);
        expect(img).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-wide.png');
    });
    
    
    test('The square standard banner is displaying the correct default image', async () => {    
        const banner = await page.waitForSelector('#banner3 > a-plane');
        const img = await getImageSrc(banner);
        expect(img).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-square.png');
    });
});

describe('Minimal styles', () => {
    test('The tall minimal banner is displaying the correct default image', async () => {    
        const banner = await page.waitForSelector('#banner4 > a-plane');
        const img = await getImageSrc(banner);    
        expect(img).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-tall-minimal.png');
    });
    
    test('The wide minimal banner is displaying the correct default image', async () => {    
        const banner = await page.waitForSelector('#banner5 > a-plane');
        const img = await getImageSrc(banner);
        expect(img).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-wide-minimal.png');
    });
    
    
    test('The square minimal banner is displaying the correct default image', async () => {    
        const banner = await page.waitForSelector('#banner6 > a-plane');
        const img = await getImageSrc(banner);
        expect(img).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-square-minimal.png');
    });
});

describe('Transparent styles', () => {
    test('The tall transparent banner is displaying the correct default image', async () => {    
        const banner = await page.waitForSelector('#banner7 > a-plane');
        const img = await getImageSrc(banner);    
        expect(img).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-tall-transparent.png');
    });
    
    test('The wide transparent banner is displaying the correct default image', async () => {    
        const banner = await page.waitForSelector('#banner8 > a-plane');
        const img = await getImageSrc(banner);
        expect(img).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-wide-transparent.png');
    });
    
    
    test('The square transparent banner is displaying the correct default image', async () => {    
        const banner = await page.waitForSelector('#banner9 > a-plane');
        const img = await getImageSrc(banner);
        expect(img).toBe('https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-square-transparent.png');
    });
});
/*
describe('Navigation', () => {
    test('Clicking the banner navigates to a new page', async () => {
        const banner = await page.waitForSelector('#banner9 > a-plane');
        console.log(banner);
        await banner.click();
        await expect(page.title()).resolves.not.toBe('A-Frame Test');
    })
})*/