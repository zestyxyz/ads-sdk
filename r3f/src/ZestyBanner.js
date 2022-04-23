import * as THREE from 'three';
import { useRef, useState, Suspense, useEffect } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { Interactive } from '@react-three/xr';
import { fetchNFT, fetchActiveBanner, sendOnLoadMetric, sendOnClickMetric } from '../../utils/networking';
import { formats, defaultFormat, defaultStyle } from '../../utils/formats';
import { openURL, parseProtocol } from '../../utils/helpers';

export * from '../../utils/formats';
import { version } from '../package.json';

console.log('Zesty SDK Version: ', version);

export default function ZestyBanner(props) {
  const [bannerData, setBannerData] = useState(false);

  const space = props.space ? props.space : props.adSpace;
  const format = (props.format ? props.format : props.adFormat) ?? defaultFormat;

  const width = props.width ?? formats[format].width;
  const height = props.height ?? formats[format].height;

  const newStyle = props.style ?? defaultStyle;
  const beacon = props.beacon ?? true;

  const loadBanner = async (space, creator, network, format, style) => {
    const activeNFT = await fetchNFT(space, creator, network);
    const activeBanner = await fetchActiveBanner(activeNFT.uri, format, style, space);
    return activeBanner;
  };

  useEffect(() => {
    loadBanner(space, props.creator, props.network, format, newStyle).then((data) => {
      const banner = data.data;
      let url = banner.url || banner.properties?.url;
      if (url === 'https://www.zesty.market') {
        url = `https://app.zesty.market/space/${props.space}`;
      }
      banner.image = banner.image.match(/^.+\.(png|jpe?g)/i)
        ? banner.image
        : parseProtocol(banner.image);

      if (beacon) {
        sendOnLoadMetric(space);
      }

      setBannerData(data);
    });
  }, [props.creator, space]);

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
  const mesh = useRef();
  const { gl } = useThree();

  const texture = useLoader(THREE.TextureLoader, props.bannerData.data.image);

  const onClick = (event) => {
    const banner = props.bannerData.data;
    let url = banner.url || banner.properties?.url;
    if (url === 'https://www.zesty.market') {
      url = `https://app.zesty.market/space/${props.newSpace}`;
    }
    if (gl.xr.isPresenting) {
      const session = gl.xr.getSession();
      if (session) session.end();
    }
    openURL(url);
    if (props.beacon) sendOnClickMetric(props.newSpace);
  };

  return (
    <Suspense>
      <Interactive onSelect={onClick}>
        <mesh {...props} ref={mesh} scale={0.5} onClick={onClick}>
          <planeBufferGeometry
            args={[formats[props.newFormat].width * props.height, props.height]}
          />
          <meshBasicMaterial map={texture} transparent={true} />
        </mesh>
      </Interactive>
    </Suspense>
  );
}
