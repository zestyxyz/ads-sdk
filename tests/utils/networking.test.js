import { expect, test, describe } from '@jest/globals';
import { fetchNFT, parseGraphResponse, fetchActiveBanner } from '../../utils/networking';

const MOCK_ADDRESS = '0x0000000000000000000000000000000000000000';
const MOCK_SPACE = '0';
const MOCK_GRAPH_RESPONSE_NOT_200 = {
    status: "400"
}
const MOCK_GRAPH_RESPONSE_NO_TOKENDATAS = {
    status: "200",
    data: {
        data: {
            tokenDatas: []
        }
    }
}
const MOCK_GRAPH_RESPONSE_NO_SELLERNFTSETTING = {
    status: "200",
    data: {
        data: {
            tokenDatas: [
                {
                    sellerNFTSetting: {}
                }
            ]
        }
    }
}
const MOCK_GRAPH_RESPONSE_NO_SELLERAUCTIONS = {
    status: "200",
    data: {
        data: {
            tokenDatas: [
                {
                    sellerNFTSetting: {
                        sellerAuctions: []
                    }
                }
            ]
        }
    }
}
const MOCK_GRAPH_RESPONSE_NO_BUYERCAMPAIGNS = {
    status: "200",
    data: {
        data: {
            tokenDatas: [
                {
                    sellerNFTSetting: {
                        sellerAuctions: [
                            {
                                buyerCampaigns: [],
                                buyerCampaignsApproved: [false]
                            }
                        ]
                    }
                }
            ]
        }
    }
}
const MOCK_GRAPH_RESPONSE_BUYERCAMPAIGN_NOT_APPROVED = {
    status: "200",
    data: {
        data: {
            tokenDatas: [
                {
                    sellerNFTSetting: {
                        sellerAuctions: [
                            {
                                buyerCampaigns: [
                                    {
                                        id: '0',
                                        uri: ''
                                    }
                                ],
                                buyerCampaignsApproved: [
                                    false
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    }
}
const MOCK_GRAPH_RESPONSE_VALID = {
    status: "200",
    data: {
        data: {
            tokenDatas: [
                {
                    sellerNFTSetting: {
                        sellerAuctions: [
                            {
                                buyerCampaigns: [
                                    {
                                        id: '0',
                                        uri: ''
                                    }
                                ],
                                buyerCampaignsApproved: [
                                    true
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    }
}
const URI_UNDEFINED = {uri: undefined};
const VALID_AUCTION = {id: '0', uri: ''};
const DEFAULT_URI_CONTENT = {
    name: 'Default banner',
    description: 'This is the default banner that would be displayed ipsum',
    image: expect.any(String),
    url: 'https://www.zesty.market'
}
const VALID_URI = 'QmYK3pR7AZ8TpQonQJyctZRPCR7gaDag9z6ZwoAs1YxBAa'

describe('fetchNFT', () => {
    test('fetchNFT should not return a falsy value', () => {
        return expect(fetchNFT(MOCK_SPACE, MOCK_ADDRESS)).resolves.not.toBeFalsy();
    });
});

describe('parseGraphResponse', () => {
    test('parseGraphResponse should return {uri: undefined} if status is not 200', () => {
        expect(parseGraphResponse(MOCK_GRAPH_RESPONSE_NOT_200)).toStrictEqual(URI_UNDEFINED);
    });
    test('parseGraphResponse should return {uri: undefined} if tokenDatas is empty', () => {
        expect(parseGraphResponse(MOCK_GRAPH_RESPONSE_NO_TOKENDATAS)).toStrictEqual(URI_UNDEFINED);
    });
    test('parseGraphResponse should return {uri: undefined} if sellerNFTSetting is empty', () => {
        expect(parseGraphResponse(MOCK_GRAPH_RESPONSE_NO_SELLERNFTSETTING)).toStrictEqual(URI_UNDEFINED);
    });
    test('parseGraphResponse should return {uri: undefined} if sellerAuctions is empty', () => {
        expect(parseGraphResponse(MOCK_GRAPH_RESPONSE_NO_SELLERAUCTIONS)).toStrictEqual(URI_UNDEFINED);
    });
    test('parseGraphResponse should return {uri: undefined} if buyerCampaigns is empty', () => {
        expect(parseGraphResponse(MOCK_GRAPH_RESPONSE_NO_BUYERCAMPAIGNS)).toStrictEqual(URI_UNDEFINED);
    });
    test('parseGraphResponse should not return a valid auction if buyerCampaignsApproved is false', () => {
        expect(parseGraphResponse(MOCK_GRAPH_RESPONSE_BUYERCAMPAIGN_NOT_APPROVED)).not.toStrictEqual(VALID_AUCTION);
    });
    test('parseGraphResponse should return a valid auction if buyerCampaignsApproved is true', () => {
        expect(parseGraphResponse(MOCK_GRAPH_RESPONSE_VALID)).toStrictEqual(VALID_AUCTION);
    });
});

describe('fetchActiveBanner', () => {
    test('fetchActiveBanner should return a default banner if no URI is given', () => {
        return expect(fetchActiveBanner()).resolves.toMatchObject({
            uri: 'DEFAULT_URI',
            data: DEFAULT_URI_CONTENT
        });
    });
    test('fetchActiveBanner should return a valid banner if a URI is given', () => {
        return expect(fetchActiveBanner(VALID_URI, 'tall', 'standard')).resolves.toMatchObject({
            uri: expect.any(String),
            data: expect.any(Object)
        });
    });
});


