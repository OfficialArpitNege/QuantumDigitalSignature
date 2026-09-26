import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const COUNT = 900;

export default function ParticleField() {
  const pointsRef = useRef();

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 70 - 5;
      speeds[i] = 0.05 + Math.random() * 0.15;
    }
    return { positions, speeds };
  }, []);

  useFrame(() => {
    const t = performance.now() * 0.001;
    if (!pointsRef.current?.geometry?.attributes?.position) return;
    const arr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] += Math.sin(t * speeds[i] + i) * 0.0015;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#9fd3e3" size={0.06} transparent opacity={0.55} />
    </points>
  );
}
