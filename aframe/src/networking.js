import {log} from './logger';
import axios from 'axios';
import uuidv4 from 'uuid/v4';

// Modify to test a local server
// const API_BASE = 'http://localhost:2354';
const API_BASE = 'https://node-1.zesty.market'
const METRICS_ENDPOINT = API_BASE + '/api/v1/metrics'

// TODO: Need to change the API base The Graph to fetch correct ad
const AD_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/zestymarket/zesty-graph-rinkeby'

const sessionId = uuidv4();

const DEFAULT_AD_DATAS = {
  "uri": undefined,
}
const DEFAULT_AD_URI_CONTENT = {
  "name": "Default Ad",
  "description": "This is the default ad that would be displayed ipsum",
  "image": "https://assets.wonderleap.co/wonderleap-ad-2.png",
  "cta": "https://wonderleap.co/advertisers"
}

const fetchNFT = async (tokenGroup, publisher) => {
  const currentTime = Math.floor(Date.now() / 1000);
  return axios.post(AD_ENDPOINT, {
    query: `
      query {
        tokenDatas (
          first: 1
          where: {
            publisher: "${publisher}"
            tokenGroup: "${tokenGroup}"
            timeStart_lte: ${currentTime}
            timeEnd_gte: ${currentTime}
          } 
        ) {
          id
          tokenGroup
          publisher
          timeCreated
          timeStart
          timeEnd
          uri
          timestamp
        }
      }
    `
  })
  .then((res) => {
    if (!res.data.data.tokenDatas) {
      return DEFAULT_AD_DATAS
    }
    return res.status == 200 ? res.data.data.tokenDatas[0] : null
  })
};

const fetchActiveAd = async (uri) => {
  if (!uri) {
    return { uri: 'DEFAULT_URI', data: DEFAULT_AD_URI_CONTENT }
  }

  return axios.get(uri)
  .then((res) => {
    return res.status == 200 ? { uri: uri, data: res.data } : null
  })
}

const sendMetric = (
  publisher,
  tokenGroup,
  uri,
  image,
  cta,
  event,
  durationInMs,
  ) => {
  const currentMs = Math.floor(Date.now());
  const config = {
    headers: {
      'Content-Type': 'text/plain'
    }
  }
  return axios.post(METRICS_ENDPOINT, {
    _id: uuidv4(),
    publisher: publisher,
    tokenGroup: tokenGroup,
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
