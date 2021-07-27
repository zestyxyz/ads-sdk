import { fetchNFT, fetchActiveAd, sendMetric } from '../../utils/networking';
import formats from '../../utils/formats';
//import * as BABYLON from 'babylonjs';

export default class ZestyAd {
  constructor(adSpace, creator, adFormat, height, scene, webXRExperienceHelper = null) {
    const options = {
      height: height,
      width: formats[adFormat].width * height
    };

    this.zestyAd = BABYLON.MeshBuilder.CreatePlane('zestyad', options);

    loadAd(adSpace, creator, adFormat).then(data => {
      this.zestyAd.material = data.mat;
      this.zestyAd.actionManager = new BABYLON.ActionManager(scene);
      this.zestyAd.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            if (webXRExperienceHelper) {
              webXRExperienceHelper.baseExperience.sessionManager.exitXRAsync().then(() => {
                window.open(data.url);
              });
            }
            else {
              window.open(data.url);
            }
          }
        )
      );
    });

    return this.zestyAd;
  }  
}

async function loadAd(adSpace, creator, adFormat) {
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

  const mat = new BABYLON.StandardMaterial('');
  mat.diffuseTexture = new BABYLON.Texture(image);

  return { mat: mat, src: image, uri: activeAd.uri, url: url }
}

window.ZestyAd = ZestyAd;