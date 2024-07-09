const EXAMPLE_URL = 'https://example.com';
const EXAMPLE_IMAGE = 'https://picsum.photos/300/250';
const EXAMPLE_IMAGE2 = 'https://picsum.photos/300/300';
const PREBID_LOAD_TEST_WAIT_INTERVAL = 5000;
const PREBID_REFRESH_TEST_WAIT_INTERVAL = 10000;

async function injectIFrame(page, url, image) {
  await page.waitForFunction(() => document.querySelector('#zesty-div-medium-rectangle') != null);
  await page.evaluate(([url, image]) => {
    const iframe = document.createElement('iframe');
    iframe.id = 'injected';
    document.querySelector('#zesty-div-medium-rectangle').appendChild(iframe)
    iframe.contentDocument.write(`<html><body><a href="${url}"><img src="${image}"></a></body></html>`);
  }, [url, image]);
}

export {
  injectIFrame,
  EXAMPLE_URL,
  EXAMPLE_IMAGE,
  EXAMPLE_IMAGE2,
  PREBID_LOAD_TEST_WAIT_INTERVAL,
  PREBID_REFRESH_TEST_WAIT_INTERVAL
}