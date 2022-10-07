import { getIPFSGateway } from "./helpers.js";

const formats = {
    'tall': {
        width: 0.75,
        height: 1,
        style: {
            'standard': `${getIPFSGateway()}/ipfs/QmSasURHs9AHTmJA7W98QsZ884zb6VVgFfF85Wf3HpNcBb`,
            'minimal': `${getIPFSGateway()}/ipfs/QmPCtWL6HhRJaeEPj3y26GSEofchLfWyX79kan2QZ66bbu`,
            'transparent': `${getIPFSGateway()}/ipfs/QmRiTKTFNDbe8tq7xXdWcyXqRAWsKKgbGdiz6wofrCceua`
        }
    },
    'wide': {
        width: 4,
        height: 1,
        style: {
            'standard': `${getIPFSGateway()}/ipfs/QmeBbzTnaMqedDaBRuxtjJCJMBwtbWuuXVsNNAAV6LQopF`,
            'minimal': `${getIPFSGateway()}/ipfs/QmYwZ7BxeG1drdPcPo61vH4yLaMiBo5UypymfKC6T3kehV`,
            'transparent': `${getIPFSGateway()}/ipfs/QmPHHXwUXHog4KtwYmPKU1bqCJ7MJ9mwPV799HaHE6MQS3`
        }
    },
    'square': {
        width: 1,
        height: 1,
        style: {
            'standard': `${getIPFSGateway()}/ipfs/Qmbu9MAHHxB7JCTyyt291upMMMqZCjtoqbrvDMG56Lug3z`,
            'minimal': `${getIPFSGateway()}/ipfs/QmYWsEm5m2MbVRHk4G4gUfH3qyNSiraVm5BS4FUxjfp6KU`,
            'transparent': `${getIPFSGateway()}/ipfs/QmQ3nGPFJKeTdhW3zSzgYDttARQDCbrqqh7aCSAs4Lc6pH`
        }
    }
}

const defaultFormat = 'square';
const defaultStyle = 'standard';

export { formats, defaultFormat, defaultStyle };