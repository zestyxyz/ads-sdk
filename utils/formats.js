const assetsURL = 'https://zesty-storage-prod.s3.amazonaws.com/images/zesty';

const formats = {
    'tall': {
        width: 0.75,
        height: 1,
        style: {
            'standard': `${assetsURL}/zesty-banner-tall.png`,
            'minimal': `${assetsURL}/zesty-banner-tall-minimal.png`,
            'transparent': `${assetsURL}/zesty-banner-tall-transparent.png`
        }
    },
    'wide': {
        width: 4,
        height: 1,
        style: {
            'standard': `${assetsURL}/zesty-banner-wide.png`,
            'minimal': `${assetsURL}/zesty-banner-wide-minimal.png`,
            'transparent': `${assetsURL}/zesty-banner-wide-transparent.png`
        }
    },
    'square': {
        width: 1,
        height: 1,
        style: {
            'standard': `${assetsURL}/zesty-banner-square.png`,
            'minimal': `${assetsURL}/zesty-banner-square-minimal.png`,
            'transparent': `${assetsURL}/zesty-banner-square-transparent.png`
        }
    }
}

const defaultFormat = 'square';
const defaultStyle = 'standard';

export { formats, defaultFormat, defaultStyle };