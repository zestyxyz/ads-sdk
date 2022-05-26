/**
 * @jest-environment jsdom
 */

import { expect, test, describe } from '@jest/globals';
import { checkOculusBrowser, checkWolvicBrowser, checkPicoBrowser, parseProtocol } from '../../utils/helpers';

const IPFS_TEST_URI = 'test';
const IPFS_TEST_URL = 'ipfs://test';

// Need to mock navigator vars/funcs in jest, this looks to be the easiest way
// https://github.com/facebook/jest/issues/717#issuecomment-430967110
const editableFn = _value => ({
  get: () => _value,
  set: (v) => _value = v
});
Object.defineProperty(navigator, "userAgent", editableFn(navigator.userAgent));
navigator.xr = {};
Object.defineProperty(navigator, "xr", {
  isSessionSupported: editableFn(navigator.xr)
});

// Mock functions for isSessionSupported
const onlyVRSupported = session => session === 'immersive-vr' ? true : false;
const onlyARSupported = session => session === 'immersive-ar' ? true : false;
const ARVRSupported = () => true;

describe('parseProtocol', () => {
  test('parseProtocol should return a valid HTTPS URL if given an IPFS URI', () => {
    expect(parseProtocol(IPFS_TEST_URI)).toBe('https://ipfs.zesty.market/ipfs/test');
  });
  test('parseProtocol should return a valid HTTPS URL if given an ipfs:// URL', () => {
    expect(parseProtocol(IPFS_TEST_URL)).toBe('https://ipfs.zesty.market/ipfs/test');
  });
});

describe('checkOculusBrowser', () => {
  beforeEach(() => {
    window.XRHand = null;
    window.XRMediaBinding = null;
  });

  afterAll(() => {
    window.XRHand = null;
    window.XRMediaBinding = null;
  });
  
  test(`checkOculusBrowser() should return a match with no confidence if window.XRHand and window.XRMediaBinding 
        do not exist and no valid UA string is present`, () => {
    expect(checkOculusBrowser()).toMatchObject({ match: false, confidence: 'none' });
  });
  test(`checkOculusBrowser() should return a match with partial confidence if window.XRHand is null
        and a valid UA string is present`, () => {
    window.XRHand = 1;
    global.navigator.userAgent = 'OculusBrowser';
    expect(checkOculusBrowser()).toMatchObject({ match: true, confidence: 'partial' });
  });
  test(`checkOculusBrowser() should return a match with partial confidence if window.XRMediaBinding is null
        and a valid UA string is present`, () => {
    window.XRMediaBinding = 1;
    global.navigator.userAgent = 'OculusBrowser';
    expect(checkOculusBrowser()).toMatchObject({ match: true, confidence: 'partial' });
  });
  test('checkOculusBrowser() should return a match with partial confidence if only a valid UA string is present', () => {
    global.navigator.userAgent = 'OculusBrowser';
    expect(checkOculusBrowser()).toMatchObject({ match: true, confidence: 'partial' });
  });
  test(`checkOculusBrowser() should return a match with full confidence if window.XRHand and window.XRMediaBinding
        exist and a valid UA string is present`, () => {
    window.XRHand = 1;
    window.XRMediaBinding = 1;
    global.navigator.userAgent = 'OculusBrowser';
    expect(checkOculusBrowser()).toMatchObject({ match: true, confidence: 'full' });
  });
});

describe('checkWolvicBrowser', () => {
  beforeEach(() => {
    window.XRHand = null;
    window.XRMediaBinding = null;
  });

  afterAll(() => {
    window.XRHand = null;
    window.XRMediaBinding = null;
  });
  
  test(`checkWolvicBrowser() should return a match with no confidence if window.XRHand and window.XRMediaBinding 
        do exist and no valid UA string is present`, () => {
    window.XRHand = 1;
    window.XRMediaBinding = 1;
    expect(checkWolvicBrowser()).toMatchObject({ match: false, confidence: 'none' });
  });
  test(`checkwolvicBrowser() should return a match with partial confidence if window.XRHand is present
        and a valid UA string is present`, () => {
    window.XRHand = 1;
    global.navigator.userAgent = 'Mobile VR';
    expect(checkWolvicBrowser()).toMatchObject({ match: true, confidence: 'partial' });
  });
  test(`checkWolvicBrowser() should return a match with partial confidence if window.XRMediaBinding is present
        and a valid UA string is present`, () => {
    window.XRMediaBinding = 1;
    global.navigator.userAgent = 'Mobile VR';
    expect(checkWolvicBrowser()).toMatchObject({ match: true, confidence: 'partial' });
  });
  test(`checkWolvicBrowser() should return a match with full confidence if window.XRHand and window.XRMediaBinding
        do not exist and a valid UA string is present`, () => {
    global.navigator.userAgent = 'Mobile VR';
    expect(checkWolvicBrowser()).toMatchObject({ match: true, confidence: 'full' });
  });
});

describe('checkPicoBrowser', () => {
  beforeEach(() => {
    window.XRHand = null;
    window.XRMediaBinding = null;
  });

  afterAll(() => {
    window.XRHand = null;
    window.XRMediaBinding = null;
  });
  
  test(`checkPicoBrowser() should return a match with no confidence if only isSessionSupported('immersive-vr')
        returns true and no valid UA string is present`, () => {
    navigator.xr.isSessionSupported = onlyVRSupported;
    expect(checkPicoBrowser()).toMatchObject({ match: false, confidence: 'none' });
  });
  test(`checkPicoBrowser() should return a match with no confidence if only isSessionSupported('immersive-ar')
        returns true and no valid UA string is present`, () => {
    navigator.xr.isSessionSupported = onlyARSupported;
    expect(checkPicoBrowser()).toMatchObject({ match: false, confidence: 'none' });
  });
  test(`checkPicoBrowser() should return a match with partial confidence if only isSessionSupported('immersive-vr')
        returns true and a valid UA string is present`, () => {
    navigator.xr.isSessionSupported = onlyVRSupported;
    global.navigator.userAgent = 'Pico Neo 3 Link';
    expect(checkPicoBrowser()).toMatchObject({ match: true, confidence: 'partial' });
  });
  test(`checkPicoBrowser() should return a match with partial confidence if only isSessionSupported('immersive-ar')
        returns true and a valid UA string is present`, () => {
    navigator.xr.isSessionSupported = onlyARSupported;
    global.navigator.userAgent = 'Pico Neo 3 Link';
    expect(checkPicoBrowser()).toMatchObject({ match: true, confidence: 'partial' });
  });
  test(`checkPicoBrowser() should return a match with full confidence if both isSessionSupported('immersive-ar')
        and isSessionSupported('immersive-vr') return true and a valid UA string is present`, () => {
    navigator.xr.isSessionSupported = ARVRSupported;
    global.navigator.userAgent = 'Pico Neo 3 Link';
    expect(checkPicoBrowser()).toMatchObject({ match: true, confidence: 'full' });
  });
});

describe('openURL', () => {
  // Create mock function for openURL
  const openURL = jest.fn(url => {
    if (!url) return null;
  
    if (checkOculusBrowser().match) {
      if (url.includes('https://www.oculus.com/experiences/quest/')) {
        return 'Deeplink';
      }
    }
    return 'Link';
  });
  
  test('Not passing a URL should return immediately', () => {
    openURL();
    expect(openURL.mock.results[0].value).toBe(null);
  });
  test('An Oculus Store URL should not deeplink if not on Quest', () => {
    openURL('https://www.oculus.com/experiences/quest/');
    expect(openURL.mock.results[1].value).toBe('Link');
  });
  test('An Oculus Store URL should deeplink if on Quest', () => {
    window.XRHand = 1;
    window.XRMediaBinding = 1;
    openURL('https://www.oculus.com/experiences/quest/');
    expect(openURL.mock.results[2].value).toBe('Deeplink');
  });
  test('Any other URL should link regularly', () => {
    openURL('https://app.zesty.market/');
    expect(openURL.mock.results[3].value).toBe('Link');
  });
});