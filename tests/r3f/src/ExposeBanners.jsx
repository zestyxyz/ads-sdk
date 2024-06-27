import { useThree } from "@react-three/fiber";

export const ExposeBanners = () => {
  const { scene } = useThree();
  window.scene = scene;

  return null;
}