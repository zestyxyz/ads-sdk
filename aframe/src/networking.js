import {log} from './logger';
import uuidv4 from 'uuid/v4';

// Modify to test a local server
// const API_BASE = 'http://localhost:3000/1.0';

// TODO: Need to change the API base The Graph to fetch correct ad
const API_BASE = null;
const AD_ENDPOINT = API_BASE + '/ad';

// TODO: Metrics should go to something like Textile
const METRICS_ENDPOINT = null;

const sessionId = uuidv4();

const fetchAd = async (auId) => {
  log(`Ad unit ID: ${auId}`);

  return fetch(`${AD_ENDPOINT}?au_id=${auId}`, {
    method: 'GET',
  })
    .then((res) => {
      return res.ok ? res.text() : null;
    })
    .then((text) => {
      return text ? JSON.parse(text) : null;
    });
};

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
