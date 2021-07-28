import { fetchNFT, fetchActiveAd } from '../../utils/networking'
import { formats, defaultFormat } from '../../utils/formats';

class Zesty extends HTMLElement {
    constructor() {
        super();
        this.adSpace = "";
        this.creator = "";
        this.adFormat = defaultFormat;
        this.width = "100%";
        this.height = "100%";        
        this.shadow = this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.style.cursor = "pointer";
        this.adSpace = this.getAttribute("adspace");
        this.creator = this.getAttribute("creator");
        this.adFormat = this.hasAttribute("adFormat") ? this.getAttribute("adFormat") : this.adFormat;
        if (!formats[this.adFormat]) this.adFormat = defaultFormat;
        this.height = this.hasAttribute("height") ? this.getAttribute("height") : this.height;
        this.width = formats[this.adFormat].width * this.height;

        async function loadAd(adSpace, creator, adFormat, shadow, width, height) {
            const activeNFT = await fetchNFT(adSpace, creator);
            const activeAd = await fetchActiveAd(activeNFT.uri, adFormat);

            // Need to add https:// if missing for page to open properly
            let url = activeAd.data.url;
            url = url.match(/^http[s]?:\/\//) ? url : 'https://' + url;

            if (url == 'https://www.zesty.market') {
                url = `https://app.zesty.market/ad-space/${adSpace}`;
            }

            let image = activeAd.data.image;
            image = image.match(/^.+\.(png|jpe?g)/i) ? image : `https://ipfs.zesty.market/ipfs/${image}`;

            const img = document.createElement('img');
            shadow.appendChild(img)
            img.setAttribute('id', activeAd.uri);
            img.style.width = width;
            img.style.height = height;
            img.setAttribute('crossorigin', '');
            img.addEventListener('click', e => {
                e.preventDefault();
                window.open(url, '_blank');
            })
            if (activeAd.data.image) {
                img.setAttribute('src', image);
                return new Promise((resolve, reject) => {
                  img.onload = () => resolve({ img: img, uri: activeAd.uri, url: url });
                  img.onerror = () => reject('img load error');
                });
            } else {
            return { id: 'blank' };
            }
        }

        loadAd(this.adSpace, this.creator, this.adFormat, this.shadow, this.width, this.height);
    }
}

customElements.define("zesty-web", Zesty);
