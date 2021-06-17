export default class ZestyAd extends THREE.Mesh {
  constructor(width = 2, height = 3, tokenGroup, creator) {
    super();
    this.geometry = new THREE.PlaneGeometry(width, height, 1, 1);

    this.type = "ZestyAd";
    this.tokenGroup = tokenGroup;
    this.creator = creator;

    this.adPromise = loadAd(tokenGroup, creator).then( ad => {
      this.material = new THREE.MeshBasicMaterial( {
        map: ad.texture
      });

      this.ad = ad;

      sendMetric(
        creator,
        tokenGroup,
        ad.uri,
        ad.src,
        ad.cta,
        'load', // event
        0, // durationInMs
      );

    });
  }

  onClick() {
    if(this.ad.cta) {
      // TODO: Exit VR
      // Need a way to hook into the active threejs WebGLRenderer and reach XRSession

      window.open(this.ad.cta, '_blank');
      sendMetric(
        this.creator,
        this.tokenGroup,
        this.ad.uri,
        this.ad.texture.image.src,
        this.ad.cta,
        'click', // event
        0, // durationInMs
      );
    }
  }
}

async function loadAd(tokenGroup, creator) {
  const activeNFT = await fetchNFT(tokenGroup, creator);
  const activeAd = await fetchActiveAd(`https://ipfs.io/ipfs/${activeNFT.uri}`);

  // Need to add https:// if missing for page to open properly
  let cta = activeAd.data.location;
  cta = cta.match(/^http[s]?:\/\//) ? cta : 'https://' + cta;

  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();

    loader.load(
      `https://ipfs.io/ipfs/${activeAd.data.image}`,
      function ( texture ) {
        resolve({ texture: texture, src: activeAd.data.image, uri: activeAd.uri, cta: cta });
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
  "image": "https://ipfs.fleek.co/ipfs/QmWBNfP8roDrwz3XQo4qpu9fMxvUSTn8LB7d4JK7ybrfZ2/assets/zesty-ad-aframe.png",
  "cta": "https://www.zesty.market"
}

const fetchNFT = async (tokenGroup, creator) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const body = {
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
  }

  return fetch(AD_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(body)
  })
  .then((r) => r.json())
  .then((res) => {
    if (res.data.tokenDatas && res.data.tokenDatas.length) {
      return res.data.tokenDatas[0];
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

  return fetch(uri)
  .then((r) => r.json())
  .then((res) => {
    return { uri: uri, data: res };
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
  const body = {
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