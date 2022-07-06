import axios from 'axios';
import { formats, defaultFormat, defaultStyle } from '../utils/formats.js';
import { parseProtocol, urlContainsUTMParams, appendUTMParams, checkUserPlatform } from '../utils/helpers.js';
//import { v4 as uuidv4 } from 'uuid'

const API_BASE = 'https://beacon.zesty.market'
const BEACON_GRAPHQL_URI = 'https://beacon2.zesty.market/zgraphql'

const ENDPOINTS = {
    "matic": 'https://api.thegraph.com/subgraphs/name/zestymarket/zesty-market-graph-matic',
    "polygon": 'https://api.thegraph.com/subgraphs/name/zestymarket/zesty-market-graph-matic',
    "rinkeby": 'https://api.thegraph.com/subgraphs/name/zestymarket/zesty-market-graph-rinkeby'
}

//const sessionId = uuidv4();

const DEFAULT_DATAS = {
  "uri": undefined,
}

const DEFAULT_URI_CONTENT = {
  "name": "Default banner",
  "description": "This is the default banner that would be displayed ipsum",
  "image": "https://ipfs.zesty.market/ipfs/QmWBNfP8roDrwz3XQo4qpu9fMxvUSTn8LB7d4JK7ybrfZ2/assets/zesty-ad-square.png",
  "url": "https://www.zesty.market"
}

/**
 * Queries The Graph to retrieve NFT information for the space.
 * @param {string} space The space ID
 * @param {string} network The network to post metrics to
 * @returns An object with the requested space information, or a default if it cannot be retrieved.
 */
const fetchNFT = async (space, network = 'polygon') => {
  const currentTime = Math.floor(Date.now() / 1000);
  return axios.post(ENDPOINTS[network], {
    query: `
      query {
        tokenDatas (
          where: {
            id: "${space}"
          }
        )
        { 
          sellerNFTSetting {
            sellerAuctions (
              first: 5
              where: {
                contractTimeStart_lte: ${currentTime}
                contractTimeEnd_gte: ${currentTime}
                cancelled: false
              }
            ) {
              id
              buyerCampaigns {
                id
                uri
              }
              buyerCampaignsApproved
              buyerCampaignsIdList
            }
          }
          id
        }
      }
    `
  })
  .then((res) => {
    return parseGraphResponse(res);
  })
  .catch((err) => {
    console.log(err);
    return DEFAULT_DATAS;
  })
};

/**
 * Parses the response from The Graph to find the latest auction campaign.
 * @param {Object} res The response object from The Graph.
 * @returns An object containing either the latest auction campaign or default data.
 */
const parseGraphResponse = res => {
  if (res.status != 200) {
    return DEFAULT_DATAS 
  }
  let sellerAuctions = res.data.data.tokenDatas[0]?.sellerNFTSetting?.sellerAuctions;
  let latestAuction = null;
  sellerAuctions?.[0]?.buyerCampaignsApproved?.find((campaign, i) => {
    if (campaign) {
      const campaignId = sellerAuctions[0].buyerCampaignsIdList[i]; // Graph stores as string, coerce to int
      latestAuction = sellerAuctions[0].buyerCampaigns.find(campaign => campaign.id === campaignId)
    }
  });
  
  if (latestAuction == null) {
    return DEFAULT_DATAS 
  }

  return latestAuction;
}

/**
 * Pulls data from IPFS for the banner content.
 * @param {string} uri The IPFS URI containing the banner content.
 * @param {string} format The default banner image format to use if there is no active banner.
 * @param {string} style The default banner image style to use if there is no active banner.
 * @param {string} formatsOverride Object to override the default format object.
 * @returns An object with the requested banner content, or a default if it cannot be retrieved.
 */
const fetchActiveBanner = async (uri, format, style, space, formatsOverride) => {
  if (!uri) {
    let bannerObject = { uri: 'DEFAULT_URI', data: DEFAULT_URI_CONTENT };
    let newFormat = format || defaultFormat;
    let newStyle = style || defaultStyle;
    let usedFormats = formatsOverride || formats;
    bannerObject.data.image = usedFormats[newFormat].style[newStyle];
    return bannerObject;
  }

  return axios.get(parseProtocol(uri))
  .then((res) => {
    if(!urlContainsUTMParams(res.data.url)) {
      res.data.url = appendUTMParams(res.data.url, space);
    }
    return res.status == 200 ? { uri: uri, data: res.data } : null
  })
}

/**
 * Increment the on-load event count for the space
 * @param {string} spaceId The space ID
 * @returns A Promise representing the POST request
 */
const sendOnLoadMetric = async (spaceId) => {
  const { platform, confidence } = await checkUserPlatform();
  
  try {
    const spaceCounterEndpoint = API_BASE + `/api/v1/space/${spaceId}`
    await axios.put(spaceCounterEndpoint)

    await axios.post(
      BEACON_GRAPHQL_URI,
      { query: `mutation { increment(eventType: visits, spaceId: "${spaceId}", platform: { name: ${platform}, confidence: ${confidence} }) { message } }` },
      { headers: { 'Content-Type': 'application/json' }}
    )
  } catch (e) {
    console.log("Failed to emit onload event", e.message)
  }
};

const sendOnClickMetric = async (spaceId) => {
  const { platform, confidence } = await checkUserPlatform();
  const platformObj = { name: platform, confidence: confidence };
  
  try {
    const spaceClickEndpoint = API_BASE + `/api/v1/space/click/${spaceId}`
    await axios.put(spaceClickEndpoint)

    await axios.post(
      BEACON_GRAPHQL_URI,
      { query: `mutation { increment(eventType: clicks, spaceId: "${spaceId}", platform: ${platformObj}) { message } }` },
      { headers: { 'Content-Type': 'application/json' }}
    )
  } catch (e) {
    console.log("Failed to emit onclick event", e.message)
  }
}

export { fetchNFT, parseGraphResponse, fetchActiveBanner, sendOnLoadMetric, sendOnClickMetric };
