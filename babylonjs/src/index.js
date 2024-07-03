/* global BABYLON */

import { fetchCampaignAd, sendOnLoadMetric, sendOnClickMetric, AD_REFRESH_INTERVAL } from '../../utils/networking';
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
    this.scene = scene;
    this.xr = webXRExperienceHelper;

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

    setInterval(() => {
      const isVisible = this.checkVisibility();
      if (isVisible) {
        loadBanner(adUnit, format, style).then(banner => {
          this.zestyBanner.material.diffuseTexture.updateURL(banner.src);
        });
      }
    }, AD_REFRESH_INTERVAL);

    return this.zestyBanner;
  }

  checkVisibility() {
    let camera = null;

    // Get the origin of the banner object
    const bannerPos = this.zestyBanner.getAbsolutePosition();
    // Get the origin of the camera
    if (this.xr?.baseExperience) {
      camera = this.xr.baseExperience.camera;
    } else {
      camera = this.scene.cameras[0];
    }
    const cameraPos = camera.globalPosition;
    // Get the direction of the camera
    const cameraDir = camera.getForwardRay().direction;
    // Calculate the difference between the object and camera origins
    const diff = bannerPos.subtract(cameraPos);
    diff.normalize();
    // Calculate the dot product of the camera's direction and the difference
    const dot = cameraDir.dot(diff);
    // Return true if the dot product is below PI/2, corresponding to a degree range of 90 degrees
    return dot < Math.PI / 2;
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
