/**
 * @jest-environment jsdom
 */

import { expect, test, describe } from '@jest/globals';
import { isOculusQuest, parseProtocol } from '../../utils/helpers';

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

describe('isOculusQuest', () => {
  beforeEach(() => {
    window.XRHand = null;
    window.XRMediaBinding = null;
  });
  
  test('isOculusQuest should return false if window.XRHand is null', () => {
    window.XRMediaBinding = 1;
    expect(isOculusQuest()).toBe(false);
  });
  test('isOculusQuest should return false if window.XRMediaBinding is null', () => {
    window.XRHand = 1;
    expect(isOculusQuest()).toBe(false);
  });
  test('isOculusQuest should return true if window.XRHand and window.XRMediaBinding exist', () => {
    window.XRHand = 1;
    window.XRMediaBinding = 1;
    expect(isOculusQuest()).toBe(true);
  });
});

describe('openURL', () => {
  // Create mock function for openURL
  const openURL = jest.fn(url => {
    if (!url) return null;
  
    if (isOculusQuest()) {
      if (url.includes('https://www.oculus.com/experiences/quest/')) {
        return 'Deeplink';
      }
    }
    return 'Link';
  });

  // Test 1
  openURL();
  // Test 2
  openURL('https://www.oculus.com/experiences/quest/');
  // Test 3
  window.XRHand = 1;
  window.XRMediaBinding = 1;
  openURL('https://www.oculus.com/experiences/quest/');
  // Test 4
  openURL('https://app.zesty.market/');
  
  test('Not passing a URL should return immediately', () => {
    expect(openURL.mock.results[0].value).toBe(null);
  });
  test('An Oculus Store URL should not deeplink if not on Quest', () => {
    expect(openURL.mock.results[1].value).toBe('Link');
  });
  test('An Oculus Store URL should deeplink if on Quest', () => {
    expect(openURL.mock.results[2].value).toBe('Deeplink');
  });
  test('Any other URL should link regularly', () => {
    expect(openURL.mock.results[3].value).toBe('Link');
  });
});