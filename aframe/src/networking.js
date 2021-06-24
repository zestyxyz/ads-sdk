import {log} from './logger';
import axios from 'axios';
import uuidv4 from 'uuid/v4';
import { stringify } from 'uuid';

// Modify to test a local server
// const API_BASE = 'http://localhost:2354';
const API_BASE = 'https://node-1.zesty.market'
const METRICS_ENDPOINT = API_BASE + '/api/v1/metrics'

const AD_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/zestymarket/zesty-market-graph-rinkeby'

const sessionId = uuidv4();

const DEFAULT_AD_DATAS = {
  "uri": undefined,
}
const DEFAULT_AD_URI_CONTENT = {
  "name": "Default Ad",
  "description": "This is the default ad that would be displayed ipsum",
  "image": "https://ipfs.fleek.co/ipfs/QmWBNfP8roDrwz3XQo4qpu9fMxvUSTn8LB7d4JK7ybrfZ2/assets/zesty-ad-aframe.png",
  "cta": "https://www.zesty.market/"
}

const fetchNFT = async (adSpace, creator) => {
  const currentTime = Math.floor(Date.now() / 1000);
  return axios.post(AD_ENDPOINT, {
    query: `
      query {
        tokenDatas (
          where: {
            id: "${adSpace}"
            creator: "${creator}"
          }
        )
        { 
          sellerNFTSetting {
            sellerAuctions (
              first: 1
              where: {
                contractTimeStart_lte: ${currentTime}
                contractTimeEnd_gte: ${currentTime}
              }
            ) {
              id
              buyerCampaigns {
                id
                uri
              }
            }
          }
          id
        }
      }
    `
  })
  .then((res) => {
    if (res.status != 200) {
      return DEFAULT_AD_DATAS 
    }
    let data = res.data.data
    return data.tokenDatas[0].sellerNFTSetting.sellerAuctions[0].buyerCampaigns[0]
  })
  .catch((err) => {
    console.log(err);
    return DEFAULT_AD_DATAS;
  })
};

const fetchActiveAd = async (uri) => {
  if (!uri) {
    return { uri: 'DEFAULT_URI', data: DEFAULT_AD_URI_CONTENT }
  }

  return axios.get(`https://ipfs.io/ipfs/${uri}`)
  .then((res) => {
    return res.status == 200 ? { uri: uri, data: res.data } : null
  })
}

const sendMetric = (
  creator,
  adSpace,
  uri,
  image,
  cta,
  event,
  durationInMs,
  ) => {
  const currentMs = Math.floor(Date.now());
  const config = {
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
    }
  }
  return axios.post(METRICS_ENDPOINT, {
    _id: uuidv4(),
    creator: creator,
    adSpace: adSpace,
    uri: uri,
    image: image,
    cta: cta,
    event: event,
    durationInMs: durationInMs,
    sessionId: sessionId,
    timestampInMs: currentMs,
    sdkVersion: 1,
    sdkType: 'aframe',
  }, config)
};

export { fetchNFT, fetchActiveAd, sendMetric };
