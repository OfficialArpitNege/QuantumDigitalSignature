import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * A consistent "character" built entirely from primitives so Alice, Bob and
 * Eve share one visual language: a glowing icosahedron core wrapped in two
 * crossed halo rings and a point light, distinguished only by color and
 * intensity. `pulse` (0..1) drives extra emissive/scale energy, used for
 * Eve's interference spike during the threat-detection stage.
 */
export default function CharacterNode({ position, color, glowColor, scale = 1, pulseRef }) {
  const core = useRef();
  const halo1 = useRef();
  const halo2 = useRef();
  const group = useRef();

  useFrame((_, delta) => {
    const t = performance.now() * 0.001;
    if (core.current) {
      core.current.rotation.y = t * 0.4;
      core.current.rotation.x = t * 0.15;
    }
    if (halo1.current) halo1.current.rotation.z = t * 0.3;
    if (halo2.current) halo2.current.rotation.z = -t * 0.22;

    const pulse = pulseRef ? pulseRef.current : 0;
    if (core.current) {
      core.current.material.emissiveIntensity = 0.6 + pulse * 1.2;
    }
    if (group.current) {
      const s = scale + pulse * 0.25;
      group.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={group} position={position}>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.3}
          roughness={0.25}
          flatShading
        />
      </mesh>
      <mesh ref={halo1} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[1.15, 0.02, 8, 64]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.55} />
      </mesh>
      <mesh ref={halo2} rotation={[-Math.PI / 2.6, Math.PI / 4, 0]}>
        <torusGeometry args={[1.15, 0.02, 8, 64]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.55} />
      </mesh>
      <pointLight color={color} intensity={2.2} distance={8} />
    </group>
  );
}
