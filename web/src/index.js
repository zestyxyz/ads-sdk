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
        this.adFormat = this.hasAttribute("adformat") ? this.getAttribute("adformat") : this.adFormat;
        this.height = this.hasAttribute("height") ? this.getAttribute("height") : this.height;
        this.width = this.hasAttribute("width") ? this.getAttribute("width") : this.width;

        // Adjust height and width after getting initial values
        let numMatch = /(\d+)/; // Will split to get an array of ["", num, suffix]
        let height = this.height.split(numMatch);
        let width = this.width.split(numMatch);
        this.height = this.hasAttribute("height") ? this.height
        : this.hasAttribute("width") ? `${width[1] / formats[this.adFormat].width}${width[2]}`
        : this.height;
        this.width = this.hasAttribute("height") ? `${height[1] * formats[this.adFormat].width}${height[2]}`
        : this.hasAttribute("width") ? this.width
        : this.width;

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