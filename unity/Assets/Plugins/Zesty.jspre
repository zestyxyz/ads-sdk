Module['Zesty'] = Module['Zesty'] || {};

Module['Zesty'].checkOculusBrowser = function() {
    // As of 5/26/22, only Oculus Browser has implemented the WebXR Hand Input Module and WebXR Layers API.
    var featureDetect = (window.XRHand != null && window.XRMediaBinding != null);
    var uaCheck = navigator.userAgent.includes('OculusBrowser');
    var confidence = featureDetect && uaCheck ? 'Full' : 
                        featureDetect || uaCheck ? 'Partial' : 
                        'None';
    return { match: confidence !== 'None', confidence: confidence }
}

Module['Zesty'].checkWolvicBrowser = function() {
    // While Wolvic is still shipping with a GeckoView backend, this feature detect should hold true.
    // Once versions with different backends start showing up in the wild, this will need revisiting.
    var featureDetect = (window.mozInnerScreenX != null && window.speechSynthesis == null);
    var uaCheck = navigator.userAgent.includes('Mobile VR') && !navigator.userAgent.includes('OculusBrowser');
    var confidence = featureDetect && uaCheck ? 'Full' : 
                        featureDetect || uaCheck ? 'Partial' : 
                        'None';
    return { match: confidence !== 'None', confidence: confidence }
}

Module['Zesty'].checkPicoBrowser = async function() {
    // Pico's internal browser is a Chromium fork and seems to expose some WebXR AR modules,
    // so perform an isSessionSupported() check for immersive-vr and immersive-ar.
    var featureDetect = "xr" in navigator && (await navigator.xr.isSessionSupported('immersive-vr') && await navigator.xr.isSessionSupported('immersive-ar'));
    var uaCheck = navigator.userAgent.includes('Pico Neo 3 Link');
    var confidence = featureDetect && uaCheck ? 'Full' : 
                        featureDetect || uaCheck ? 'Partial' : 
                        'None';
    return { match: confidence !== 'None', confidence: confidence }
}

Module['Zesty'].checkDesktopBrowser = function() {
    // We are doing a coarse check here for lack of touch-capability and no Android/Mobile string in the UA.
    var featureDetect = (navigator.maxTouchPoints === 0 || navigator.msMaxTouchPoints === 0);
    var uaCheck = !navigator.userAgent.includes('Android') && !navigator.userAgent.includes('Mobile');
    var confidence = featureDetect && uaCheck ? 'Full' : 
                        featureDetect || uaCheck ? 'Partial' : 
                        'None';
    return { match: confidence !== 'None', confidence: confidence }
}

Module['Zesty'].checkUserPlatform = async function() {
    let currentMatch = {
        platform: '',
        confidence: ''
    };
        
    if (Module['Zesty'].checkOculusBrowser().match) {
        currentMatch = { platform: 'Oculus', confidence: Module['Zesty'].checkOculusBrowser().confidence };
    } else if (Module['Zesty'].checkWolvicBrowser().match) {
        currentMatch = { platform: 'Wolvic', confidence: Module['Zesty'].checkWolvicBrowser().confidence };
    } else if (await Module['Zesty'].checkPicoBrowser().match) {
        currentMatch = { platform: 'Pico', confidence: await Module['Zesty'].checkPicoBrowser().confidence };
    } else if (Module['Zesty'].checkDesktopBrowser().match) {
        currentMatch = { platform: 'Desktop', confidence: Module['Zesty'].checkDesktopBrowser().confidence };
    } else {
        // Cannot determine platform, return a default object
        currentMatch = { platform: 'Unknown', confidence: 'None' };
    }

    return currentMatch;
}

Module['Zesty'].prebid = {
    AD_REFRESH_INTERVAL: 15000,
    prebidInit: false,
    interval: null,
    retryCount: 5,
    bids: {},
    currentTries: {}, // Maps retries to specific ad unit id
    previousUrls: {}, // Maps prior fetched URLs to specific ad unit id
    baseDivId: 'pb-slot-right-1',
    divCount: 0,
}