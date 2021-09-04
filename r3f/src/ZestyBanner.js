import * as THREE from 'three'
import { useLoader, useThree } from "@react-three/fiber"
import { useRef, useState, Suspense, useEffect } from "react"
import { fetchNFT, fetchActiveBanner, sendMetric } from "../../utils/networking"
import { formats, defaultFormat } from '../../utils/formats';
import { Interactive } from '@react-three/xr'
import { parseProtocol } from '../../utils/helpers';

export default function ZestyBanner(props) {
  const [bannerData, setBannerData] = useState(false)

  const space = props.space ? props.space : props.adSpace;
  const format = props.format ? props.format : props.adFormat;
  console.log(format);

  const loadBanner = async (space, creator, network, format, style) => {
    const activeNFT = await fetchNFT(space, creator, network);
    const activeBanner = await fetchActiveBanner(activeNFT.uri, format, style);
    return activeBanner;
  }

  useEffect(() => {    
    loadBanner(space, props.creator, props.network, format, props.style).then((data) => {
      let banner = data.data;
      let url = banner.url || banner.properties?.url;
      if (url == 'https://www.zesty.market') {
        url = `https://app.zesty.market/space/${props.space}`;
      }
      banner.image = banner.image.match(/^.+\.(png|jpe?g)/i) ? banner.image : parseProtocol(banner.image);
      sendMetric(
        props.creator,
        space,
        banner.uri,
        banner.image,
        url,
        'load', // event
        0, // durationInMs
        'r3f' //sdkType
      );
      setBannerData(data);
    });
  }, [props.creator, space]);

  return (
    <Suspense fallback={null}>
      {bannerData &&
        <BannerPlane
          {...props}
          bannerData={bannerData}
          newSpace={space}
          newFormat={format}
        />
      }
    </Suspense>
  )
}

function BannerPlane(props) {
  const mesh = useRef();
  const { gl } = useThree();

  const texture = useLoader(THREE.TextureLoader, props.bannerData.data.image);

  const onClick = (event) => {
    let banner = props.bannerData.data;
    let url = banner.url || banner.properties?.url;
    if (url == 'https://www.zesty.market') {
        url = `https://app.zesty.market/space/${props.newSpace}`;
    }
    if (gl.xr.isPresenting) {
      const session = gl.xr.getSession()
      if (session) session.end();
    }
    window.open(url, '_blank');
    sendMetric(
      props.creator,
      props.space,
      banner.uri,
      banner.image,
      url,
      'click', // event
      0, // durationInMs
      'r3f' //sdkType
    );
  }

  return (
    <Interactive onSelect={onClick}>
      <mesh
        {...props}
        ref={mesh}
        scale={0.5}
        onClick={onClick}
        >
        <planeBufferGeometry args={[formats[props.newFormat].width * props.height, props.height]} />
        <meshBasicMaterial map={texture || undefined} />
      </mesh>
    </Interactive>
  )

}
