import * as THREE from 'three';
import { useRef, useState, Suspense, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { sendOnLoadMetric, sendOnClickMetric, fetchCampaignAd } from '../../utils/networking';
import { formats, defaultFormat, defaultStyle } from '../../utils/formats';
import { openURL } from '../../utils/helpers';

export * from '../../utils/formats';
import { version } from '../package.json';

console.log('Zesty SDK Version: ', version);

export default function ZestyBanner(props) {
  const [bannerData, setBannerData] = useState(false);

  const space = props.space;
  const format = props.format ?? defaultFormat;

  const width = props.width ?? formats[format].width;
  const height = props.height ?? formats[format].height;

  const newStyle = props.style ?? defaultStyle;
  const beacon = props.beacon ?? true;

  const loadBanner = async (space, format, style) => {
    const activeCampaign = await fetchCampaignAd(space, format, style);
    return activeCampaign[0];
  };

  useEffect(() => {
    loadBanner(space, format, newStyle).then((data) => {
      if (beacon) sendOnLoadMetric(space);
      setBannerData({ image: data.asset_url, url: data.cta_url });
    });
  }, [space]);

  return (
    <Suspense fallback={null}>
      {bannerData && (
        <BannerPlane
          {...props}
          bannerData={bannerData}
          newSpace={space}
          newFormat={format}
          width={width}
          height={height}
        />
      )}
    </Suspense>
  );
}

function BannerPlane(props) {
  let texture;
  const mesh = useRef();

  if (!props.bannerData.image) return null;

  try {
    texture = useLoader(THREE.TextureLoader, props.bannerData.image);
  } catch {
    return null;
  }

  const onClick = (event) => {
    const banner = props.bannerData.data;
    let url = banner.url || banner.properties?.url;
    if (url === 'https://www.zesty.market') {
      url = `https://app.zesty.market/space/${props.newSpace}`;
    }
    openURL(url);
    if (props.beacon) sendOnClickMetric(props.newSpace);
  };

  return (
    <mesh {...props} ref={mesh} scale={0.5} onClick={onClick}>
      <planeGeometry
        args={[formats[props.newFormat].width * props.height, props.height]}
      />
      <meshBasicMaterial map={texture} transparent={true} />
    </mesh>
  );
}
