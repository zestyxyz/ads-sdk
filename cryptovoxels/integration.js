// Helpers

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
    fetch(`https://arweave.net/${uri.substring(5)}`)
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

// Formats
const formats = {
    'tall': {
        width: 0.75,
        height: 1,
        style: {
            'standard': 'https://ipfs.fleek.co/ipns/lib.zesty.market/assets/zesty-banner-tall.png',
            'minimal': 'https://ipfs.fleek.co/ipns/lib.zesty.market/assets/zesty-banner-tall-minimal.png',
            'transparent': 'https://ipfs.fleek.co/ipns/lib.zesty.market/assets/zesty-banner-tall-transparent.png'
        }
    },
    'wide': {
        width: 4,
        height: 1,
        style: {
            'standard': 'https://ipfs.fleek.co/ipns/lib.zesty.market/assets/zesty-banner-wide.png',
            'minimal': 'https://ipfs.fleek.co/ipns/lib.zesty.market/assets/zesty-banner-wide-minimal.png',
            'transparent': 'https://ipfs.fleek.co/ipns/lib.zesty.market/assets/zesty-banner-wide-transparent.png'
        }
    },
    'square': {
        width: 1,
        height: 1,
        style: {
            'standard': 'https://ipfs.fleek.co/ipns/lib.zesty.market/assets/zesty-banner-square.png',
            'minimal': 'https://ipfs.fleek.co/ipns/lib.zesty.market/assets/zesty-banner-square-minimal.png',
            'transparent': 'https://ipfs.fleek.co/ipns/lib.zesty.market/assets/zesty-banner-square-transparent.png'
        }
    }
}

const defaultFormat = 'square';
const defaultStyle = 'standard';

// Networking
const API_BASE = 'https://beacon.zesty.market'

const ENDPOINTS = {
    "matic": 'https://api.thegraph.com/subgraphs/name/zestymarket/zesty-market-graph-matic',
    "polygon": 'https://api.thegraph.com/subgraphs/name/zestymarket/zesty-market-graph-matic',
    "rinkeby": 'https://api.thegraph.com/subgraphs/name/zestymarket/zesty-market-graph-rinkeby'
}

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
 * @param {string} creator The wallet address of the creator
 * @param {string} network The network to post metrics to
 * @returns An object with the requested space information, or a default if it cannot be retrieved.
 */
const fetchNFT = async (space, creator, network = 'polygon') => {
    const currentTime = Math.floor(Date.now() / 1000);
    const query = {
        query: `
      query {
        tokenDatas (
          where: {
            id: "${space}"
            creator: "${creator}"
          }
        )
        {
          sellerNFTSetting {
            sellerAuctions (
              first: 5
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
              buyerCampaignsApproved
            }
          }
          id
        }
      }
    `
    };
  return fetch(ENDPOINTS[network], {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(query)
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
const parseGraphResponse = async res => {
  let body = await res.json();
  let tokenDatas = body.data.tokenDatas;
  if (tokenDatas.length == 0) return DEFAULT_DATAS;

  let sellerAuction = body.data.tokenDatas[0].sellerNFTSetting.sellerAuctions[0];
  let latestAuction = null;
  for (let i=0; i < sellerAuction.buyerCampaignsApproved.length; i++) {
    if (sellerAuction.buyerCampaignsApproved[i] && sellerAuction.buyerCampaigns.length > 0) {
      latestAuction = sellerAuction.buyerCampaigns[i];
    }
  }

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
 * @returns An object with the requested banner content, or a default if it cannot be retrieved.
 */
const fetchActiveBanner = async (uri, format, style) => {
  if (!uri) {
    let bannerObject = { uri: 'DEFAULT_URI', data: DEFAULT_URI_CONTENT };
    let newFormat = format || defaultFormat;
    let newStyle = style || defaultStyle;
    bannerObject.data.image = formats[newFormat].style[newStyle];
    return bannerObject;
  }

  return fetch(parseProtocol(uri))
  .then(async (res) => {
     let data = await res.json();
     return res.status == 200 ? { uri: uri, data: data } : null
  })
}

function sendOnLoadMetric(space) {
    try {
        const spaceCounterEndpoint = API_BASE + `/api/v1/space/${space}`
        fetch(spaceCounterEndpoint, { method: 'PUT' });
    } catch (e) {
        console.log("Failed to emit onload event", e.message)
    }
}

async function loadBanner(space, creator, network, format, style, beacon = true) {
    let uri = null;
    const activeNFT = await fetchNFT(space, creator, network);
    if (activeNFT) uri = activeNFT.uri;
    const activeBanner = await fetchActiveBanner(uri, format, style, space);

    // Need to add https:// if missing for page to open properly
    let url = activeBanner.data.url;
    url = url.match(/^http[s]?:\/\//) ? url : 'https://' + url;

    if (url == 'https://www.zesty.market') {
        url = `https://app.zesty.market/space/${space}`;
    }

    let image = activeBanner.data.image;
    image = image.match(/^.+\.(png|jpe?g)/i) ? image : parseProtocol(image);

    if (beacon) {
        sendOnLoadMetric(space);
    }

    feature.set({'url': image, 'link': url});
}

// Call loadBanner here. Parameters are:
// Space ID, Creator ID, Network, Format, Style, Enable Beacon (optional)
