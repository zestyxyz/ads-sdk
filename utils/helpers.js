import axios from 'axios';

/**
 * Parses ipfs:// and ar:// links and IPFS hashes to URLs.
 * @param {String} uri The ipfs:// link or IPFS hash.
 * @returns A formatted URL to the IPFS resource.
 */
const parseProtocol = uri => {
  if (uri.substring(0,4) === "ipfs") {
    return `https://ipfs.zesty.market/ipfs/${uri.substring(7)}`;
  } else if (uri.substring(0,4) === "http") {
    return uri;
  } else if (uri.substring(0,5) === "https") {
    return uri;
  } else if (uri.substring(0,2) === "ar") {
    // get redirected url
    axios.get(`https://arweave.net/${uri.substring(5)}`)
      .then(res => {
        return res.url;
      })
      .catch(err => {
        console.error(err);
      })

  } else {
    // default to ipfs
    return `https://ipfs.zesty.market/ipfs/${uri}`;
  }
}

/**
 * Retrieves an IPFS gateway to alleviate rate-throttling from using only a single gateway.
 * Selection is weighted random based on average latency.
 * @returns A weighted random public IPFS gateway
 */
const getIPFSGateway = () => {
  const gateways = [
    { gateway: 'https://cloudflare-ipfs.com', weight: 35 },
    { gateway: 'https://gateway.pinata.cloud', weight: 35 },
    { gateway: 'https://dweb.link', weight: 30 }
  ];

  const weights = [];
  let i;
  for (i = 0; i < gateways.length; i++) {
    weights[i] = gateways[i].weight + (weights[i - 1] || 0);
  }
  const random = Math.random() * weights[weights.length - 1];
  for (i = 0; i < weights.length; i++) {
    if (weights[i] > random) break;
  }
  return gateways[i].gateway;
}

/**
 * Performs feature detection on XRHand and XRMediaBinding to determine if user is on Oculus Quest.
 * As of 10/15/21, only Oculus Browser has implemented the WebXR Hand Input Module and WebXR Layers API.
 * @returns true if XRHand and XRMediaBinding are not null, else false
 */
const isOculusQuest = () => {
  return (window.XRHand != null && window.XRMediaBinding != null)
}

const openURL = url => {
  if (!url) return;
  
  // Are we on a device that will deeplink?
  // This may need to be expanded in the future.
  if (isOculusQuest()) {
    if (url.includes('https://www.oculus.com/experiences/quest/')) {
        setTimeout(() => {
          window.open(url, '_blank');
        }, 1000);      
        return;
    }
  }
  window.open(url, '_blank');
}

const urlContainsUTMParams = (url) => {
  return url.indexOf('utm_source=') !== -1 || url.indexOf('utm_campaign=') !== -1 || url.indexOf('utm_channel=') !== -1;
}

const appendUTMParams = (url, campaignId) => {
  let new_url = new URL(url)
  new_url.searchParams.set('utm_source', 'ZestyMarket');
  new_url.searchParams.set('utm_campaign', 'ZestyCampaign');
  new_url.searchParams.set('utm_channel', `CampaignId_${campaignId}`);
  return new_url.href;
}

export { parseProtocol, getIPFSGateway, isOculusQuest, openURL, urlContainsUTMParams, appendUTMParams };