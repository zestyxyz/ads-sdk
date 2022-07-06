mergeInto(LibraryManager.library, {
    _sendOnLoadMetric: async function(spaceId) {
        var spaceString = UTF8ToString(spaceId);
        var userPlatform = await Module.Zesty.checkUserPlatform();
        var platform = userPlatform.platform;
        var confidence = userPlatform.confidence;
        var body = { query: `mutation { increment(eventType: visits, spaceId: "${spaceString}", platform: { name: ${platform}, confidence: ${confidence} }) { message } }` };
        
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
    _sendOnClickMetric: async function(spaceId) {
        var spaceString = UTF8ToString(spaceId);
        var userPlatform = await Module.Zesty.checkUserPlatform();
        var platform = userPlatform.platform;
        var confidence = userPlatform.confidence;
        var body = { query: `mutation { increment(eventType: clicks, spaceId: "${spaceString}", platform: { name: ${platform}, confidence: ${confidence} }) { message } }` };
        
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
    _open: function(url) {
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
    }
})