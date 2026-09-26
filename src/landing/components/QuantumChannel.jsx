import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { channelCurve } from '../three/paths.js';

export default function QuantumChannel({ threatColorRef }) {
  const tubeGeo = useMemo(() => new THREE.TubeGeometry(channelCurve, 200, 0.035, 8, false), []);
  const tubeGeoWide = useMemo(() => new THREE.TubeGeometry(channelCurve, 200, 0.09, 8, false), []);
  const tubeMat = useRef();
  const dotsRef = useRef([]);

  const dotPositions = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 26; i++) pts.push(channelCurve.getPoint(i / 25));
    return pts;
  }, []);

  useFrame(() => {
    const t = performance.now() * 0.001;
    dotsRef.current.forEach((d, i) => {
      if (d) d.material.opacity = 0.3 + 0.25 * Math.sin(t * 1.5 + i);
    });
    if (tubeMat.current && threatColorRef) {
      tubeMat.current.color.lerp(threatColorRef.current, 0.08);
    }
  });

  return (
    <group>
      <mesh geometry={tubeGeo}>
        <meshBasicMaterial ref={tubeMat} color="#8ecbe0" transparent opacity={0.55} />
      </mesh>
      <mesh geometry={tubeGeoWide}>
        <meshBasicMaterial color="#8ecbe0" transparent opacity={0.12} />
      </mesh>
      {dotPositions.map((p, i) => (
        <mesh key={i} position={p} ref={(el) => (dotsRef.current[i] = el)}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#bfe3ee" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}
