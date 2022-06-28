Module['Zesty'] = Module['Zesty'] || {};

Module['Zesty'].checkOculusBrowser = function() {
    // As of 5/26/22, only Oculus Browser has implemented the WebXR Hand Input Module and WebXR Layers API.
    var featureDetect = (window.XRHand != null && window.XRMediaBinding != null);
    var uaCheck = navigator.userAgent.includes('OculusBrowser');
    var confidence = featureDetect && uaCheck ? 'full' : 
                        featureDetect || uaCheck ? 'partial' : 
                        'none';
    return { match: confidence !== 'none', confidence: confidence }
}

Module['Zesty'].checkWolvicBrowser = function() {
    // While Wolvic is still shipping with a GeckoView backend, this feature detect should hold true.
    // Once versions with different backends start showing up in the wild, this will need revisiting.
    var featureDetect = (window.mozInnerScreenX != null && window.speechSynthesis == null);
    var uaCheck = navigator.userAgent.includes('Mobile VR') && !navigator.userAgent.includes('OculusBrowser');
    var confidence = featureDetect && uaCheck ? 'full' : 
                        featureDetect || uaCheck ? 'partial' : 
                        'none';
    return { match: confidence !== 'none', confidence: confidence }
}

Module['Zesty'].checkPicoBrowser = function() {
    // Pico's internal browser is a Chromium fork and seems to expose some WebXR AR modules,
    // so perform an isSessionSupported() check for immersive-vr and immersive-ar.
    var featureDetect = (navigator.xr.isSessionSupported('immersive-vr') && navigator.xr.isSessionSupported('immersive-ar'));
    var uaCheck = navigator.userAgent.includes('Pico Neo 3 Link');
    var confidence = featureDetect && uaCheck ? 'full' : 
                        featureDetect || uaCheck ? 'partial' : 
                        'none';
    return { match: confidence !== 'none', confidence: confidence }
}

Module['Zesty'].checkDesktopBrowser = function() {
    // TODO
}