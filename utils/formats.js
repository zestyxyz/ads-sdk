const assetsURL = 'https://cdn.zesty.xyz/images/zesty';

const formats = {
    'tall': {
        width: 0.75,
        height: 1,
        style: {
            'standard': `${assetsURL}/zesty-default-mobile-phone-interstitial.png`,
            'minimal': `${assetsURL}/zesty-default-mobile-phone-interstitial.png`,
            'transparent': `${assetsURL}/zesty-default-mobile-phone-interstitial.png`
        }
    },
    'wide': {
        width: 4,
        height: 1,
        style: {
            'standard': `${assetsURL}/zesty-default-billboard.png`,
            'minimal': `${assetsURL}/zesty-default-billboard.png`,
            'transparent': `${assetsURL}/zesty-default-billboard.png`
        }
    },
    'square': {
        width: 1,
        height: 1,
        style: {
            'standard': `${assetsURL}/zesty-default-med-rectangle.png`,
            'minimal': `${assetsURL}/zesty-default-med-rectangle.png`,
            'transparent': `${assetsURL}/zesty-default-med-rectangle.png`
        }
    }
}

const defaultFormat = 'square';
const defaultStyle = 'standard';

export { formats, defaultFormat, defaultStyle };