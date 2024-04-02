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

const prebid = true;
let interval = null;
const retryCount = 4;
let currentTries = 0;

function renderAllAdUnits() {
  var winners = window.pbjs.getHighestCpmBids();
  for (var i = 0; i < winners.length; i++) {
    renderOne(winners[i]);
  }
}

function renderOne(winningBid) {
  if (winningBid && winningBid.adId) {
    var div = document.getElementById(winningBid.adUnitCode);
    if (div) {
      const iframe = document.createElement('iframe');
      div.appendChild(iframe);
      const iframeDoc = iframe.contentWindow.document;
      window.pbjs.renderAd(iframeDoc, winningBid.adId);
      iframe.style.display = 'none';
    }
  }
}

function getPrebidWinnerInfo() {
  const winner = window.pbjs.getAllWinningBids()[0];
  const regex = /(?:https:\/\/)[^\s"']+?(?=["']|\s)/g;
  const matches = winner.ad.match(regex);

  return { asset_url: matches[1], cta_url: matches[0] };
}

const initPrebid = (adUnitId) => {
  // Create prebid window objects
  window.pbjs = window.pbjs || {};
  window.pbjs.que = window.pbjs.que || [];

  // Construct an ad unit and respective div
  const adUnit = {
    code: adUnitId,
    mediaTypes: {
      banner: {
        sizes: [[300, 250]]
      }
    },
    bids: [
      {
        bidder: 'appnexus',
        params: {
          placementId: 13144370
        }
      }
    ]
  }
  const div = document.createElement('div');
  div.id = adUnit.code;
  document.body.appendChild(div);

  // Load our prebid script and add it to the page
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://cdn.zesty.xyz/sdk/zesty-prebid.js';
  document.head.appendChild(script);

  // Add our ad unit to the queue and request bids
  window.pbjs.que.push(function () {
    window.pbjs.addAdUnits([adUnit]);
  });

  window.pbjs.que.push(function () {
    window.pbjs.requestBids({
      timeout: 2000,
      bidsBackHandler: renderAllAdUnits
    });
  });
}

const fetchCampaignAd = async (adUnitId, format = 'tall', style = 'standard') => {
  if (prebid) {
    initPrebid(adUnitId, format, style);

    return new Promise((res, rej) => {
      interval = setInterval(() => {
        // This function is injected, so if it isn't present yet return
        if (!window.pbjs.getAllWinningBids) return;

        if (window.pbjs.getAllWinningBids().length > 0) {
          // Clear the interval and grab the image+url from the prebid ad
          clearInterval(interval);
          const { asset_url, cta_url } = getPrebidWinnerInfo();
          res({ Ads: [{ asset_url, cta_url }], CampaignId: 'TestCampaign' });
        } else {
          // Wait to see if we get any winning bids, otherwise send default Zetsy banner
          currentTries++;
          if (currentTries == retryCount) {
            clearInterval(interval);
            res({ Ads: [{ asset_url: formats[format].style[style], cta_url: 'https://www.zesty.xyz' }], CampaignId: 'TestCampaign' });
          }
        }
      }, 1000);
    });
  } else {
    try {
      const url = encodeURI(window.top.location.href).replace(/\/$/, ''); // If URL ends with a slash, remove it
      const res = await axios.get(`${DB_ENDPOINT}/ad?ad_unit_id=${adUnitId}&url=${url}`);
      if (res.data)
        return res.data;
      else {
        // No active campaign, just display default banner
        return { Ads: [{ asset_url: formats[format].style[style], cta_url: 'https://www.zesty.xyz' }], CampaignId: 'TestCampaign' };
      }
    } catch {
      console.warn('Could not retrieve an active campaign banner. Retrieving default banner.')
      return { Ads: [{ asset_url: formats[format].style[style], cta_url: 'https://www.zesty.xyz' }], CampaignId: 'TestCampaign' };
    }
  }
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

export { fetchCampaignAd, sendOnLoadMetric, sendOnClickMetric, analyticsSession };
