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
 * Retrieves a random IPFS gateway to alleviate rate-throttling from using only a single gateway.
 * @returns A random public IPFS gateway
 */
const getIPFSGateway = () => {
  const gateways = [
    'https://gateway.pinata.cloud',
    'https://cloudflare-ipfs.com',
    'https://ipfs.fleek.co',
    'https://dweb.link'
  ];
  const rand = Math.floor(Math.random() * (gateways.length));
  return gateways[rand];
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
      if (!window.confirm("This link leads to an app in the Oculus Store.\n Proceed?"))
        return
    }
  }
  window.open(url, '_blank');
}

export { parseProtocol, getIPFSGateway, isOculusQuest, openURL };