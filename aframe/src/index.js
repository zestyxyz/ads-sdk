import { fetchNFT, fetchActiveAd, sendMetric } from '../../utils/networking';
import { log } from './logger';
import './visibility_check';


AFRAME.registerComponent('zesty-ad', {
  data: {},
  schema: {
    adSpace: { type: 'string' },
    creator: { type: 'string' },
    defaultAd: { type: 'string', default: 'square' },
    width: { type: 'float', default: 1 },
    height: { type: 'float', default: 1 },
  },

  init: function() {
    // This slows down the tick
    this.tick = AFRAME.utils.throttleTick(this.tick, 200, this);
    this.registerEntity()
  },

  registerEntity: function() {
    this.system.registerEntity(this.el, this.data.adSpace, this.data.creator, this.data.defaultAd, this.data.width, this.data.height);
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


async function loadAd(adSpace, creator, defaultAd) {
  const activeNFT = await fetchNFT(adSpace, creator);
  const activeAd = await fetchActiveAd(activeNFT.uri, defaultAd);

  // Need to add https:// if missing for page to open properly
  let url = activeAd.data.url;
  url = url.match(/^http[s]?:\/\//) ? url : 'https://' + url;

  let image = activeAd.data.image;
  image = image.match(/^.+\.(png|jpe?g)/i) ? image : `https://ipfs.zesty.market/ipfs/${image}`;

  const img = document.createElement('img');
  img.setAttribute('id', activeAd.uri)
  img.setAttribute('crossorigin', '');
  if (activeAd.data.image) {
    img.setAttribute('src', image);
    return new Promise((resolve, reject) => {
      img.onload = () => resolve({ img: img, uri: activeAd.uri, url: url });
      img.onerror = () => reject('img load error');
    });
  } else {
    return { id: 'blank' };
  }
}

AFRAME.registerSystem('zesty-ad', {
  entities: [],
  data: {},
  schema: {},

  init: function() {
    this.entities = [];
  },

  registerEntity: function(el, adSpace, creator, defaultAd, width, height) {
    if((this.adPromise && this.adPromise.isPending && this.adPromise.isPending()) || this.entities.length) return; // Checks if it is a promise, stops more requests from being made

    const scene = document.querySelector('a-scene');
    let assets = scene.querySelector('a-assets');
    if (!assets) {
      assets = document.createElement('a-assets');
      scene.appendChild(assets);
    }

    log(`Loading adSpace: ${adSpace}, creator: ${creator}`);

    this.adPromise = loadAd(adSpace, creator, defaultAd).then((ad) => {
      if (ad.img) {
        assets.appendChild(ad.img);
      }
      if (ad.url == 'https://www.zesty.market') {
        ad.url = `https://app.zesty.market/ad-space/${adSpace}`;
      }
      return ad;
    });

    this.adPromise.then((ad) => {
      // don't attach plane if element's visibility is false
      if (el.getAttribute('visible') !== false) {
        sendMetric(
          creator,
          adSpace,
          ad.uri,
          ad.img.src,
          ad.url,
          'load', // event
          0, // durationInMs
          'aframe' //sdkType
        );

        const plane = document.createElement('a-plane');
        if (ad.img) {
          plane.setAttribute('src', `#${ad.uri}`);
          plane.setAttribute('width', width);
          plane.setAttribute('height', height);
          // for textures that are 1024x1024, not setting this causes white border
          plane.setAttribute('transparent', 'true');
          plane.setAttribute('shader', 'flat');
        } else {
          // No ad to display, hide the plane texture while still leaving it accessible to raycasters
          plane.setAttribute('material', 'opacity: 0');
        }
        plane.setAttribute('side', 'double');
        plane.setAttribute('class', 'clickable'); // required for BE

        // handle clicks
        plane.onclick = () => {
          const scene = document.querySelector('a-scene');
          scene.exitVR();
          // Open link in new tab
          if (ad.url) {
            window.open(ad.url, '_blank');
            sendMetric(
              creator,
              adSpace,
              ad.uri,
              ad.img.src,
              ad.url,
              'click', // event
              0, // durationInMs
              'aframe' //sdkType
            );
          }};
        el.appendChild(plane);

        // Set ad properties
        el.adURI = ad.uri;
        el.imgSrc = ad.img.src;
        el.url = ad.cta;
      }
    });

    if (!el.hasAttribute('visibility-check')) {
      el.setAttribute('visibility-check', '');
    }

    this.entities.push(el);
  },

  unregisterEntity: function(el) {
    this.entities = this.entities.filter((sEl) => sEl !== el);
  },
});

AFRAME.registerPrimitive('a-zesty-ad', {
  defaultComponents: {
    'zesty-ad': { adSpace: '', creator: '' },
    'visibility-check': {}
  },
});
