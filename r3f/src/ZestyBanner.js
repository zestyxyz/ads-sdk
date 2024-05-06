import * as THREE from 'three';
import React, { useRef, useState, useEffect } from 'react';
import { sendOnLoadMetric, sendOnClickMetric, fetchCampaignAd } from '../../utils/networking';
import { formats, defaultFormat, defaultStyle } from '../../utils/formats';
import { openURL } from '../../utils/helpers';

export * from '../../utils/formats';
import { version } from '../package.json';

console.log('Zesty SDK Version: ', version);

export default function ZestyBanner(props) {
  const [bannerData, setBannerData] = useState(false);
  const [material, setMaterial] = useState(new THREE.MeshBasicMaterial());
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

  return (
    <mesh {...props} ref={mesh} scale={0.5} onClick={onClick} material={material}>
      <planeGeometry
        args={[formats[format].width * height, height]}
      />
    </mesh>
  );
}
