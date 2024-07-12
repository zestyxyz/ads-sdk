export const EXAMPLE_URL = 'https://example.com';
export const EXAMPLE_IMAGE = 'https://picsum.photos/300/250';
export const EXAMPLE_IMAGE2 = 'https://picsum.photos/300/300';
export const PREBID_LOAD_TEST_WAIT_INTERVAL = 5000;
export const PREBID_REFRESH_TEST_WAIT_INTERVAL = 9000;

export async function injectIFrame(page, url, image) {
  await page.waitForFunction(() => document.querySelector('#zesty-div-medium-rectangle') != null);
  await page.evaluate(([url, image]) => {
    const iframe = document.createElement('iframe');
    iframe.id = 'injected';
    document.querySelector('#zesty-div-medium-rectangle').appendChild(iframe)
    iframe.contentDocument.write(`<html><body><a href="${url}"><img src="${image}"></a></body></html>`);
  }, [url, image]);
}
