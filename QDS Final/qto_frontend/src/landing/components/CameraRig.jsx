import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cameraCurve, channelCurve } from '../three/paths.js';
import { scrollStore } from '../scrollStore.js';

const lookTarget = new THREE.Vector3();

export default function CameraRig() {
  useFrame(({ camera }) => {
    const t = Math.min(scrollStore.t, 0.999);
    const camP = cameraCurve.getPoint(t);
    const lerpAmount = scrollStore.reducedMotion ? 1 : 0.35;
    camera.position.lerp(camP, lerpAmount);

    const lookT = Math.min(t + 0.06, 0.999);
    const lookP = channelCurve.getPoint(lookT);
    lookTarget.lerp(lookP, lerpAmount);
    camera.lookAt(lookTarget);
  });
  return null;
}
