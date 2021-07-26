import * as THREE from 'three';
import { fetchNFT, fetchActiveAd, sendMetric } from '../../utils/networking'

export default class ZestyAd extends THREE.Mesh {
  /**
   * @constructor
   * @param {string} adSpace The adSpace ID
   * @param {string} creator The wallet ID of the creator
   * @param {string} defaultAd The format of the default ad, defaults to square
   * @param {Number} width Width of the ad, defaults to 2
   * @param {Number} height Height of the ad, defaults to 3
   * @param {THREE.WebGLRenderer} renderer Optional field to pass in the WebGLRenderer in a WebXR project
   */
  constructor(adSpace, creator, defaultAd = 'square', width = 2, height = 3, renderer = null) {
    super();
    this.geometry = new THREE.PlaneGeometry(width, height, 1, 1);

    this.type = "ZestyAd";
    this.adSpace = adSpace;
    this.creator = creator;
    this.renderer = renderer;

    this.adPromise = loadAd(adSpace, creator, defaultAd).then( ad => {
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
        0, // durationInMs,
        'threejs' //sdkType
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
        'threejs' //sdkType
      );
    }
  }
}

async function loadAd(adSpace, creator, defaultAd) {
  const activeNFT = await fetchNFT(adSpace, creator);
  const activeAd = await fetchActiveAd(activeNFT.uri, defaultAd);

  // Need to add https:// if missing for page to open properly
  let url = activeAd.data.url;
  url = url.match(/^http[s]?:\/\//) ? url : 'https://' + url;
  if (url == 'https://www.zesty.market') {
    url = `https://app.zesty.market/ad-space/${adSpace}`;
  }

  let image = activeAd.data.image;
  image = image.match(/^.+\.(png|jpe?g)/i) ? image : `https://ipfs.zesty.market/ipfs/${image}`;

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

window.ZestyAd = ZestyAd;
