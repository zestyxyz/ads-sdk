import { fetchAd, sendMetric } from './networking';
import { log } from './logger';
import './visibility_check';

AFRAME.registerComponent('zesty-clickable', {
  init: function() {
    this.object = this.el.object3D;
    this.el.addEventListener('click', this.check.bind(this));
  },

  check: function(event) {
    if (!event || !event.path || event.path.length === 0) {
      return;
    }
    const intersection = event.path[0].object3D;
    if (intersection && this.object.getObjectById(intersection.id)) {
      log(`${this.object.id} - click!`);
      sendMetric(
        'click', // event
        0, // duration
        this.el.adId, // adId
        this.el.auId, // auId
      );
      const scene = document.querySelector('a-scene');
      scene.exitVR();
      // Open link in new tab
      if (this.el.url) {
        window.open(this.el.url, '_blank');
      }
    }
  },
});

AFRAME.registerComponent('zesty-ad', {
  data: {},
  schema: {
    auId: { type: 'string', default: 'ce6f68fc-4809-4409-8f57-c631283ce5a3' },
    adId: { type: 'string' },
    url: { type: 'string' },
  },

  init: function() {
    this.system.registerEntity(this.el, this.data.auId);
  },

  // on every frame check for `visible` component
  tick: function() {
    let component = this.el;
    if (component.getAttribute('visible') == false) {
      while (component.firstChild) {
        component.removeChild(component.lastChild);
      }
    }

    if (!!component.getAttribute('visible') && !component.firstChild) {
      this.init();
    }
  },

  remove: function() {
    this.system.unregisterEntity(this.el);
  },
});

async function loadAd(auId) {
  const ad = await fetchAd(auId);

  const img = document.createElement('img');
  img.setAttribute('id', ad.id);
  img.setAttribute('crossorigin', '');
  if (ad.asset) {
    img.setAttribute('src', ad.asset);
    return new Promise((resolve, reject) => {
      img.onload = () => resolve({ img: img, url: ad.url, id: ad.id, auId: auId });
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

  registerEntity: function(el, auId) {
    const scene = document.querySelector('a-scene');
    let assets = scene.querySelector('a-assets');
    if (!assets) {
      assets = document.createElement('a-assets');
      scene.appendChild(assets);
    }

    log(`Ad unit ID: ${auId}`);

    this.adPromise = loadAd(auId).then((ad) => {
      this.adId = ad.id;
      this.auId = ad.auId;
      log('Loaded ad:', this.adId);
      if (ad.img) {
        assets.appendChild(ad.img);
      }
      return ad;
    });

    this.adPromise.then((ad) => {
      // don't attach plane if element's visibility is false
      if (el.getAttribute('visible') !== false) {
        const plane = document.createElement('a-plane');
        if (ad.img) {
          plane.setAttribute('src', `#${ad.id}`);
          // for textures that are 1024x1024, not setting this causes white border
          plane.setAttribute('transparent', 'true');
          plane.setAttribute('shader', 'flat');
        } else {
          // No ad to display, hide the plane texture while still leaving it accessible to raycasters
          plane.setAttribute('material', 'opacity: 0');
        }
        plane.setAttribute('side', 'double');
        plane.setAttribute('class', 'clickable'); // required for BE
        el.appendChild(plane);

        // Set ad properties
        el.url = ad.url;
        el.adId = this.adId;
        el.auId = this.auId;
      }
    });

    if (!el.hasAttribute('visibility-check')) {
      el.setAttribute('visibility-check', '');
    }

    if (!el.hasAttribute('zesty-clickable')) {
      el.setAttribute('zesty-clickable', '');
    }
    this.entities.push(el);
  },

  unregisterEntity: function(el) {
    this.entities = this.entities.filter((sEl) => sEl !== el);
  },
});

AFRAME.registerPrimitive('a-zesty-ad', {
  defaultComponents: {
    'zesty-ad': { auId: 'ce6f68fc-4809-4409-8f57-c631283ce5a3' },
    'visibility-check': {},
    'zesty-clickable': {},
  },
});
