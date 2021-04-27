import './App.css';
import ZestyAd from './components/ZestyAd';
import { OrbitControls, Stats } from '@react-three/drei';
import { VRCanvas, DefaultXRControllers } from '@react-three/xr'

function App() {


  return (
    <>
    <VRCanvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />
      <ZestyAd
       tokenGroup={'01f2h4pgjz2mmrfggz2vzhfdck'}
       publisher={'0xa1F14fc2CCb14EA4856208dC21d9b77B83C2134d'}
       position={[0, -1, 0]} />
      <Stats />
      <DefaultXRControllers />
    </VRCanvas>
    </>
  );
}

export default App;
