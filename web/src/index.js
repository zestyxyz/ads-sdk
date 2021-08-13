import { fetchNFT, fetchActiveAd } from '../../utils/networking'
import { formats, defaultFormat } from '../../utils/formats';

class Zesty extends HTMLElement {
    constructor() {
        super();
        this.adSpace = "";
        this.creator = "";
        this.network = "polygon";
        this.adFormat = defaultFormat;
        this.width = "100%";
        this.height = "100%";
        this.shadow = this.attachShadow({mode: 'open'});

        this.adjustHeightandWidth = this.adjustHeightandWidth.bind(this);
    }

    connectedCallback() {
        this.style.cursor = "pointer";
        
        this.adSpace = this.getAttribute("adspace");
        this.creator = this.getAttribute("creator");
        this.network = this.hasAttribute("network") ? this.getAttribute("network") : this.network;
        this.adFormat = this.hasAttribute("adformat") ? this.getAttribute("adformat") : this.adFormat;
        this.height = this.hasAttribute("height") ? this.getAttribute("height") : this.height;
        this.width = this.hasAttribute("width") ? this.getAttribute("width") : this.width;

        this.adjustHeightandWidth();

        async function loadAd(adSpace, creator, network, adFormat, shadow, width, height) {
            const activeNFT = await fetchNFT(adSpace, creator, network);
            const activeAd = await fetchActiveAd(activeNFT.uri, adFormat);

            // Need to add https:// if missing for page to open properly
            let url = activeAd.data.url;
            url = url.match(/^http[s]?:\/\//) ? url : 'https://' + url;

            if (url == 'https://www.zesty.market') {
                url = `https://app.zesty.market/space/${adSpace}`;
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

        loadAd(this.adSpace, this.creator, this.network, this.adFormat, this.shadow, this.width, this.height);
    }

    /**
     * Adjusts height and width after setting initial values in order to scale the image correctly.
     */
    adjustHeightandWidth() {
        // Use regex to split height/width and its suffix.
        // Will get an array of ["", num, suffix].
        let numMatch = /(\d+)/;
        let height = this.height.split(numMatch);
        let width = this.width.split(numMatch);
        // If height was set explicitly, keep it. 
        // Otherwise, scale it off the width according to format or keep the default if neither were set.
        this.height = this.hasAttribute("height") ? this.height
        : this.hasAttribute("width") ? `${width[1] / formats[this.adFormat].width}${width[2]}`
        : this.height;
        // If height was set explicitly, scale width off of it according to format. 
        // Otherwise, use explicitly set width or use default value if neither were set.
        this.width = this.hasAttribute("height") ? `${height[1] * formats[this.adFormat].width}${height[2]}`
        : this.hasAttribute("width") ? this.width
        : this.width;
    }
}

customElements.define("zesty-web", Zesty);