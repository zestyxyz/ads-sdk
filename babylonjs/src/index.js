import { fetchNFT, fetchActiveAd, sendMetric } from '../../utils/networking';
//import * as BABYLON from 'babylonjs';

export default class ZestyAd {
  constructor(width, height, adSpace, creator, scene) {
    const options = {
      height: height,
      width: width
    };

    this.zestyAd = BABYLON.MeshBuilder.CreatePlane('zestyad', options);
    this.zestyAd.position = new BABYLON.Vector3(0, 2, 2);

    loadAd(adSpace, creator).then(data => {
      this.zestyAd.material = data.mat;
      this.zestyAd.actionManager = new BABYLON.ActionManager(scene);
      this.zestyAd.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            window.open(data.url);
          }
        )
      );
    });
  }  
}

async function loadAd(adSpace, creator) {
  const activeNFT = await fetchNFT(adSpace, creator);
  console.log(activeNFT);
  const activeAd = await fetchActiveAd(activeNFT.uri);
  console.log(activeAd);

  // Need to add https:// if missing for page to open properly
  let url = activeAd.data.url;
  url = url.match(/^http[s]?:\/\//) ? url : 'https://' + url;

  let image = activeAd.data.image;
  image = image.match(/^.+\.(png|jpe?g)/i) ? image : `https://ipfs.zesty.market/ipfs/${image}`;

  const mat = new BABYLON.StandardMaterial('');
  mat.diffuseTexture = new BABYLON.Texture(image);

  return { mat: mat, src: image, uri: activeAd.uri, url: url }
}

window.ZestyAd = ZestyAd;