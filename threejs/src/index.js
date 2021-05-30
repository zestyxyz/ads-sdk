class ZestyAd extends THREE.Mesh {
  constructor(width = 2, height = 3, tokenGroup, publisher) {
    super();
    this.geometry = new THREE.PlaneGeometry(width, height, 1, 1);

    this.type = "ZestyAd";
    this.tokenGroup = tokenGroup;
    this.publisher = publisher;

    this.adPromise = loadAd(tokenGroup, publisher).then( ad => {
      this.material = new THREE.MeshBasicMaterial( {
        map: ad.texture
      });

      this.ad = ad;

      sendMetric(
        publisher,
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

      window.open(this.ad.cta, '_blank');
      sendMetric(
        this.publisher,
        this.tokenGroup,
        this.ad.uri,
        this.ad.img.src,
        this.ad.cta,
        'click', // event
        0, // durationInMs
      );
    }
  }
}

async function loadAd(tokenGroup, publisher) {
  const activeNFT = await fetchNFT(tokenGroup, publisher);
  const activeAd = await fetchActiveAd(activeNFT.uri);

  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();

    loader.load(
      activeAd.data.image,
      function ( texture ) {
        resolve({ texture: texture, src: activeAd.data.image, uri: activeAd.uri, cta: activeAd.data.cta });
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

const API_BASE = 'https://node-1.zesty.market'
const METRICS_ENDPOINT = API_BASE + '/api/v1/metrics'

// TODO: Need to change the API base The Graph to fetch correct ad
const AD_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/zestymarket/zesty-graph-rinkeby'

const sessionId = uuidv4();

const DEFAULT_AD_DATAS = {
  "uri": undefined,
}
const DEFAULT_AD_URI_CONTENT = {
  "name": "Default Ad",
  "description": "This is the default ad that would be displayed ipsum",
  "image": "https://assets.wonderleap.co/wonderleap-ad-2.png",
  "cta": "https://wonderleap.co/advertisers"
}

const fetchNFT = async (tokenGroup, publisher) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const body = {
    query: `
      query {
        tokenDatas (
          first: 1
          where: {
            publisher: "${publisher}"
            tokenGroup: "${tokenGroup}"
            timeStart_lte: ${currentTime}
            timeEnd_gte: ${currentTime}
          }
        ) {
          id
          tokenGroup
          publisher
          timeCreated
          timeStart
          timeEnd
          uri
          timestamp
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
    console.log(res)
    if (res.data.tokenDatas && res.data.tokenDatas.length > 0) {
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

  return fetch(uri)
  .then((r) => r.json())
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
      'Content-Type': 'text/plain'
    },
    body: JSON.stringify(body)
  })
};
