import { 
  Mesh, 
  MeshBasicMaterial,
  WebGLRenderer,
  PlaneGeometry,
  TextureLoader,
  Vector3
} from 'three';
import { sendOnLoadMetric, sendOnClickMetric, fetchCampaignAd, AD_REFRESH_INTERVAL } from '../../utils/networking';
import { formats } from '../../utils/formats';
import { openURL } from '../../utils/helpers';
import { version } from '../package.json';

console.log('Zesty SDK Version: ', version);

export default class ZestyBanner extends Mesh {
  /**
   * @constructor
   * @param {string} adUnit The ad unit ID
   * @param {string} format The format of the default banner
   * @param {string} style The visual style of the default banner
   * @param {Number} height Height of the banner
   * @param {WebGLRenderer} renderer Optional field to pass in the WebGLRenderer in a WebXR project
   */
  constructor(adUnit, format, style, height, renderer = null, beacon = true) {
    super();
    this.geometry = new PlaneGeometry(formats[format].width * height, height, 1, 1);

    this.type = 'ZestyBanner';
    this.adUnit = adUnit;
    this.renderer = renderer;
    this.beacon = beacon;
    this.banner = {};

    this.bannerPromise = loadBanner(adUnit, format, style).then(banner => {
      this.material = new MeshBasicMaterial({
        map: banner.texture
      });
      this.material.transparent = true;
      this.banner = banner;

      if (beacon) {
        sendOnLoadMetric(adUnit, banner.campaignId);
      }
    });
    this.onClick = this.onClick.bind(this);

    setInterval(() => {
      const isVisible = this.checkVisibility();
      if (isVisible) {
        loadBanner(adUnit, format, style).then(banner => {
          this.material.map = banner.texture;
          this.material.needsUpdate = true;
          this.banner = banner;
        });
        console.log('Refreshed ' + adUnit);
      }
    }, AD_REFRESH_INTERVAL);
  }

  onClick() {
    if (this.banner.url) {
      if (this.renderer != null && this.renderer.xr.getSession() != null) {
        this.renderer.xr.getSession().end();
      }

      openURL(this.banner.url);
      if (this.beacon) {
        sendOnClickMetric(this.adUnit, this.banner.campaignId);
      }
    }
  }

  checkVisibility() {
    let camera = null;
    let cameraDir = new Vector3();
    let bannerPos = new Vector3();
    let cameraPos = new Vector3();
    let getScene = () => {
      let parent = this.parent;
      while (parent.parent != null) {
        parent = parent.parent;
      }
      return parent;
    }
    // Get the origin of the banner object
    this.getWorldPosition(bannerPos);
    // Get the origin of the camera
    if (this.renderer.xr.isPresenting) {
      camera = this.renderer.xr.getCamera();
    } else {
      camera = getScene().getObjectByProperty('isCamera', true);
    }
    camera.getWorldPosition(cameraPos);
    // Get the direction of the camera
    camera.getWorldDirection(cameraDir);
    // Calculate the difference between the object and camera origins
    const diff = bannerPos.sub(cameraPos);
    diff.normalize();
    // Calculate the dot product of the camera's direction and the difference
    const dot = cameraDir.dot(diff);
    // Return true if the dot product is above PI/2, corresponding to a degree range of 90 degrees
    return dot > Math.cos(Math.PI / 4);
  }
}

async function loadBanner(adUnit, format, style) {
  const activeBanner = await fetchCampaignAd(adUnit, format, style);

  const { asset_url: image, cta_url: url } = activeBanner.Ads[0];

  return new Promise((resolve, reject) => {
    const loader = new TextureLoader();

    loader.load(
      image,
      function(texture) {
        texture.needsUpdate = true;
        resolve({ texture: texture, src: image, uri: activeBanner.uri, url: url, campaignId: activeBanner.CampaignId });
      },
      undefined,
      function(err) {
        console.error('An error occurred while loading the ad.');
        reject(err);
      }
    );
  });
}

window.ZestyBanner = ZestyBanner;
