const formats = {
    'tall': {
        width: 0.75,
        height: 1,
        style: {
            'standard': 'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-tall.png',
            'minimal': 'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-tall-minimal.png',
            'transparent': 'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-tall-transparent.png'
        }
    },
    'wide': {
        width: 4,
        height: 1,
        style: {
            'standard': 'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-wide.png',
            'minimal': 'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-wide-minimal.png',
            'transparent': 'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-wide-transparent.png'
        }
    },
    'square': {
        width: 1,
        height: 1,
        style: {
            'standard': 'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-square.png',
            'minimal': 'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-square-minimal.png',
            'transparent': 'https://ipfs.io/ipns/lib.zesty.market/assets/zesty-banner-square-transparent.png'
        }
    }
}

const defaultFormat = 'square';
const defaultStyle = 'standard';

export { formats, defaultFormat, defaultStyle };