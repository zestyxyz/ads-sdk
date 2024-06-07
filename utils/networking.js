import axios from 'axios';
import { formats } from '../utils/formats.js';
import { checkUserPlatform } from '../utils/helpers.js';
//import { v4 as uuidv4 } from 'uuid'

const BEACON_API_BASE = 'https://beacon.zesty.market'
const BEACON_GRAPHQL_URI = 'https://beacon2.zesty.market/zgraphql'

const DB_ENDPOINT = 'https://api.zesty.market/api';
// TODO: Determine best way to enable switching to staging
// const STAGING_DB_ENDPOINT = 'https://api-staging.zesty.market/api';

//const sessionId = uuidv4();

// Prebid variables
const AD_REFRESH_INTERVAL = 15000;
let prebidInit = false;
let interval = null;
const retryCount = 5;
/** @type {HTMLIFrameElement} */
let iframe = null;
let ready = false;
let bids = null;
let heartbeatPending = false;
const currentTries = {} // Maps retries to specific ad unit id

const initPrebid = (adUnitId, format) => {
  // Load zesty prebid iframe
  iframe = document.createElement('iframe');
  iframe.src = `https://www.zesty.xyz/prebid/?size=${format}&source=${Math.round(Math.random())}&ad_unit_id=${adUnitId}&utm_source=${adUnitId}`;
  iframe.width = '1';
  iframe.height = '1';
  iframe.style.position = 'fixed';
  iframe.style.border = 'none';
  iframe.style.zIndex = '-2';
  document.body.prepend(iframe);
  iframe.onload = () => {
    iframe.contentWindow.postMessage({ type: 'readycheck' }, '*');
  }
  window.addEventListener('message', ({ data }) => {
    switch (data.type) {
      case 'readystatus':
        ready = data.content;
        break;
      case 'bids':
        bids = data.content;
        break;
      case 'heartbeat':
        heartbeatPending = false;
        break;
    }
  });

  // Load gifler script in case gif creative is served
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/gifler@0.1.0/gifler.min.js';
  document.head.appendChild(script);

  // Send a heartbeat message to the prebid page to check that is hasn't been killed by Chrome
  // for intensive resource usage by ad. If we don't get a heartbeat response back in 1 second,
  // the page is dead and we need to reload it.
  setInterval(async () => {
    iframe.contentWindow.postMessage({ type: 'heartbeat' }, '*');
    heartbeatPending = true;
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (heartbeatPending) {
      // window.location.reload() doesn't work for cross-origin frames, but resetting src works
      iframe.src += '';
    }
  }, 5000);

  prebidInit = true;
}

const unitOverrides = [
  { id: '4902864a-5531-496b-8d4d-ec7b9849e8e1', format: 'medium-rectangle', oldFormat: 'tall', absoluteWidth: 0.75, absoluteHeight: .625 },
];

const getOverrideUnitInfo = (adUnitId) => {
  return unitOverrides.find(unit => unit.id === adUnitId) || {};
}

const getDefaultBanner = (format, style, shouldOverride, overrideFormat) => {
  return { Ads: [{ asset_url: formats[shouldOverride ? overrideFormat : format].style[style], cta_url: 'https://www.zesty.xyz' }], CampaignId: 'DefaultCampaign' }
}

const fetchCampaignAd = async (adUnitId, format = 'tall', style = 'standard') => {
  if (['tall', 'wide', 'square'].includes(format)) {
    console.warn(`The old Zesty banner formats (tall, wide, and square) are being deprecated and will be removed in a future version. Please update to one of the new IAB formats (mobile-phone-interstitial, billboard, and medium-rectangle).`);
  }

  let overrideEntry = getOverrideUnitInfo(adUnitId);
  let shouldOverride = overrideEntry?.oldFormat && format == overrideEntry.oldFormat;

  if (!adUnitId) {
    return new Promise(res => res(getDefaultBanner(format, style, shouldOverride, overrideEntry.format)));
  }

  if (!prebidInit) {
    const finalFormat = shouldOverride ? overrideEntry.format : format;
    initPrebid(adUnitId, finalFormat, style);
    currentTries[adUnitId] = 0;
  } else {
    bids = null;
    currentTries[adUnitId] = 0;
    iframe.contentWindow.postMessage({ type: 'refresh' }, '*');
  }

  return new Promise((res, rej) => {
    async function getBanner() {
      if (bids && bids.length > 0) {
        // Clear the interval and grab the image+url from the prebid ad
        const { asset_url, cta_url } = JSON.parse(bids);
        if (asset_url.startsWith('canvas://')) {
          const canvasIframe = document.createElement('iframe');
          canvasIframe.id = "zesty-canvas-iframe";
          document.body.appendChild(canvasIframe);
          canvasIframe.contentDocument.open();
          canvasIframe.contentDocument.write(asset_url.split('canvas://')[1]);
          canvasIframe.contentDocument.close();
        }
        res({ Ads: [{ asset_url, cta_url }], CampaignId: 'Prebid' });
      } else {
        // Wait to see if we get any winning bids. If we hit max retry count, fallback to Zesty ad server
        currentTries[adUnitId]++;
        if (currentTries[adUnitId] == retryCount) {
          try {
            const url = encodeURI(window.top.location.href).replace(/\/$/, ''); // If URL ends with a slash, remove it
            const res = await axios.get(`${DB_ENDPOINT}/ad?ad_unit_id=${adUnitId}&url=${url}`);
            if (res.data) {
              res(res.data);
            } else {
              // No active campaign, just display default banner
              res(getDefaultBanner(format, style, shouldOverride, overrideEntry.format));
            }
            currentTries[adUnitId] = 0;
          } catch {
            console.warn('Could not retrieve an active campaign banner. Retrieving default banner.')
            res(getDefaultBanner(format, style, shouldOverride, overrideEntry.format));
            currentTries[adUnitId] = 0;
          }
        } else {
          setTimeout(getBanner, 1000);
        }
      }
    }
    getBanner();
  });
}

/**
 * Increment the on-load event count for the space
 * @param {string} spaceId The space ID
 * @returns A Promise representing the POST request
 */
const sendOnLoadMetric = async (spaceId, campaignId = null) => {
  const { platform, confidence } = await checkUserPlatform();

  try {
    await axios.post(
      BEACON_GRAPHQL_URI,
      { query: `mutation { increment(eventType: visits, spaceId: \"${spaceId}\", campaignId: \"${campaignId}\", platform: { name: ${platform}, confidence: ${confidence} }) { message } }` },
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    console.log("Failed to emit onload event", e.message)
  }
};

const sendOnClickMetric = async (spaceId, campaignId = null) => {
  const { platform, confidence } = await checkUserPlatform();

  try {
    await axios.post(
      BEACON_GRAPHQL_URI,
      { query: `mutation { increment(eventType: clicks, spaceId: \"${spaceId}\", campaignId: \"${campaignId}\", platform: { name: ${platform}, confidence: ${confidence} }) { message } }` },
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    console.log("Failed to emit onclick event", e.message)
  }
}

const analyticsSession = async (spaceId, campaignId) => {
  const { platform, confidence } = await checkUserPlatform();
  try {
    await axios.post(
      BEACON_GRAPHQL_URI,
      { query: `mutation { increment(eventType: session, spaceId: \"${spaceId}\", campaignId: \"${campaignId}\", platform: { name: ${platform}, confidence: ${confidence} }) { message } }` },
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    console.log(`Failed to emit session analytics`, e.message)
  }
}

export { fetchCampaignAd, sendOnLoadMetric, sendOnClickMetric, analyticsSession, getOverrideUnitInfo, AD_REFRESH_INTERVAL };
