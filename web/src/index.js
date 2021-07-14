import { fetchNFT, fetchActiveAd } from '../../utils/networking'

class Zesty extends HTMLElement {
    constructor() {
        super();
        this.adSpace = "";
        this.creator = "";
        this.width = "100%";
        this.height = "100%";
        this.shadow = this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.adSpace = this.getAttribute("adspace");
        this.creator = this.getAttribute("creator");
        this.height = this.hasAttribute("height") ? this.getAttribute("height") : this.height;
        this.width = this.hasAttribute("width") ? this.getAttribute("width") : this.width;

        async function loadAd(adSpace, creator, shadow, width, height) {
            const activeNFT = await fetchNFT(adSpace, creator);
            const activeAd = await fetchActiveAd(activeNFT.uri);

            // Need to add https:// if missing for page to open properly
            let url = activeAd.data.url;
            url = url.match(/^http[s]?:\/\//) ? url : 'https://' + url;

            let image = activeAd.data.image;
            image = image.match(/^.+\.(png|jpe?g)/i) ? image : `https://ipfs.zesty.market/ipfs/${image}`;

            const img = document.createElement('img');
            shadow.appendChild(img)
            img.setAttribute('id', activeAd.uri);
            img.style.width = width;
            img.style.height = height;
            img.setAttribute('crossorigin', '');

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

        loadAd(this.adSpace, this.creator, this.shadow, this.width, this.height);
    }
}

customElements.define("zesty-web", Zesty);
