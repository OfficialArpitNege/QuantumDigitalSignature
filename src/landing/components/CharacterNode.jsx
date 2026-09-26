import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

/**
 * A consistent "character" built entirely from primitives so Sender, Receiver and
 * Attacker share one visual language: a glowing icosahedron core wrapped in two
 * crossed halo rings and a point light, distinguished only by color and
 * intensity. `pulse` (0..1) drives extra emissive/scale energy, used for
 * Attacker's interference spike during the threat-detection stage.
 */
export default function CharacterNode({ position, color, glowColor, scale = 1, pulseRef, label }) {
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

      {label && (
        <Html center position={[0, 1.45, 0]} distanceFactor={14}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#0F0F0F',
            background: '#FAF9F5',
            border: '1.5px solid #0F0F0F',
            boxShadow: '2px 2px 0px #0F0F0F',
            padding: '2px 8px',
            borderRadius: '2px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
          }}>
            <span style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: color,
              border: '1px solid #0F0F0F',
              display: 'inline-block',
            }} />
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}
