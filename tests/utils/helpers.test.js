import { expect, test, describe } from '@jest/globals';
import { parseProtocol } from '../../utils/helpers';

const IPFS_TEST_URI = 'test';
const IPFS_TEST_URL = 'ipfs://test';

describe('parseProtocol', () => {
  test('parseProtocol should return a valid HTTPS URL if given an IPFS URI', () => {
    expect(parseProtocol(IPFS_TEST_URI)).toBe('https://ipfs.zesty.market/ipfs/test');
  });
  test('parseProtocol should return a valid HTTPS URL if given an ipfs:// URL', () => {
    expect(parseProtocol(IPFS_TEST_URL)).toBe('https://ipfs.zesty.market/ipfs/test');
  });
});
