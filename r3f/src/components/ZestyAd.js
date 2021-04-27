import * as THREE from 'three'
import { useLoader, useThree } from "@react-three/fiber"
import { useRef, useState, Suspense, useEffect } from "react"
import { fetchNFT, fetchActiveAd, sendMetric } from "../utils/networking"
import { Interactive } from '@react-three/xr'

export default function ZestyAd(props) {
  const [adData, setAdData] = useState(false)

  const loadAd = async (tokenGroup, publisher) => {
    const activeNFT = await fetchNFT(tokenGroup, publisher);
    const activeAd = await fetchActiveAd(activeNFT.uri);
    return activeAd;
  }

  useEffect(() => {
    loadAd(props.tokenGroup, props.publisher).then((data) => {
      const ad = data.data;
      const cta = ad.cta || ad.properties?.cta;
      if(cta){
        sendMetric(
          props.publisher,
          props.tokenGroup,
          ad.uri,
          ad.image,
          cta,
          'load', // event
          0, // durationInMs
        );
      }
      setAdData(data);
    });
  }, [props.publisher, props.tokenGroup]);

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
    const cta = ad.cta || ad.properties?.cta;
    if(cta) {
      if(gl.xr.isPresenting){
        const session = gl.xr.getSession()
        if(session) session.end();
      }
      window.open(cta, '_blank');
      sendMetric(
        props.publisher,
        props.tokenGroup,
        ad.uri,
        ad.image,
        cta,
        'click', // event
        0, // durationInMs
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
        <meshBasicMaterial map={texture || undefined}/>
      </mesh>
    </Interactive>
  )

}
