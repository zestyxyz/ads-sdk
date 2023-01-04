/* global BABYLON */

import { fetchNFT, fetchActiveBanner, sendOnLoadMetric, sendOnClickMetric } from '../../utils/networking';
import { formats } from '../../utils/formats';
import { openURL, parseProtocol } from '../../utils/helpers';
import { version } from '../package.json';

console.log('Zesty SDK Version: ', version);

export default class ZestyBanner {
  constructor(space, network, format, style, height, scene, webXRExperienceHelper = null, beacon = true) {
    const options = {
      height: height,
      width: formats[format].width * height
    };

    this.zestyBanner = BABYLON.MeshBuilder.CreatePlane('zestybanner', options);

    loadBanner(space, network, format, style).then(data => {
      this.zestyBanner.material = data.mat;
      this.zestyBanner.actionManager = new BABYLON.ActionManager(scene);

      if (beacon) {
        sendOnLoadMetric(space);
      }

      this.zestyBanner.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
          if (webXRExperienceHelper?.baseExperience) {
            webXRExperienceHelper.baseExperience.sessionManager.exitXRAsync().then(() => {
              openURL(data.url);
            });
          } else {
            openURL(data.url);
          }
          if (beacon) {
            sendOnClickMetric(space);
          }
        })
      );
    });

    return this.zestyBanner;
  }
}

async function loadBanner(space, network, format, style) {
  const activeNFT = await fetchNFT(space, network);
  const activeBanner = await fetchActiveBanner(activeNFT.uri, format, style, space);

  const { image, url } = activeBanner.data;

  const mat = new BABYLON.StandardMaterial('');
  mat.diffuseTexture = new BABYLON.Texture(image);
  mat.diffuseTexture.hasAlpha = true;

  return { mat: mat, src: image, uri: activeBanner.uri, url: url };
}

window.ZestyBanner = ZestyBanner;
