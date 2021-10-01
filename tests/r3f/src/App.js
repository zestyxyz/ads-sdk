import React from 'react';
//import ZestyAd from '@zestymarket/r3f-sdk'
import ZestyBanner from '../../../r3f/dist/zesty-r3f-sdk';
import { OrbitControls } from '@react-three/drei';
import { VRCanvas, DefaultXRControllers } from '@react-three/xr'

export default function App() {

  return (
    <>
    <VRCanvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <ZestyBanner
       adSpace={'3'}
       creator={'0x0030c9dd1da63af7d7df6b8332aef5fae99f536b'}
       adFormat={'tall'}
       style={'transparent'}
       height={1}
       position={[0, 0, 4]} />
      <DefaultXRControllers />
      <OrbitControls />
    </VRCanvas>
    </>
  );
}