import { fetchNFT, fetchActiveBanner, sendOnLoadMetric, sendOnClickMetric } from '../../utils/networking';
import { formats, defaultFormat, defaultStyle } from '../../utils/formats';
import { openURL, parseProtocol } from '../../utils/helpers';
import { version } from '../package.json';

console.log('Zesty SDK Version: ', version);

class Zesty extends HTMLElement {
  constructor() {
    super();
    this.space = '';
    this.network = 'polygon';
    this.format = defaultFormat;
    this.bannerstyle = defaultStyle;
    this.width = '100%';
    this.height = '100%';
    this.shadow = this.attachShadow({ mode: 'open' });
    this.beacon = true;

    this.adjustHeightandWidth = this.adjustHeightandWidth.bind(this);
  }

  connectedCallback() {
    this.style.cursor = 'pointer';

    this.space = this.hasAttribute('space')
      ? this.getAttribute('space')
      : this.hasAttribute('adspace')
      ? this.getAttribute('adspace')
      : this.space;
    if (this.getAttribute('creator') !== null) {
      console.warn(`'creator' is no longer a required property of the Zesty Banner and can be omitted.`);
    }
    this.network = this.hasAttribute('network') ? this.getAttribute('network') : this.network;
    this.format = this.hasAttribute('format')
      ? this.getAttribute('format')
      : this.hasAttribute('adformat')
      ? this.getAttribute('adformat')
      : this.format;
    this.bannerstyle = this.hasAttribute('bannerstyle')
      ? this.getAttribute('bannerstyle')
      : this.bannerstyle;
    this.height = this.hasAttribute('height') ? this.getAttribute('height') : this.height;
    this.width = this.hasAttribute('width') ? this.getAttribute('width') : this.width;
    this.beacon = this.hasAttribute('beacon') ? this.getAttribute('beacon') : this.beacon;

    this.adjustHeightandWidth();

    async function loadBanner(space, creator, network, format, style, shadow, width, height, beacon) {
      const activeNFT = await fetchNFT(space, creator, network);
      const activeBanner = await fetchActiveBanner(activeNFT.uri, format, style, space);

      // Need to add https:// if missing for page to open properly
      let url = activeBanner.data.url;
      url = url.match(/^http[s]?:\/\//) ? url : 'https://' + url;

      if (url === 'https://www.zesty.market') {
        url = `https://app.zesty.market/space/${space}`;
      }

      let image = activeBanner.data.image;
      image = image.match(/^.+\.(png|jpe?g)/i) ? image : parseProtocol(image);

      const img = document.createElement('img');
      shadow.appendChild(img);
      img.setAttribute('id', activeBanner.uri);
      img.style.width = width;
      img.style.height = height;
      img.setAttribute('crossorigin', '');
      img.setAttribute('data-url', url);
      img.addEventListener('click', (e) => {
        e.preventDefault();
        openURL(url);
        if (beacon) {
          sendOnClickMetric(space);
        }
      });

      if (beacon) {
        sendOnLoadMetric(space);
      }

      if (activeBanner.data.image) {
        img.setAttribute('src', image);
        return new Promise((resolve, reject) => {
          img.onload = () => resolve({ img: img, uri: activeBanner.uri, url: url });
          img.onerror = () => reject(new Error('img load error'));
        });
      } else {
        return { id: 'blank' };
      }
    }

    loadBanner(
      this.space,
      this.creator,
      this.network,
      this.format,
      this.bannerstyle,
      this.shadow,
      this.width,
      this.height,
      this.beacon
    );
  }

  /**
   * Adjusts height and width after setting initial values in order to scale the image correctly.
   */
  adjustHeightandWidth() {
    // Use regex to split height/width and its suffix.
    // Will get an array of ['', num, suffix].
    const numMatch = /(\d+)/;
    const height = this.height.split(numMatch);
    const width = this.width.split(numMatch);
    // If height was set explicitly, keep it.
    // Otherwise, scale it off the width according to format or keep the default if neither were set.
    this.height = this.hasAttribute('height')
      ? this.height
      : this.hasAttribute('width')
      ? `${width[1] / formats[this.format].width}${width[2]}`
      : this.height;
    // If height was set explicitly, scale width off of it according to format.
    // Otherwise, use explicitly set width or use default value if neither were set.
    this.width = this.hasAttribute('height')
      ? `${height[1] * formats[this.format].width}${height[2]}`
      : this.hasAttribute('width')
      ? this.width
      : this.width;
  }
}

customElements.define('zesty-web', Zesty);
