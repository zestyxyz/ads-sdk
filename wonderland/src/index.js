/* global WL */

import { fetchCampaignAd, sendOnLoadMetric, sendOnClickMetric } from '../../utils/networking';
import { formats, defaultFormat } from '../../utils/formats';
import { openURL } from '../../utils/helpers';
import { version } from '../package.json';
import {
  Component,
  Collider,
  MeshComponent,
  CollisionComponent,
  Property
} from '@wonderlandengine/api';
import { CursorTarget } from '@wonderlandengine/components';

console.log('Zesty SDK Version: ', version);

const formatsLink = 'https://ipfs.io/ipns/libv2.zesty.market/zesty-formats.js';
const networkingLink = 'https://ipfs.io/ipns/libv2.zesty.market/zesty-networking.js';

/**
 * [Zesty Market](https://zesty.market) banner ad unit
 *
 * Fetches a banner and applies it to a texture. If no `cursor-target` and `collision`
 * is found on the object, they will be created automatically (with box shape in group 1).
 *
 * Make sure that you set up a cursor to enable clicking.
 */
export class ZestyBanner extends Component {
  static TypeName = 'zesty-banner';
  static Properties = {
    /* Your banner ad unit ID */
    adUnit: Property.string(''),
    /* The default banner format, determines aspect ratio */
    format: Property.enum(['tall', 'wide', 'square'], 'square'),
    /* The default banner visual style */
    style: Property.enum(['standard', 'minimal', 'transparent'], 'transparent'),
    /* Scale width of the object to banner ratio (see format) and set the collider */
    scaleToRatio: Property.bool(true),
    /* Texture property to set after banner is loaded. Leave "auto" to detect from
    * known pipelines (Phong Opaque Textured, Flat Opaque Textured) */
    textureProperty: Property.string('auto'),
    /* Whether to assign the banner to the alphaMaskTexture property of the material */
    assignAlphaMaskTexture: Property.bool(true),
    beacon: Property.bool(true),
    /* Load IPFS gateways and default image uris at runtime, if false at build time */
    dynamicFormats: Property.bool(true),
    /* Automatically creates a collision and cursor-target components, if there isn't one */
    createAutomaticCollision: Property.bool(true),
    /* Load networking logic at runtime, if false at build time */
    dynamicNetworking: Property.bool(false),
  };
  static onRegister(engine) {
    engine.registerComponent(CursorTarget);
  }

  init() {
    this.formats = Object.values(formats);
    this.formatKeys = Object.keys(formats);
    this.styleKeys = ['standard', 'minimal', 'transparent'];
  }

  start() {
    this.mesh = this.object.getComponent(MeshComponent);
    if (!this.mesh) {
      throw new Error("'zesty-banner ' missing mesh component");
    }

    if (this.createAutomaticCollision) {
      this.collision =
        this.object.getComponent(CollisionComponent) ||
        this.object.addComponent(CollisionComponent, {
          collider: Collider.Box,
          group: 0x2
        });

      this.cursorTarget =
        this.object.getComponent(CursorTarget) || this.object.addComponent(CursorTarget);
        this.cursorTarget.onClick.add(this.onClick.bind(this));
    }

    if (this.dynamicFormats) {
      let formatsScript = document.createElement('script');

      formatsScript.onload = () => {
        this.formatsOverride = zestyFormats.formats;
      };
      formatsScript.setAttribute('src', formatsLink);
      formatsScript.setAttribute('crossorigin', 'anonymous');
      document.body.appendChild(formatsScript);
    }

    if (this.dynamicNetworking) {
      import(networkingLink).then(value => {
        this.zestyNetworking = Object.assign({}, value);
        this.startLoading();
      });
    } else {
      this.startLoading();
    }
  }

  startLoading() {
    this.loadBanner(
      this.adUnit,
      this.formatKeys[this.format],
      this.styleKeys[this.style]
    ).then(banner => {
      this.banner = banner;
      if (this.scaleToRatio) {
        /* Make banner always 1 meter height, adjust width according to banner aspect ratio */
        this.height = this.object.scalingLocal[1];
        this.object.resetScaling();
        if (this.createAutomaticCollision) {
          this.collision.extents = [
            this.formats[this.format].width * this.height,
            this.height,
            0.1
          ];
        }
        this.object.scale([this.formats[this.format].width * this.height, this.height, 1.0]);
      }
      const m = this.mesh.material.clone();
      if (this.textureProperty === 'auto') {
        const pipeline = m.shader;
        if (pipeline === 'Phong Opaque Textured') {
          m.diffuseTexture = banner.texture;
          m.alphaMaskThreshold = 0.3;
        } else if (pipeline === 'Flat Opaque Textured') {
          m.flatTexture = banner.texture;
          m.alphaMaskThreshold = 0.8;
        } else {
          throw Error(
            "'zesty-banner' unable to apply banner texture: unsupported pipeline " + pipeline
          );
        }
        this.mesh.material = m;
        this.mesh.material.alphaMaskTexture = banner.texture;
      } else {
        this.mesh.material[this.textureProperty] = banner.texture;
        this.mesh.material.alphaMaskTexture = banner.texture;
      }
      if (this.beacon) {
        this.dynamicNetworking ?
          this.zestyNetworking.sendOnLoadMetric(this.adUnit, this.banner.campaignId) :
          sendOnLoadMetric(this.adUnit, this.banner.campaignId);
      }
    });
  }

  onClick() {
    if (this.banner?.url) {
      if (this.engine.xr) {
        this.engine.xr.session.end().then(this.executeClick.bind(this));
      } else if (this.engine.xrSession) {
        this.engine.xrSession.end().then(this.executeClick.bind(this));
      } else {
        this.executeClick();
      }
    }
  }

  executeClick() {
    openURL(this.banner.url);
    if (this.beacon) {
      this.dynamicNetworking ?
        this.zestyNetworking.sendOnClickMetric(this.adUnit, this.banner.campaignId) :
        sendOnClickMetric(this.adUnit, this.banner.campaignId);
    }
  }

  async loadBanner(adUnit, format, style) {
    const activeCampaign = this.dynamicNetworking ?
      await this.zestyNetworking.fetchCampaignAd(adUnit, format, style) :
      await fetchCampaignAd(adUnit, format, style);

    const { asset_url: image, cta_url: url } = activeCampaign.Ads[0];
    this.campaignId = activeCampaign.CampaignId;

    return this.engine.textures.load(image, '').then(texture => {
      return { texture, imageSrc: image, url, campaignId: activeCampaign.CampaignId };
    });
  }
}
