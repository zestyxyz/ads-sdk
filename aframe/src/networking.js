import {log} from './logger';
import axios from 'axios';
import uuidv4 from 'uuid/v4';

// Modify to test a local server
// const API_BASE = 'http://localhost:3000/1.0';

// TODO: Need to change the API base The Graph to fetch correct ad
const AD_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/zestymarket/zesty-market-rinkeby'

// TODO: Metrics should go to something like Textile
const METRICS_ENDPOINT = null;

const sessionId = uuidv4();

const fetchAd = async (tokenGroup, publisher) => {
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
  .then((data) => {
    const uri = data.data.adDatas[0].uri
    
    // fetch ad asset data
    return axios.get(uri)
    .then((res) => {
      return res.status == 200 ? { uri: uri, data: res.data } : null
    })
  });
};

// TODO
const sendMetric = (event, duration, adId, auId) => {
  const currentMs = Date.now();

  const body = {
    event,
    duration,
    ad_id: adId,
    au_id: auId,
    datetime: new Date(currentMs),
    session_id: sessionId,
  };

  fetch(METRICS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request_id: uuidv4(),
      request_created_at_ms: currentMs,
      event: body.event,
      duration_ms: body.duration,
      ad_id: body.ad_id,
      au_id: body.au_id,
      session_id: body.session_id
    }),
  });
};

export { fetchAd, sendMetric };
