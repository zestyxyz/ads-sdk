import {log} from './logger';
import axios from 'axios';
import uuidv4 from 'uuid/v4';
import { stringify } from 'uuid';

// Modify to test a local server
//const API_BASE = 'http://localhost:2354';
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

const fetchNFT = async (tokenGroup, creator) => {
  const currentTime = Math.floor(Date.now() / 1000);
  console.log(creator);
  return axios.post(AD_ENDPOINT, {
    query: `
      query {
        tokenDatas (
          where: {
            creator: "${creator}"
          } 
        ) {
          id
          creator
          timeCreated
          uri
        }
      }
    `
  })
  .then((res) => {
    if (res.data.data.tokenDatas && res.data.data.tokenDatas.length > 0) {
      return res.status == 200 ? res.data.data.tokenDatas[0] : null
    }

    return DEFAULT_AD_DATAS;
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
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
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
