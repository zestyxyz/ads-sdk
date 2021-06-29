import * as THREE from 'three'
import { useLoader, useThree } from "@react-three/fiber"
import { useRef, useState, Suspense, useEffect } from "react"
import { fetchNFT, fetchActiveAd, sendMetric } from "../../utils/networking"
import { Interactive } from '@react-three/xr'

export default function ZestyAd(props) {
  const [adData, setAdData] = useState(false)

  const loadAd = async (adSpace, creator) => {
    const activeNFT = await fetchNFT(adSpace, creator);
    const activeAd = await fetchActiveAd(activeNFT.uri);
    return activeAd;
  }

  useEffect(() => {
    loadAd(props.adSpace, props.creator).then((data) => {
      const ad = data.data;
      const url = ad.url || ad.properties?.url;
      if (url) {
        sendMetric(
          props.creator,
          props.adSpace,
          ad.uri,
          ad.image,
          url,
          'load', // event
          0, // durationInMs
          'r3f' //sdkType
        );
      }
      setAdData(data);
    });
  }, [props.creator, props.adSpace]);

  return (
    <Suspense fallback={null}>
      {adData &&
        <AdPlane
          {...props}
          adData={adData}
        />
      }
    </Suspense>
  )
}

function AdPlane(props) {
  const mesh = useRef();
  const { gl } = useThree();

  const texture = useLoader(THREE.TextureLoader, props.adData.data.image);

  const onClick = (event) => {
    const ad = props.adData.data;
    const url = ad.url || ad.properties?.url;
    if (url) {
      if (gl.xr.isPresenting) {
        const session = gl.xr.getSession()
        if (session) session.end();
      }
      window.open(url, '_blank');
      sendMetric(
        props.creator,
        props.adSpace,
        ad.uri,
        ad.image,
        url,
        'click', // event
        0, // durationInMs
        'r3f' //sdkType
      );
    }
  }

  return (
    <Interactive onSelect={onClick}>
      <mesh
        {...props}
        ref={mesh}
        scale={0.5}
        onClick={onClick}
        >
        <planeBufferGeometry args={[3, 4]} />
        <meshBasicMaterial map={texture || undefined} />
      </mesh>
    </Interactive>
  )

}
