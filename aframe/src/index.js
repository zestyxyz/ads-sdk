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
        this.el.adURI, // adURI
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
    tokenGroup: { type: 'string' },
    publisher: { type: 'string' },
    adURI: { type: 'string' },
    url: { type: 'string' },
  },

  init: function() {
    this.system.registerEntity(this.el, this.data.tokenGroup, this.data.publisher);
  },

  // on every frame check for `visible` component
  tick: function() {
    let component = this.el;
    if (component.getAttribute('visible') == false) {
      while (component.firstChild) {
        component.removeChild(component.lastChild);
      }
    }
    
    // if (!!component.getAttribute('visible') && !component.firstChild) {
    //   this.init();
    // }
  },

  remove: function() {
    this.system.unregisterEntity(this.el);
  },
});


async function loadAd(tokenGroup, publisher) {
  const ad = await fetchAd(tokenGroup, publisher);
  const img = document.createElement('img');

  img.setAttribute('id', ad.uri)
  img.setAttribute('crossorigin', '');
  if (ad.data.image) {
    img.setAttribute('src', ad.data.image);
    return new Promise((resolve, reject) => {
      img.onload = () => resolve({ img: img, uri: ad.uri, cta: ad.data.properties.cta });
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

  registerEntity: function(el, tokenGroup, publisher) {
    const scene = document.querySelector('a-scene');
    let assets = scene.querySelector('a-assets');
    if (!assets) {
      assets = document.createElement('a-assets');
      scene.appendChild(assets);
    }

    log(`Loading tokenGroup: ${tokenGroup}, publisher: ${publisher}`);

    this.adPromise = loadAd(tokenGroup, publisher).then((ad) => {
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
          plane.setAttribute('src', `#${ad.uri}`);
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
        el.url = ad.cta;
        el.adURI = ad.uri;
        console.log(el)
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
    'zesty-ad': { tokenGroup: '', publisher: '' },
    'visibility-check': {},
    'zesty-clickable': {},
  },
});
