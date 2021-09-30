/**
 * This component exposes the banners in the scene for testing purposes.
 */
WL.registerComponent('test', {
    banner1Object: {type: WL.Type.Object},
    banner2Object: {type: WL.Type.Object},
    banner3Object: {type: WL.Type.Object},
    banner4Object: {type: WL.Type.Object},
    banner5Object: {type: WL.Type.Object},
    banner6Object: {type: WL.Type.Object},
    banner7Object: {type: WL.Type.Object},
    banner8Object: {type: WL.Type.Object},
    banner9Object: {type: WL.Type.Object}
}, {
    start: function() {
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
});
