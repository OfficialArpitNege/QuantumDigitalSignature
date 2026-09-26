import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { channelCurve, TIMELINE } from '../three/paths.js';
import { scrollStore } from '../scrollStore.js';

const TRAIL_LEN = 40;
const SAFE_COLOR = new THREE.Color('#8ecbe0');
const THREAT_COLOR = new THREE.Color('#ff6b4a');

export default function MessagePacket({ threatColorRef }) {
  const packetRef = useRef();
  const matRef = useRef();
  const trailRef = useRef();
  const trailMatRef = useRef();
  const history = useMemo(() => [], []);

  const trailPositions = useMemo(() => new Float32Array(TRAIL_LEN * 3), []);

  useFrame(() => {
    const t = scrollStore.t;
    const { messageStart, messageEnd, eveStart, eveEnd } = TIMELINE;

    if (t < messageStart) {
      if (packetRef.current) packetRef.current.visible = false;
      return;
    }
    if (packetRef.current) packetRef.current.visible = true;

    const mt = THREE.MathUtils.clamp((t - messageStart) / (messageEnd - messageStart), 0, 1);
    const p = channelCurve.getPoint(mt);
    packetRef.current.position.copy(p);

    history.unshift(p.clone());
    if (history.length > TRAIL_LEN) history.pop();
    for (let i = 0; i < TRAIL_LEN; i++) {
      const pt = history[i] || p;
      trailPositions[i * 3] = pt.x;
      trailPositions[i * 3 + 1] = pt.y;
      trailPositions[i * 3 + 2] = pt.z;
    }
    if (trailRef.current) {
      trailRef.current.geometry.attributes.position.array.set(trailPositions);
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // color shifts to threat orange while the packet is near Eve
    const inThreatWindow = mt > eveStart + 0.04 && mt < eveEnd + 0.06;
    const targetColor = inThreatWindow ? THREAT_COLOR : SAFE_COLOR;
    if (matRef.current) matRef.current.emissive.lerp(targetColor, 0.12);
    if (trailMatRef.current) trailMatRef.current.color.lerp(targetColor, 0.12);
    if (threatColorRef) threatColorRef.current.lerp(targetColor, 0.12);
  });

  return (
    <group>
      <mesh ref={packetRef} visible={false}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial ref={matRef} color="#ffffff" emissive="#8ecbe0" emissiveIntensity={1.4} />
        <pointLight color="#8ecbe0" intensity={3} distance={4} />
      </mesh>
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={TRAIL_LEN}
            array={trailPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial ref={trailMatRef} color="#8ecbe0" size={0.05} transparent opacity={0.7} />
      </points>
    </group>
  );
}
