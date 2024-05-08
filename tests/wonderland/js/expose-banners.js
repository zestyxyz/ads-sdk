import { Component, Property } from '@wonderlandengine/api';

/**
 * This component exposes the banners in the scene for testing purposes.
 */
export class ExposeBanners extends Component {
    static TypeName = 'expose-banners';
    static Properties = {
        banner1Object: Property.object(),
        banner2Object: Property.object(),
        banner3Object: Property.object(),
        banner4Object: Property.object(),
        banner5Object: Property.object(),
        banner6Object: Property.object(),
        banner7Object: Property.object(),
        banner8Object: Property.object(),
        banner9Object: Property.object(),
    };

    start() {
        this.banner1 = this.banner1Object.getComponent('zesty-banner');
        this.banner2 = this.banner2Object.getComponent('zesty-banner');
        this.banner3 = this.banner3Object.getComponent('zesty-banner');
        this.banner4 = this.banner4Object.getComponent('zesty-banner');
        this.banner5 = this.banner5Object.getComponent('zesty-banner');
        this.banner6 = this.banner6Object.getComponent('zesty-banner');
        this.banner7 = this.banner7Object.getComponent('zesty-banner');
        this.banner8 = this.banner8Object.getComponent('zesty-banner');
        this.banner9 = this.banner9Object.getComponent('zesty-banner');
        window.testBanners = [
            this.banner1,
            this.banner2, 
            this.banner3, 
            this.banner4, 
            this.banner5,
            this.banner6, 
            this.banner7, 
            this.banner8,
            this.banner9
        ]
    }
};
