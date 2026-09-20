import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EVE_POS, TIMELINE } from '../three/paths.js';
import { scrollStore } from '../scrollStore.js';

const COUNT = 120;

export default function Interference({ pulseRef }) {
  const refs = useRef([]);

  const seeds = useMemo(() => {
    const arr = [];
    for (let i = 0; i < COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.6 + Math.random() * 1.4;
      arr.push({
        x: EVE_POS.x + Math.cos(a) * r,
        y: EVE_POS.y + (Math.random() - 0.5) * 1.6,
        z: EVE_POS.z + Math.sin(a) * r,
      });
    }
    return arr;
  }, []);

  useFrame(() => {
    const t = scrollStore.t;
    const { eveStart, eveEnd } = TIMELINE;
    const eveT = THREE.MathUtils.clamp((t - eveStart) / (eveEnd - eveStart), 0, 1);
    const intensity = Math.sin(Math.min(eveT, 1) * Math.PI);
    if (pulseRef) pulseRef.current = intensity;

    const time = performance.now() * 0.001;
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.material.opacity = intensity * 0.8 * (0.4 + 0.6 * Math.abs(Math.sin(i + time * 20)));
    });
  });

  return (
    <group>
      {seeds.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]} ref={(el) => (refs.current[i] = el)}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color="#ff8a5c" transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}
