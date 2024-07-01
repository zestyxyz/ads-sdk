import * as THREE from 'three';
import React, { useRef, useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { sendOnLoadMetric, sendOnClickMetric, fetchCampaignAd, AD_REFRESH_INTERVAL } from '../../utils/networking';
import { formats, defaultFormat, defaultStyle } from '../../utils/formats';
import { openURL } from '../../utils/helpers';

export * from '../../utils/formats';
import { version } from '../package.json';

console.log('Zesty SDK Version: ', version);

export default function ZestyBanner(props) {
  const [bannerData, setBannerData] = useState(false);
  const [material, setMaterial] = useState(new THREE.MeshBasicMaterial());
  const [refreshInterval, setRefreshInterval] = useState(null);
  const { scene, gl } = useThree();
  const mesh = useRef();

  const adUnit = props.adUnit;
  const format = props.format ?? defaultFormat;

  const width = props.width ?? formats[format].width;
  const height = props.height ?? formats[format].height;

  const newStyle = props.style ?? defaultStyle;
  const beacon = props.beacon ?? true;

  const loadBanner = async (adUnit, format, style) => {
    const activeCampaign = await fetchCampaignAd(adUnit, format, style);
    const { asset_url, cta_url } = activeCampaign.Ads[0];
    return { asset_url, cta_url, campaignId: activeCampaign.CampaignId }
  };

  useEffect(() => {
    loadBanner(adUnit, format, newStyle).then((data) => {
      if (beacon) sendOnLoadMetric(adUnit, data.campaignId);
      setBannerData({ image: data.asset_url, url: data.cta_url, campaignId: data.campaignId });
    });
  }, [adUnit]);

  useEffect(() => {
    if (bannerData) {
      new THREE.TextureLoader().load(bannerData.image, tex => {
        const material = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
        setMaterial(material);
      });
    }
  }, [bannerData]);


  const onClick = (event) => {
    const banner = bannerData;
    let url = banner.url || banner.properties?.url;
    openURL(url);
    if (props.beacon) sendOnClickMetric(props.adUnit, bannerData.campaignId);
  };

  const checkVisibility = () => {
    let camera = null;
    let cameraDir = new THREE.Vector3();
    let bannerPos = new THREE.Vector3();
    let cameraPos = new THREE.Vector3();

    // Get the origin of the banner object
    this.getWorldPosition(bannerPos);
    // Get the origin of the camera
    if (gl.xr.isPresenting) {
      camera = gl.xr.getCamera();
    } else {
      camera = scene.getObjectByProperty('isCamera', true);
    }
    camera.getWorldPosition(cameraPos);
    // Get the direction of the camera
    camera.getWorldDirection(cameraDir);
    // Calculate the difference between the object and camera origins
    const diff = bannerPos.sub(cameraPos);
    diff.normalize();
    // Calculate the dot product of the camera's direction and the difference
    const dot = cameraDir.dot(diff);
    // Return true if the dot product is above PI/2, corresponding to a degree range of 90 degrees
    return dot > Math.cos(Math.PI / 4);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const isVisible = checkVisibility();
      if (isVisible) {
        loadBanner(adUnit, format, newStyle).then(banner => {
          setMaterial(new THREE.MeshBasicMaterial({ map: banner.texture, transparent: true }));
          this.banner = banner;
        });
      }
    }, AD_REFRESH_INTERVAL);
    setRefreshInterval(interval);
  }, []);

  return (
    <mesh {...props} ref={mesh} scale={0.5} onClick={onClick} material={material}>
      <planeGeometry
        args={[formats[format].width * height, height]}
      />
    </mesh>
  );
}
