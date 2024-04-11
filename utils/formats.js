const assetsURL = 'https://cdn.zesty.xyz/images/zesty';

const formats = {
    'tall': {
        width: 0.75,
        height: 1,
        style: {
            'standard': `${assetsURL}/zesty-banner-tall.png`,
            'minimal': `${assetsURL}/zesty-banner-tall.png`,
            'transparent': `${assetsURL}/zesty-banner-tall-transparent.png`
        }
    },
    'wide': {
        width: 4,
        height: 1,
        style: {
            'standard': `${assetsURL}/zesty-banner-wide.png`,
            'minimal': `${assetsURL}/zesty-banner-wide.png`,
            'transparent': `${assetsURL}/zesty-banner-wide-transparent.png`
        }
    },
    'square': {
        width: 1,
        height: 1,
        style: {
            'standard': `${assetsURL}/zesty-banner-square.png`,
            'minimal': `${assetsURL}/zesty-banner-square.png`,
            'transparent': `${assetsURL}/zesty-banner-square-transparent.png`
        }
    }
}

const defaultFormat = 'square';
const defaultStyle = 'standard';

export { formats, defaultFormat, defaultStyle };