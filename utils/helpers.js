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
 * Performs feature detection and a UA check to determine if user is using Oculus Browser.
 * @returns an object indicating whether there is a match and the associated confidence level.
 */
const checkOculusBrowser = () => {
  // As of 5/26/22, only Oculus Browser has implemented the WebXR Hand Input Module and WebXR Layers API.
  const featureDetect = (window.XRHand != null && window.XRMediaBinding != null);
  const uaCheck = navigator.userAgent.includes('OculusBrowser');
  const confidence = featureDetect && uaCheck ? 'Full' : 
                     featureDetect || uaCheck ? 'Partial' : 
                     'None';
  return { match: confidence !== 'None', confidence: confidence }
}

/**
 * Performs feature detection and a UA check to determine if user is using Wolvic.
 * @returns an object indicating whether there is a match and the associated confidence level.
 */
const checkWolvicBrowser = () => {
  // While Wolvic is still shipping with a GeckoView backend, this feature detect should hold true.
  // Once versions with different backends start showing up in the wild, this will need revisiting.
  const featureDetect = (window.mozInnerScreenX != null && window.speechSynthesis == null);
  const uaCheck = navigator.userAgent.includes('Mobile VR') && !navigator.userAgent.includes('OculusBrowser');
  const confidence = featureDetect && uaCheck ? 'Full' : 
                     featureDetect || uaCheck ? 'Partial' : 
                     'None';
  return { match: confidence !== 'None', confidence: confidence }
}

/**
 * Performs feature detection and a UA check to determine if user is using Pico's browser.
 * @returns an object indicating whether there is a match and the associated confidence level.
 */
 const checkPicoBrowser = async () => {
  // Pico's internal browser is a Chromium fork and seems to expose some WebXR AR modules,
  // so perform an isSessionSupported() check for immersive-vr and immersive-ar.
  const featureDetect = (await navigator.xr.isSessionSupported('immersive-vr') && await navigator.xr.isSessionSupported('immersive-ar'));
  const uaCheck = navigator.userAgent.includes('Pico Neo 3 Link');
  const confidence = featureDetect && uaCheck ? 'Full' : 
                     featureDetect || uaCheck ? 'Partial' : 
                     'None';
  return { match: confidence !== 'None', confidence: confidence }
}

/**
 * Performs feature detection and a UA check to determine if user is using a browser on their desktop.
 * @returns an object indicating whether there is a match and the associated confidence level.
 */
 const checkDesktopBrowser = () => {
  // We are doing a coarse check here for lack of touch-capability and no Android/Mobile string in the UA.
  const featureDetect = (navigator.maxTouchPoints === 0 || navigator.msMaxTouchPoints === 0);
  const uaCheck = !navigator.userAgent.includes('Android') && !navigator.userAgent.includes('Mobile');
  const confidence = featureDetect && uaCheck ? 'Full' : 
                     featureDetect || uaCheck ? 'Partial' : 
                     'None';
  return { match: confidence !== 'None', confidence: confidence }
}

const checkUserPlatform = async () => {
  let currentMatch = {
    platform: '',
    confidence: ''
  };
  
  if (checkOculusBrowser().match) {
    currentMatch = { platform: 'Oculus', confidence: checkOculusBrowser().confidence };
  } else if (checkWolvicBrowser().match) {
    currentMatch = { platform: 'Wolvic', confidence: checkWolvicBrowser().confidence };
  } else if (await checkPicoBrowser().match) {
    currentMatch = { platform: 'Pico', confidence: await checkPicoBrowser().confidence };
  } else if (checkDesktopBrowser().match) {
    currentMatch = { platform: 'Desktop', confidence: checkDesktopBrowser().confidence };
  } else {
    // Cannot determine platform, return a default object
    currentMatch = { platform: 'Unknown', confidence: 'None' };
  }
  
  return currentMatch;
}

const openURL = url => {
  if (!url) return;
  
  // Are we on a device that will deeplink?
  // This may need to be expanded in the future.
  if (checkOculusBrowser().match) {
    if (url.includes('https://www.oculus.com/experiences/quest/')) {
        setTimeout(() => {
          window.open(url, '_blank');
        }, 1000);      
        return;
    }
  } else if (checkWolvicBrowser().match) {
    // Wolvic's pop-up blocking is more aggressive than other
    // Chromium-based XR browsers, probably due to its Firefox
    // lineage. In order to prevent clicks being caught by it,
    // construct our own modal window and directly link the
    // yes button to the window.open call.
    const modal = document.createElement('div');
    const content = document.createElement('div');
    const message = document.createElement('p');
    const yes = document.createElement('button');
    const no = document.createElement('button');

    modal.style.backgroundColor = 'rgb(0, 0, 0, 0.75)'
    modal.style.color = 'white';
    modal.style.textAlign = 'center';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.padding = '5%';
    modal.style.borderRadius = '5%';
    modal.style.transform = 'translate(-50%, -50%)';

    message.innerHTML = `<b>This billboard leads to ${url}. Continue?</b>`;

    yes.innerText = 'Move cursor back into window.';
    yes.style.width = '100vw';
    yes.style.height = '100vh';
    yes.onmouseenter = () => {
      yes.style.width = 'auto';
      yes.style.height = 'auto';
      yes.innerText = 'Yes';
    }
    yes.onclick = () => {
      window.open(url, '_blank');
      modal.remove();
    }
    
    no.innerText = 'No';
    no.onclick = () => {
      modal.remove();
    }
    
    modal.append(content);
    content.append(message);
    content.append(yes);
    content.append(no);
    document.body.append(modal);
    return;
  }
  window.open(url, '_blank');
}

const urlContainsUTMParams = (url) => {
  return url.indexOf('utm_source=') !== -1 || url.indexOf('utm_campaign=') !== -1 || url.indexOf('utm_channel=') !== -1;
}

const appendUTMParams = (url, spaceId) => {
  let new_url = new URL(url)
  new_url.searchParams.set('utm_source', 'ZestyMarket');
  new_url.searchParams.set('utm_campaign', 'ZestyCampaign');
  new_url.searchParams.set('utm_channel', `SpaceId_${spaceId}`);
  return new_url.href;
}

export { 
  parseProtocol,
  getIPFSGateway,
  checkOculusBrowser,
  checkWolvicBrowser,
  checkPicoBrowser,
  checkDesktopBrowser,
  checkUserPlatform,
  openURL,
  urlContainsUTMParams,
  appendUTMParams
};