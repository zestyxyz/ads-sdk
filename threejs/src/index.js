export default class ZestyAd extends THREE.Mesh {
  constructor(width = 2, height = 3, adSpace, creator, renderer = null) {
    super();
    this.geometry = new THREE.PlaneGeometry(width, height, 1, 1);

    this.type = "ZestyAd";
    this.adSpace = adSpace;
    this.creator = creator;
    this.renderer = renderer;

    this.adPromise = loadAd(adSpace, creator).then( ad => {
      this.material = new THREE.MeshBasicMaterial( {
        map: ad.texture
      });

      this.ad = ad;

      sendMetric(
        creator,
        adSpace,
        ad.uri,
        ad.src,
        ad.cta,
        'load', // event
        0, // durationInMs
      );

    });
  }

  onClick() {
    if(this.ad.url) {
      if (this.renderer != null && this.renderer.xr.getSession() != null) {
        this.renderer.xr.getSession().end();
      }

      window.open(this.ad.url, '_blank');
      sendMetric(
        this.creator,
        this.adSpace,
        this.ad.uri,
        this.ad.texture.image.src,
        this.ad.url,
        'click', // event
        0, // durationInMs
      );
    }
  }
}

async function loadAd(adSpace, creator) {
  const activeNFT = await fetchNFT(adSpace, creator);
  const activeAd = await fetchActiveAd(`https://ipfs.io/ipfs/${activeNFT.uri}`);

  // Need to add https:// if missing for page to open properly
  let url = activeAd.data.url;
  url = url.match(/^http[s]?:\/\//) ? url : 'https://' + url;

  let image = activeAd.data.image;
  image = image.match(/^.+\.(png|jpe?g)/i) ? image : `https://ipfs.io/ipfs/${image}`;

  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();

    loader.load(
      image,
      function ( texture ) {
        resolve({ texture: texture, src: image, uri: activeAd.uri, url: url });
      },
      undefined,
      function ( err ) {
        console.error( 'An error occurred while loading the ad.' );
        reject(err);
      }
    );
  });
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
  "image": "https://assets.wonderleap.co/wonderleap-ad-2.png",
  "cta": "https://wonderleap.co/"
}

const fetchNFT = async (adSpace, creator) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const body = {
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
  }

  return fetch(AD_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(body)
  })
  .then((r) => r.json())
  .then((res) => {
    let sellerAuctions = res.data.tokenDatas[0].sellerNFTSetting.sellerAuctions;
    if (sellerAuctions.length == 0 || sellerAuctions == null) {
      return DEFAULT_AD_DATAS 
    }

    return sellerAuctions[0].buyerCampaigns[0]
  })
  .catch((err) => {
    console.log(err);
    return DEFAULT_AD_DATAS;
  })
};

const fetchActiveAd = async (uri) => {
  if (!uri || uri.includes("undefined")) {
    return { uri: 'DEFAULT_URI', data: DEFAULT_AD_URI_CONTENT }
  }

  return fetch(uri)
  .then((r) => r.json())
  .then((res) => {
    return { uri: uri, data: res };
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
  const body = {
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
    sdkType: 'threejs',
  }
  return fetch(METRICS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(body)
  })
};

window.ZestyAd = ZestyAd;