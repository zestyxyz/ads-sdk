import { fetchNFT, fetchActiveBanner, sendMetric } from '../../utils/networking';
import { formats, defaultFormat, defaultStyle } from '../../utils/formats';
import { parseProtocol } from '../../utils/helpers';
import { log } from './logger';
import './visibility_check';


AFRAME.registerComponent('zesty-banner', {
  data: {},
  schema: {
    adSpace: { type: 'string' },
    space: { type: 'string' },
    creator: { type: 'string' },
    network: { type: 'string', default: 'polygon', oneOf: ['matic', 'polygon', 'rinkeby'] },
    adFormat: { type: 'string', oneOf: ['tall', 'wide', 'square'] },
    format: { type: 'string', oneOf: ['tall', 'wide', 'square'] },
    style: { type: 'string', default: defaultStyle, oneOf: ['standard', 'minimal'] },
    height: { type: 'float', default: 1 },
  },

  init: function() {
    // This slows down the tick
    this.tick = AFRAME.utils.throttleTick(this.tick, 200, this);
    this.registerEntity()
  },

  registerEntity: function() {
    let space = this.data.space ? this.data.space : this.data.adSpace;
    let format = (this.data.format ? this.data.format : this.data.adFormat) || defaultFormat;
    let el = this.el;

    const scene = document.querySelector('a-scene');
    let assets = scene.querySelector('a-assets');
    if (!assets) {
      assets = document.createElement('a-assets');
      scene.appendChild(assets);
    }

    log(`Loading space: ${space}, creator: ${this.data.creator}`);

    this.bannerPromise = loadBanner(space, this.data.creator, this.data.network, format, this.data.style).then((banner) => {
      if (banner.img) {
        assets.appendChild(banner.img);
      }
      if (banner.url == 'https://www.zesty.market') {
        banner.url = `https://app.zesty.market/space/${space}`;
      }
      return banner;
    });

    this.bannerPromise.then((banner) => {
      // don't attach plane if element's visibility is false
      if (el.getAttribute('visible') !== false) {
        sendMetric(
          this.data.creator,
          space,
          banner.uri,
          banner.img.src,
          banner.url,
          'load', // event
          0, // durationInMs
          'aframe' //sdkType
        );

        const plane = document.createElement('a-plane');
        if (banner.img) {
          plane.setAttribute('src', `#${banner.uri}`);
          plane.setAttribute('width', formats[format].width * this.data.height);
          plane.setAttribute('height', this.data.height);
          // for textures that are 1024x1024, not setting this causes white border
          plane.setAttribute('transparent', 'true');
          plane.setAttribute('shader', 'flat');
        } else {
          // No banner to display, hide the plane texture while still leaving it accessible to raycasters
          plane.setAttribute('material', 'opacity: 0');
        }
        plane.setAttribute('side', 'double');
        plane.setAttribute('class', 'clickable'); // required for BE

        // handle clicks
        plane.onclick = () => {
          const scene = document.querySelector('a-scene');
          scene.exitVR();
          // Open link in new tab
          if (banner.url) {
            window.open(banner.url, '_blank');
            sendMetric(
              this.data.creator,
              space,
              banner.uri,
              banner.img.src,
              banner.url,
              'click', // event
              0, // durationInMs
              'aframe' //sdkType
            );
          }};
        el.appendChild(plane);

        // Set ad properties
        el.bannerURI = banner.uri;
        el.imgSrc = banner.img.src;
        el.url = banner.cta;
      }
    });

    if (!el.hasAttribute('visibility-check')) {
      el.setAttribute('visibility-check', '');
    }
  },

  // Every 200ms check for `visible` component
  tick: function() {
    let component = this.el;
    if (component.getAttribute('visible') == false) {
      while (component.firstChild) {
        component.removeChild(component.lastChild);
      }
    }

    if (!!component.getAttribute('visible') && !component.firstChild) {
      //this.registerEntity();
    }
  },

  remove: function() {
    //this.system.unregisterEntity(this.el);
  },
});
/*
AFRAME.registerComponent('zesty-ad', {
  data: {},
  schema: {
    adSpace: { type: 'string' },
    space: { type: 'string' },
    creator: { type: 'string' },
    network: { type: 'string', default: 'polygon', oneOf: ['matic', 'polygon', 'rinkeby'] },
    adFormat: { type: 'string', oneOf: ['tall', 'wide', 'square'] },
    format: { type: 'string', oneOf: ['tall', 'wide', 'square'] },
    style: { type: 'string', default: defaultStyle, oneOf: ['standard', 'minimal'] },
    height: { type: 'float', default: 1 },
  },

  init: function() {
    // This slows down the tick
    this.tick = AFRAME.utils.throttleTick(this.tick, 200, this);
    this.registerEntity()
  },

  registerEntity: function() {
    let space = this.data.space ? this.data.space : this.data.adSpace;
    let format = (this.data.format ? this.data.format : this.data.adFormat) || defaultFormat;
    this.system.registerEntity(this.el, space, this.data.creator, this.data.network, format, this.data.style, this.data.height);
  },

  // Every 200ms check for `visible` component
  tick: function() {
    let component = this.el;
    if (component.getAttribute('visible') == false) {
      while (component.firstChild) {
        component.removeChild(component.lastChild);
      }
    }

    if (!!component.getAttribute('visible') && !component.firstChild) {
      this.registerEntity();
    }
  },

  remove: function() {
    this.system.unregisterEntity(this.el);
  },
});
*/

async function loadBanner(space, creator, network, format, style) {
  const activeNFT = await fetchNFT(space, creator, network);
  const activeBanner = await fetchActiveBanner(activeNFT.uri, format, style);

  // Need to add https:// if missing for page to open properly
  let url = activeBanner.data.url;
  url = url.match(/^http[s]?:\/\//) ? url : 'https://' + url;

  let image = activeBanner.data.image;
  image = image.match(/^.+\.(png|jpe?g)/i) ? image : parseProtocol(image);

  const img = document.createElement('img');
  if (activeBanner.uri === 'DEFAULT_URI') activeBanner.uri += Math.random();
  img.setAttribute('id', activeBanner.uri)
  img.setAttribute('crossorigin', '');
  if (activeBanner.data.image) {
    img.setAttribute('src', image);
    return new Promise((resolve, reject) => {
      img.onload = () => resolve({ img: img, uri: activeBanner.uri, url: url });
      img.onerror = () => reject('img load error');
    });
  } else {
    return { id: 'blank' };
  }
}

AFRAME.registerPrimitive('a-zesty', {
  defaultComponents: {
    'zesty-banner': { space: '', creator: '' },
    'visibility-check': {}
  },
});
