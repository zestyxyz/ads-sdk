/* global AFRAME */

import { fetchCampaignAd, sendOnLoadMetric, sendOnClickMetric, analyticsSession } from '../../utils/networking';
import { formats, defaultFormat, defaultStyle } from '../../utils/formats';
import { openURL } from '../../utils/helpers';
import './visibility_check';
import { version } from '../package.json';

console.log('Zesty SDK Version: ', version);

AFRAME.registerComponent('zesty-banner', {
  data: {},
  schema: {
    space: { type: 'string' },
    format: { type: 'string', oneOf: ['tall', 'wide', 'square'] },
    style: { type: 'string', default: defaultStyle, oneOf: ['standard', 'minimal'] },
    height: { type: 'float', default: 1 },
    beacon: { type: 'boolean', default: true },
  },

  init: function() {
    this.tick = AFRAME.utils.throttleTick(this.tick, 30000, this);
    this.registerEntity();
  },

  registerEntity: function() {
    const space = this.data.space;
    const format = this.data.format || defaultFormat;
    createBanner(this.el, space, format, this.data.style, this.data.height, this.data.beacon);
  },

  // Every 30sec check for `visible` component
  tick: function() {
    if (this.data.space) {
      analyticsSession(this.data.space, null);
    }
  },
});

async function createBanner(el, space, format, style, height, beacon) {
  const scene = document.querySelector('a-scene');
  let assets = scene.querySelector('a-assets');
  if (!assets) {
    assets = document.createElement('a-assets');
    scene.appendChild(assets);
  }

  const bannerPromise = loadBanner(space, format, style, beacon).then(banner => {
    if (banner.img) {
      assets.appendChild(banner.img);
    }
    if (banner.url === 'https://www.zesty.market') {
      banner.url = `https://app.zesty.market/space/${space}`;
    }
    return banner;
  });

  bannerPromise.then(banner => {
    // don't attach plane if element's visibility is false
    if (el.getAttribute('visible') !== false) {
      const plane = document.createElement('a-plane');
      if (banner.img) {
        plane.setAttribute('src', `#${banner.img.id}`);
        plane.setAttribute('width', formats[format].width * height);
        plane.setAttribute('height', height);
        // for textures that are 1024x1024, not setting this causes white border
        plane.setAttribute('transparent', 'true');
        plane.setAttribute('shader', 'flat');
      } else {
        // No banner to display, hide the plane texture while still leaving it accessible to raycasters
        plane.setAttribute('material', 'opacity: 0');
      }
      plane.setAttribute('side', 'double');
      plane.setAttribute('class', 'clickable'); // required for BE

      if (beacon) {
        sendOnLoadMetric(space, banner.campaignId);
      }

      // handle clicks
      plane.onclick = async () => {
        const scene = document.querySelector('a-scene');
        await scene.exitVR();
        // Open link in new tab
        if (banner.url) {
          openURL(banner.url);
          if (beacon) {
            sendOnClickMetric(space, banner.campaignId);
          }
        }
      };
      el.appendChild(plane);

      // Set ad properties
      el.bannerURI = banner.uri;
      el.imgSrc = banner.img.src;
      el.url = banner.cta;
    }
  })
}

async function loadBanner(space, format, style) {
  const activeCampaign = await fetchCampaignAd(space, format, style);

  const { asset_url: image, cta_url: url } = activeCampaign.Ads[0];

  const img = document.createElement('img');
  img.setAttribute('id', space + Math.random());
  img.setAttribute('crossorigin', '');
  if (image) {
    img.setAttribute('src', image);
    return new Promise((resolve, reject) => {
      img.onload = () => resolve({ img: img, uri: space, url: url, campaignId: activeCampaign.CampaignId });
      img.onerror = () => reject(new Error('img load error'));
    });
  } else {
    return { id: 'blank' };
  }
}

AFRAME.registerPrimitive('a-zesty', {
  defaultComponents: {
    'zesty-banner': { space: '' },
    'visibility-check': {}
  }
});