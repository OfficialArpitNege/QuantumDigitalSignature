import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

const COUNT = 2500;

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
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={COUNT}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#9fd3e3" size={0.04} transparent opacity={0.55} />
      </points>
      <FloatingSpheres />
      <FloatingKetLabels />
    </group>
  );
}

const SPHERE_COUNT = 55;

function FloatingSpheres() {
  const groupRef = useRef();

  const spheresData = useMemo(() => {
    return Array.from({ length: SPHERE_COUNT }, (_, i) => ({
      initialPos: [
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 30 - 8,
      ],
      scale: 0.08 + Math.random() * 0.15,
      speedX: 0.2 + Math.random() * 0.3,
      speedY: 0.15 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.25 + Math.random() * 0.3,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const data = spheresData[i];
      if (!data) return;
      child.position.x = data.initialPos[0] + Math.sin(t * data.speedX + data.phase) * 1.5;
      child.position.y = data.initialPos[1] + Math.cos(t * data.speedY + data.phase) * 1.2;
      child.position.z = data.initialPos[2] + Math.sin(t * 0.2 + data.phase) * 0.8;
    });
  });

  return (
    <group ref={groupRef}>
      {spheresData.map((data, index) => (
        <mesh key={index} position={data.initialPos} scale={data.scale}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={data.opacity}
            wireframe={false}
          />
        </mesh>
      ))}
    </group>
  );
}

const KET_COUNT = 16;
const KET_SYMBOLS = ['|0⟩', '|1⟩', '|φ⟩'];

function FloatingKetLabels() {
  const groupRef = useRef();

  const ketData = useMemo(() => {
    return Array.from({ length: KET_COUNT }, (_, i) => ({
      text: KET_SYMBOLS[i % KET_SYMBOLS.length],
      initialPos: [
        (Math.random() - 0.5) * 38,
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 25 - 6,
      ],
      fontSize: 0.35 + Math.random() * 0.3,
      speedX: 0.12 + Math.random() * 0.2,
      speedY: 0.08 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.2 + Math.random() * 0.35,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const data = ketData[i];
      if (!data) return;
      // Position translation only - lock rotation strictly to maintain upright readability from left to right
      child.position.x = data.initialPos[0] + Math.sin(t * data.speedX + data.phase) * 1.2;
      child.position.y = data.initialPos[1] + Math.cos(t * data.speedY + data.phase) * 1.0;
      child.position.z = data.initialPos[2] + Math.sin(t * 0.12 + data.phase) * 0.5;
    });
  });

  return (
    <group ref={groupRef}>
      {ketData.map((data, index) => (
        <Text
          key={index}
          position={data.initialPos}
          rotation={[0, 0, 0]}
          fontSize={data.fontSize}
          color="#f97316"
          fillOpacity={data.opacity}
          transparent
          anchorX="center"
          anchorY="middle"
        >
          {data.text}
        </Text>
      ))}
    </group>
  );
}




