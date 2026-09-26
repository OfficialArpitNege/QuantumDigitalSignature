import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { channelCurve, TIMELINE } from '../three/paths.js';
import { scrollStore } from '../scrollStore.js';
import { on } from '../events.js';

/** A short-lived burst of shards at the message's current position, played
 * when the person clicks "Reject" in the decision section. */
export default function RejectBurst() {
  const [bursts, setBursts] = useState([]);

  useEffect(
    () =>
      on('reject', () => {
        const mt = THREE.MathUtils.clamp(
          (scrollStore.t - TIMELINE.messageStart) / (TIMELINE.messageEnd - TIMELINE.messageStart),
          0,
          1
        );
        const origin = channelCurve.getPoint(mt);
        const id = Date.now();
        const shards = new Array(36).fill(0).map(() => ({
          dir: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
            .normalize()
            .multiplyScalar(0.8 + Math.random() * 1.2),
        }));
        setBursts((b) => [...b, { id, origin, shards, born: performance.now() }]);
        setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1000);
      }),
    []
  );

  return (
    <>
      {bursts.map((b) => (
        <Burst key={b.id} data={b} />
      ))}
    </>
  );
}

function Burst({ data }) {
  const refs = useRef([]);
  useFrame(() => {
    const age = (performance.now() - data.born) / 900;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const shard = data.shards[i];
      m.position.set(
        data.origin.x + shard.dir.x * age,
        data.origin.y + shard.dir.y * age,
        data.origin.z + shard.dir.z * age
      );
      m.material.opacity = Math.max(0, 1 - age);
    });
  });
  return (
    <group>
      {data.shards.map((_, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} position={data.origin}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color="#ff6b4a" transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
}
