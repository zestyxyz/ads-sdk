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

export async function checkZestyDiv(page, format) {
  let div;
  if (!format) {
    div = await page.frameLocator('#unknown').locator('#zesty-div');
  } else {
    div = await page.frameLocator(`#${format}`).locator(`#zesty-div-${format}`);
  }

  const { width, height } = await div.boundingBox();
  switch (format) {
    case 'medium-rectangle':
      if (width == 300 && height == 250) return true;
    case 'billboard':
      if (width == 728 && height == 90) return true;
    case 'mobile-phone-interstitial':
      if (width == 1080 && height == 1920) return true;
    default:
      if (width == 300 && height == 250) return true;
  }
  return false;
}