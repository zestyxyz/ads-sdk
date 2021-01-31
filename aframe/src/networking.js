import {log} from './logger';
import axios from 'axios';
import uuidv4 from 'uuid/v4';

// Modify to test a local server
const API_BASE = 'http://localhost:2354';
const METRICS_ENDPOINT = API_BASE + '/api/v1/metrics'

// TODO: Need to change the API base The Graph to fetch correct ad
const AD_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/zestymarket/zesty-market-rinkeby'

const sessionId = uuidv4();

const fetchNFT = async (tokenGroup, publisher) => {
  const currentTime = Math.floor(Date.now() / 1000);
  return axios.post(AD_ENDPOINT, {
    query: `
      query {
        adDatas (
          first: 1
          where: {
            publisher: "${publisher}"
            tokenGroup: ${tokenGroup}
            timeStart_gte: ${currentTime}
          } 
        ) {
          id
          tokenGroup
          publisher
          advertiser
          timeCreated
          timeStart
          timeEnd
          location
          uri
          timeModified
        }
      }
    `
  })
  .then((res) => {
    return res.status == 200 ? res.data : null
  })
};

const fetchActiveAd = async (uri) => {
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
  const currentMs = Date.now();

  fetch(METRICS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      _id: uuidv4(),
      // request_created_at_ms: currentMs,
      publisher,
      tokenGroup,
      uri,
      image,
      cta,
      event,
      durationInMs,
      sessionId,
      timestampeInMs: currentMs,
      sdkVersion: 1,
      sdkType: 'aframe',
    }),
  });
};

export { fetchNFT, fetchActiveAd, sendMetric };
