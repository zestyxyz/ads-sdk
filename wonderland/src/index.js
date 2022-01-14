/* global WL */

import { fetchNFT, fetchActiveBanner, sendOnLoadMetric } from '../../utils/networking';
import { formats, defaultFormat } from '../../utils/formats';
import { openURL, parseProtocol } from '../../utils/helpers';

/**
 * [Zesty Market](https://zesty.market) banner space
 *
 * Fetches a banner and applies it to a texture. If no `cursor-target` and `collision`
 * is found on the object, they will be created automatically (with box shape in group 1).
 *
 * Make sure that you set up a cursor to enable clicking.
 */
WL.registerComponent(
  'zesty-banner',
  {
    /* Your creator id */
    creator: { type: WL.Type.String },
    /* Your banner space index */
    space: { type: WL.Type.Int },
    /* The network to connect to */
    network: { type: WL.Type.Enum, values: ['rinkeby', 'polygon'], default: 'polygon' },
    /* The default banner format, determines aspect ratio */
    format: { type: WL.Type.Enum, values: Object.keys(formats), default: defaultFormat },
    /* The default banner visual style */
    style: {
      type: WL.Type.Enum,
      values: ['standard', 'minimal', 'transparent'],
      default: 'transparent',
    },
    /* Scale width of the object to banner ratio (see adFormat) and set the collider */
    scaleToRatio: { type: WL.Type.Bool, default: true },
    /* Texture property to set after banner is loaded. Leave "auto" to detect from
     * known pipelines (Phong Opaque Textured, Flat Opaque Textured) */
    textureProperty: { type: WL.Type.String, default: 'auto' },
    beacon: { type: WL.Type.Bool, default: false },
  },
  {
    init: function () {
      this.formats = Object.values(formats);
      this.formatKeys = Object.keys(formats);
      this.styleKeys = ['standard', 'minimal', 'transparent'];
    },

    start: function () {
      this.mesh = this.object.getComponent('mesh');
      if (!this.mesh) {
        throw new Error("'zesty-banner ' missing mesh component");
      }

      this.collision =
        this.object.getComponent('collision') ||
        this.object.addComponent('collision', {
          collider: WL.Collider.Box,
          group: 0x2,
        });

      this.cursorTarget =
        this.object.getComponent('cursor-target') || this.object.addComponent('cursor-target');
      this.cursorTarget.addClickFunction(this.onClick.bind(this));

      import('https://ipfs.io/ipns/lib.zesty.market/zesty-formats.js').then(({formats}) => {
        this.formatsOverride = formats;
        this.loadBanner(
          this.space,
          this.creator,
          this.network,
          this.formatKeys[this.format],
          this.styleKeys[this.style]
        ).then((banner) => {
          this.banner = banner;
  
          if (this.scaleToRatio) {
            /* Make banner always 1 meter height, adjust width according to banner aspect ratio */
            this.height = this.object.scalingLocal[1];
            this.object.resetScaling();
            this.collision.extents = [
              this.formats[this.format].width * this.height,
              this.height,
              0.1,
            ];
            this.object.scale([this.formats[this.format].width * this.height, this.height, 1.0]);
          }
          /* WL.Material.shader will be renamed to pipeline at some point,
           * supporting as many API versions as possible. */
          const m = this.mesh.material.clone();
          if (this.textureProperty === 'auto') {
            const pipeline = m.pipeline || m.shader;
            if (pipeline === 'Phong Opaque Textured') {
              m.diffuseTexture = banner.texture;
              m.alphaMaskThreshold = 0.3;
            } else if (pipeline === 'Flat Opaque Textured') {
              m.flatTexture = banner.texture;
              m.alphaMaskThreshold = 0.8;
            } else {
              throw Error(
                "'zesty-banner ' unable to apply banner texture: unsupported pipeline " + m.shader
              );
            }
            this.mesh.material = m;
          } else {
            this.mesh.material[this.textureProperty] = banner.texture;
          }
  
          if (this.beacon) {
            sendOnLoadMetric(this.space);
          }
        });
      })
    },
    onClick: function () {
      if (this.banner.url) {
        if (WL.xrSession) {
          WL.xrSession.end().then(this.executeClick.bind(this));
        } else {
          this.executeClick();
        }
      }
    },
    executeClick: function () {
      openURL(this.banner.url);
      // sendMetric(
      //   this.creator,
      //   this.space,
      //   this.banner.uri,
      //   this.banner.imageSrc,
      //   this.banner.url,
      //   'click',
      //   0,
      //   'wonderland'
      // );
    },
    loadBanner: async function (space, creator, network, format, style) {
      network = network ? 'polygon' : 'rinkeby'; // Use truthy/falsy values to get network
      const activeNFT = await fetchNFT(space, creator, network);
      const activeBanner = await fetchActiveBanner(activeNFT.uri, format, style, this.formatsOverride);

      // Need to add https:// if missing for page to open properly
      let url = activeBanner.data.url;
      url = url.match(/^http[s]?:\/\//) ? url : 'https://' + url;

      if (url === 'https://www.zesty.market') {
        url = `https://app.zesty.market/space/${space}`;
      }

      let image = activeBanner.data.image;
      image = image.match(/^.+\.(png|jpe?g)/i) ? image : parseProtocol(image);

      return WL.textures.load(image, '').then((texture) => {
        activeBanner.texture = texture;
        activeBanner.imageSrc = image;
        activeBanner.url = url;
        return activeBanner;
      });
    },
  }
);
