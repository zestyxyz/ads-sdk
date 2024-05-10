/* global AFRAME */

import { fetchCampaignAd, sendOnLoadMetric, sendOnClickMetric, analyticsSession } from '../../utils/networking';
import { formats, defaultFormat, defaultStyle } from '../../utils/formats';
import { openURL } from '../../utils/helpers';
import { version } from '../package.json';
import { getV3BetaUnitInfo } from '../../utils/networking';

console.log('Zesty SDK Version: ', version);

const AD_REFRESH_INTERVAL = 30000; // 30 seconds

function getCameraHelper(callback) {
  const camera = document.querySelector('[camera]');
  if (camera && camera.components && camera.components.camera && camera.components.camera.camera) {
    callback(camera.components.camera.camera);
  } else {
    setTimeout(function() {
      getCameraHelper(callback);
    }, 2000);
  }
}

// Camera might not be initialized at scene initialization, so we poll
// until we can register the camera.
async function getCamera() {
  return new Promise(resolve => {
    getCameraHelper(camera => {
      resolve(camera);
    });
  });
}

const cameraFuture = getCamera();


AFRAME.registerComponent('zesty-banner', {
  data: {},
  schema: {
    adUnit: { type: 'string' },
    format: { type: 'string', oneOf: ['tall', 'wide', 'square'] },
    style: { type: 'string', default: defaultStyle, oneOf: ['standard', 'minimal'] },
    height: { type: 'float', default: 1 },
    beacon: { type: 'boolean', default: true },
  },

  init: function() {
    this.loadedFirstAd = false;

    // Visibility check vars
    this.lastVisible = null;
    this.durationThreshold = 10000;
    cameraFuture.then(camera => {
      this.camera = camera;
    });
    this.object = this.el.object3D;
    this.sceneEl = document.querySelector('a-scene');
    this.scene = this.sceneEl.object3D;

    this.tick = AFRAME.utils.throttleTick(this.tick, 30000, this);
    this.registerEntity();
  },

  registerEntity: function() {
    const adUnit = this.data.adUnit;
    const format = this.data.format || defaultFormat;
    createBanner(this.el, adUnit, format, this.data.style, this.data.height, this.data.beacon, this.checkVisibility.bind(this));
  },

  // Every 30sec check for `visible` component
  tick: function() {
    if (this.data.adUnit) {
      analyticsSession(this.data.adUnit, null);
    }
  },

  sendSessionAnalytics: function () {
    if (this.data.adUnit) {
      analyticsSession(this.data.adUnit, null);
    }
  },

  checkVisibility: function() {
    if (!this.loadedFirstAd) {
      this.loadedFirstAd = true;
      return true;
    }
    let isVisible = false;
    const boundingBox = new THREE.Box3().setFromObject(this.el.object3D);
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(this.camera.projectionMatrix)
    frustum.planes.forEach(plane => plane.applyMatrix4(this.camera.matrixWorld));
    if (frustum.intersectsBox(boundingBox)) {
      isVisible = true;
    }
    console.log('is visible: ', isVisible);
    return isVisible;
  }
});

async function createBanner(el, adUnit, format, style, height, beacon, visibilityCheckFunc) {
  const {
    format: adjustedFormat = format,
    absoluteWidth: adjustedWidth = formats[adjustedFormat].width,
    absoluteHeight: adjustedHeight = height
  } = getV3BetaUnitInfo(adUnit);
  const isBeta = getV3BetaUnitInfo(adUnit).hasOwnProperty('format');
  const absoluteDimensions = adjustedHeight !== height;

  const scene = document.querySelector('a-scene');
  let assets = scene.querySelector('a-assets');
  if (!assets) {
    assets = document.createElement('a-assets');
    scene.appendChild(assets);
  }

  const plane = document.createElement('a-plane');
  plane.setAttribute('src', `${formats[adjustedFormat].style[style]}`);
  plane.setAttribute('width', adjustedWidth * (absoluteDimensions ? 1 : adjustedHeight));
  plane.setAttribute('height', adjustedHeight);
  // for textures that are 1024x1024, not setting this causes white border
  plane.setAttribute('transparent', 'true');
  plane.setAttribute('shader', 'flat');
  plane.setAttribute('side', 'double');
  plane.setAttribute('class', 'clickable'); // required for BE
  el.appendChild(plane);

  const getBanner = () => {
    if (!visibilityCheckFunc()) return;

    const bannerPromise = loadBanner(adUnit, format, style, beacon).then(banner => {
      if (banner.img) {
        assets.appendChild(banner.img);
      }
      return banner;
    });
  
    bannerPromise.then(banner => updateBanner(banner, plane, el, adUnit, format, style, height, beacon));
  }

  getBanner();
  if (isBeta) {
    setInterval(getBanner, AD_REFRESH_INTERVAL);
  }
}

async function loadBanner(adUnit, format, style) {
  const activeCampaign = await fetchCampaignAd(adUnit, format, style);

  const { asset_url: image, cta_url: url } = activeCampaign.Ads[0];

  const img = document.createElement('img');
  img.setAttribute('id', adUnit + Math.random());
  img.setAttribute('crossorigin', '');
  if (image) {
    img.setAttribute('src', image);
    return new Promise((resolve, reject) => {
      img.onload = () => resolve({ img: img, uri: adUnit, url: url, campaignId: activeCampaign.CampaignId });
      img.onerror = () => reject(new Error('img load error'));
    });
  } else {
    return { id: 'blank' };
  }
}

async function updateBanner(banner, plane, el, adUnit, format, style, height, beacon) {
  const {
    format: adjustedFormat = format,
    absoluteWidth: adjustedWidth = formats[adjustedFormat].width,
    absoluteHeight: adjustedHeight = height
  } = getV3BetaUnitInfo(adUnit);
  const absoluteDimensions = adjustedHeight !== height;

  // don't attach plane if element's visibility is false
  if (el.getAttribute('visible') !== false) {
    if (banner.img) {
      plane.setAttribute('src', `#${banner.img.id}`);
      plane.setAttribute('width', adjustedWidth * (absoluteDimensions ? 1 : adjustedHeight));
      plane.setAttribute('height', adjustedHeight);
      // for textures that are 1024x1024, not setting this causes white border
      plane.setAttribute('transparent', 'true');
      plane.setAttribute('shader', 'flat');
    } else {
      // No banner to display, hide the plane texture while still leaving it accessible to raycasters
      //plane.setAttribute('material', 'opacity: 0');
    }

    if (beacon) {
      sendOnLoadMetric(adUnit, banner.campaignId);
    }

    // handle clicks
    plane.onclick = async () => {
      const scene = document.querySelector('a-scene');
      await scene.exitVR();
      // Open link in new tab
      if (banner.url) {
        openURL(banner.url);
        if (beacon) {
          sendOnClickMetric(adUnit, banner.campaignId);
        }
      }
    };

    // Set ad properties
    el.bannerURI = banner.uri;
    el.imgSrc = banner.img.src;
    el.url = banner.cta;
  }
}

AFRAME.registerPrimitive('a-zesty', {
  defaultComponents: {
    'zesty-banner': { adUnit: '' },
    'visibility-check': {}
  }
});