mergeInto(LibraryManager.library, {
  _sendOnLoadMetric: async function (adUnitId, campaignId) {
    var adUnitString = UTF8ToString(adUnitId);
    var campaignIdString = UTF8ToString(campaignId);
    var userPlatform = await Module.Zesty.checkUserPlatform();
    var platform = userPlatform.platform;
    var confidence = userPlatform.confidence;
    var body = { query: `mutation { increment(eventType: visits, spaceId: "${adUnitString}", campaignId: \"${campaignIdString}\", platform: { name: ${platform}, confidence: ${confidence} }) { message } }` };

    try {
      await fetch('https://beacon2.zesty.market/zgraphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    } catch (e) {
      console.log("Failed to emit onload event", e.message)
    }
  },
  _sendOnClickMetric: async function (adUnitId, campaignId) {
    var adUnitString = UTF8ToString(adUnitId);
    var campaignIdString = UTF8ToString(campaignId);
    var userPlatform = await Module.Zesty.checkUserPlatform();
    var platform = userPlatform.platform;
    var confidence = userPlatform.confidence;
    var body = { query: `mutation { increment(eventType: clicks, spaceId: "${adUnitString}", campaignId: \"${campaignIdString}\", platform: { name: ${platform}, confidence: ${confidence} }) { message } }` };

    try {
      await fetch('https://beacon2.zesty.market/zgraphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    } catch (e) {
      console.log("Failed to emit onclick event", e.message)
    }
  },
  _open: function (url) {
    if (!url) return;

    var urlString = UTF8ToString(url);

    // Are we on a device that will deeplink?
    // This may need to be expanded in the future.
    if (Module.Zesty.checkOculusBrowser().match) {
      if (urlString.includes('https://www.oculus.com/experiences/quest/')) {
        setTimeout(() => {
          window.open(urlString, '_blank');
        }, 1000);
        return;
      }
    } else if (Module.Zesty.checkWolvicBrowser().match) {
      // Wolvic's pop-up blocking is more aggressive than other
      // Chromium-based XR browsers, probably due to its Firefox
      // lineage. In order to prevent clicks being caught by it,
      // construct our own modal window and directly link the
      // yes button to the window.open call.
      var modal = document.createElement('div');
      var content = document.createElement('div');
      var message = document.createElement('p');
      var yes = document.createElement('button');
      var no = document.createElement('button');

      modal.style.backgroundColor = 'rgb(0, 0, 0, 0.75)'
      modal.style.color = 'white';
      modal.style.textAlign = 'center';
      modal.style.position = 'fixed';
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.padding = '5%';
      modal.style.borderRadius = '5%';
      modal.style.transform = 'translate(-50%, -50%)';

      message.innerHTML = `<b>This billboard leads to ${urlString}. Continue?</b>`;

      yes.innerText = 'Move cursor back into window.';
      yes.style.width = '100vw';
      yes.style.height = '100vh';
      yes.onmouseenter = () => {
        yes.style.width = 'auto';
        yes.style.height = 'auto';
        yes.innerText = 'Yes';
      }
      yes.onclick = () => {
        window.open(urlString, '_blank');
        modal.remove();
      }

      no.innerText = 'No';
      no.onclick = () => {
        modal.remove();
      }

      modal.append(content);
      content.append(message);
      content.append(yes);
      content.append(no);
      document.body.append(modal);
      return;
    }
    window.open(urlString, "_blank");
  },
  _initPrebid: function (adUnitId) {
    var id = UTF8ToString(adUnitId);

    // Prebid render callbacks
    function renderAllAdUnits() {
      var winners = window.pbjs.getHighestCpmBids();
      for (var i = 0; i < winners.length; i++) {
        renderOne(winners[i]);
      }
    }

    function renderOne(winningBid) {
      if (winningBid && winningBid.adId) {
        var div = document.getElementById(winningBid.adUnitCode);
        if (div) {
          const iframe = document.createElement('iframe');
          div.appendChild(iframe);
          const iframeDoc = iframe.contentWindow.document;
          window.pbjs.renderAd(iframeDoc, winningBid.adId);
          iframe.style.display = 'none';
        }
      }
    }

    // Create prebid window objects
    window.pbjs = window.pbjs || {};
    window.pbjs.que = window.pbjs.que || [];

    // Construct an ad unit and respective div
    const adUnit = {
      code: id,
      mediaTypes: {
        banner: {
          sizes: [[300, 250]]
        }
      },
      bids: [
        {
          bidder: 'appnexus',
          params: {
            placementId: 13144370
          }
        }
      ]
    }
    const div = document.createElement('div');
    div.id = adUnit.code;
    document.body.appendChild(div);

    // Load our prebid script and add it to the page
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.zesty.xyz/sdk/zesty-prebid.js';
    document.head.appendChild(script);

    // Add our ad unit to the queue and request bids
    window.pbjs.que.push(function () {
      window.pbjs.addAdUnits([adUnit]);
    });

    window.pbjs.que.push(function () {
      window.pbjs.requestBids({
        timeout: 2000,
        bidsBackHandler: renderAllAdUnits
      });
    });
  },
  _tryGetWinningBidInfo: function () {
    if (!window.pbjs.getAllWinningBids || window.pbjs.getAllWinningBids().length === 0) {
      const returnStr = "";
      const bufferSize = lengthBytesUTF8(returnStr) + 1;
      const buffer = _malloc(bufferSize);
      stringToUTF8(returnStr, buffer, bufferSize);
      return buffer;
    } else {
      const winner = window.pbjs.getAllWinningBids()[0];
      const regex = /(?:https:\/\/)[^\s"']+?(?=["']|\s)/g;
      const matches = winner.ad.match(regex);
      const adUrl = matches[0];
      const assetUrl = matches[1];

      const returnStr = `{ "Ads": [{ "asset_url": "${assetUrl}", "cta_url": "${adUrl}" }], "CampaignId": "TestCampaign" }`;
      const bufferSize = lengthBytesUTF8(returnStr) + 1;
      const buffer = _malloc(bufferSize);
      stringToUTF8(returnStr, buffer, bufferSize);
      return buffer;
    }
  }
})