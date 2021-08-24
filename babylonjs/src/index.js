import { fetchNFT, fetchActiveBanner, sendMetric } from '../../utils/networking';
import { formats, defaultFormat } from '../../utils/formats';
import { parseIPFS } from '../../utils/helpers';
//import * as BABYLON from 'babylonjs';

export default class ZestyBanner {
  constructor(space, creator, network, format, style, height, scene, webXRExperienceHelper = null) {
    const options = {
      height: height,
      width: formats[format].width * height
    };

    this.zestyBanner = BABYLON.MeshBuilder.CreatePlane('zestybanner', options);

    loadBanner(space, creator, network, format, style).then(data => {
      this.zestyBanner.material = data.mat;
      this.zestyBanner.actionManager = new BABYLON.ActionManager(scene);
      this.zestyBanner.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            if (webXRExperienceHelper?.baseExperience) {
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

    return this.zestyBanner;
  }  
}

async function loadBanner(space, creator, network, format, style) {
  const activeNFT = await fetchNFT(space, creator, network);
  const activeBanner = await fetchActiveBanner(activeNFT.uri, format, style);

  // Need to add https:// if missing for page to open properly
  let url = activeBanner.data.url;
  url = url.match(/^http[s]?:\/\//) ? url : 'https://' + url;

  if (url == 'https://www.zesty.market') {
    url = `https://app.zesty.market/space/${space}`;
  }

  let image = activeBanner.data.image;
  image = image.match(/^.+\.(png|jpe?g)/i) ? image : parseIPFS(image);

  const mat = new BABYLON.StandardMaterial('');
  mat.diffuseTexture = new BABYLON.Texture(image);
  mat.diffuseTexture.hasAlpha = true;

  return { mat: mat, src: image, uri: activeBanner.uri, url: url }
}

window.ZestyBanner = ZestyBanner;