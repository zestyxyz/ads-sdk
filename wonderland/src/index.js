import { fetchNFT, fetchActiveAd, sendMetric } from '../../utils/networking'
import { formats, defaultFormat } from '../../utils/formats';

/**
 * [Zesty Market](https://zesty.market) ad space
 *
 * Fetches an ad and applies it to a texture. If no `cursor-target` and `collision`
 * is found on the object, they will be created automatically (with box shape in group 1).
 *
 * Make sure that you set up a cursor to enable clicking.
 */
WL.registerComponent('zesty-ad', {
    /* Your creator id */
    creator: {type: WL.Type.String},
    /* Your ad space index */
    adSpace: {type: WL.Type.Int},
    /* The network to connect to */
    network: {type: WL.Type.Enum, values: ['rinkeby', 'polygon' ], default: 'polygon'},
    /* The default ad format, determines aspect ratio */
    adFormat: {type: WL.Type.Enum, values: Object.keys(formats), default: defaultFormat},
    /* Scale the object to ad ratio (3:4) and set the collider */
    scaleToRatio: {type: WL.Type.Bool, default: true},
    /* Height of the ad, if `scaleToRatio` is enabled. Width will be determined
     * from the 3:4 ad ratio, hence, default 0.75 for height of 1.0. */
    height: {type: WL.Type.Float, default: 1.0},
    /* Texture property to set after ad is loaded. Leave "auto" to detect from
     * known pipelines (Phong Opaque Textured, Flat Opaque Textured) */
    textureProperty: {type: WL.Type.String, default: 'auto'},
}, {
    init: function() {        
        this.mesh = this.object.getComponent('mesh');
        if(!this.mesh) {
            throw new Error("'zesty-ad' missing mesh component");
        }

        this.collision = this.object.getComponent('collision') || this.object.addComponent('collision', {
            collider: WL.Collider.Box,
            group: 0x2,
        });

        this.formats = Object.values(formats);
        this.formatKeys = Object.keys(formats);
    },

    start: function() {
        // Moved from init to start due to strange issue where this.clickFunctions would be null
        this.cursorTarget = this.object.getComponent('cursor-target') || this.object.addComponent('cursor-target');
        this.cursorTarget.addClickFunction(this.onClick.bind(this));
        
        this.loadAd(this.adSpace, this.creator, this.formatKeys[this.adFormat]).then(ad => {
            this.ad = ad;

            if(this.scaleToRatio) {
              /* Make ad always 1 meter height, adjust width according to ad aspect ratio */
              this.object.resetScaling();
              this.collision.extents = [this.formats[this.adFormat].width * this.height, this.height, 0.1];
              this.object.scale([this.formats[this.adFormat].width * this.height, this.height, 1.0]);
            }
            /* WL.Material.shader will be renamed to pipeline at some point,
             * supporting as many API versions as possible. */
            const m = this.mesh.material;
            if(this.textureProperty === "auto") {
              const pipeline = m.pipeline || m.shader;
              if(pipeline == 'Phong Opaque Textured') {
                  m.diffuseTexture = ad.texture;
              } else if(pipeline == 'Flat Opaque Textured') {
                  m.flatTexture = ad.texture;
              } else {
                throw Error("'zesty-ad' unable to apply ad texture: unsupported pipeline " + m.shader);
              }
            } else {
                this.mesh.material[this.textureProperty] = ad.texture;
            }

            sendMetric(this.creator, this.adSpace, this.ad.uri, this.ad.src, this.ad.cta, 'load', 0, 'wonderland');
        });
    },

    onClick: function() {
        if(this.ad.url) {
            if(WL.session) {
              /* Try again after session ended */
              WL.session.end().then(_ => this.onClick.bind(this));
              return;
            }
            window.open(this.ad.url, '_blank');
            sendMetric(this.creator, this.adSpace, this.ad.uri, this.ad.imageSrc,
                this.ad.url, 'click', 0, 'wonderland');
        }
    },

    loadAd: async function(adSpace, creator, network, adFormat) {
        network = network ? 'polygon' : 'rinkeby'; // Use truthy/falsy values to get network
        const activeNFT = await fetchNFT(adSpace, creator, network);
        const activeAd = await fetchActiveAd(activeNFT.uri, adFormat);

        // Need to add https:// if missing for page to open properly
        let url = activeAd.data.url;
        url = url.match(/^http[s]?:\/\//) ? url : 'https://' + url;

        if (url == 'https://www.zesty.market') {
            url = `https://app.zesty.market/ad-space/${adSpace}`;
        }

        let image = activeAd.data.image;
        image = image.match(/^.+\.(png|jpe?g)/i) ? image : `https://ipfs.zesty.market/ipfs/${image}`;

        return WL.textures.load(image, '').then(texture => {
            activeAd.texture = texture;
            activeAd.imageSrc = image;
            activeAd.url = url;
            return activeAd;
        });
    }
});
