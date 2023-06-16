/* global BABYLON */

import { fetchCampaignAd, sendOnLoadMetric, sendOnClickMetric } from '../../utils/networking';
import { formats } from '../../utils/formats';
import { openURL } from '../../utils/helpers';
import { version } from '../package.json';

console.log('Zesty SDK Version: ', version);

export default class ZestyBanner {
  constructor(adUnit, format, style, height, scene, webXRExperienceHelper = null, beacon = true) {
    const options = {
      height: height,
      width: formats[format].width * height
    };

    this.zestyBanner = BABYLON.MeshBuilder.CreatePlane('zestybanner', options);

    loadBanner(adUnit, format, style).then(data => {
      this.zestyBanner.material = data.mat;
      this.zestyBanner.actionManager = new BABYLON.ActionManager(scene);

      if (beacon) {
        sendOnLoadMetric(adUnit, data.campaignId);
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
            sendOnClickMetric(adUnit, data.campaignId);
          }
        })
      );
    });

    return this.zestyBanner;
  }
}

async function loadBanner(adUnit, format, style) {
  const activeBanner = await fetchCampaignAd(adUnit, format, style);

  const { asset_url: image, cta_url: url } = activeBanner.Ads[0];

  const mat = new BABYLON.StandardMaterial('');
  mat.diffuseTexture = new BABYLON.Texture(image);
  mat.diffuseTexture.hasAlpha = true;

  return { mat: mat, src: image, uri: activeBanner.uri, url: url, campaignId: activeBanner.CampaignId };
}

window.ZestyBanner = ZestyBanner;
