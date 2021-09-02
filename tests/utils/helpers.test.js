import { expect, test, describe } from '@jest/globals';
import { parseIPFS } from '../../utils/helpers';

const IPFS_TEST_URI = 'test'
const IPFS_TEST_URL = 'ipfs://test'

describe('parseIPFS', () => {
    test('parseIPFS should return a valid HTTPS URL if given an IPFS URI', () => {
        expect(parseIPFS(IPFS_TEST_URI)).toBe('https://ipfs.zesty.market/ipfs/test');
    });
    test('parseIPFS should return a valid HTTPS URL if given an ipfs:// URL', () => {
        expect(parseIPFS(IPFS_TEST_URL)).toBe('https://ipfs.zesty.market/ipfs/test');
    });
})