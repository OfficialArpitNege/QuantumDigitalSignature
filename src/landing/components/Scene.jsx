import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import CharacterNode from './CharacterNode.jsx';
import QuantumChannel from './QuantumChannel.jsx';
import ParticleField from './ParticleField.jsx';
import MessagePacket from './MessagePacket.jsx';
import Interference from './Interference.jsx';
import CameraRig from './CameraRig.jsx';
import RejectBurst from './RejectBurst.jsx';
import { ALICE_POS, BOB_POS, EVE_POS } from '../three/paths.js';
import { on } from '../events.js';

export default function Scene() {
  const evePulseRef = useRef(0);
  const threatColorRef = useRef(new THREE.Color('#8ecbe0'));

  useEffect(() => on('accept', () => threatColorRef.current.set('#8ecbe0')), []);

  return (
    <div className="canvas-fixed">
      <Canvas
        camera={{ fov: 45, near: 0.1, far: 200, position: [-2, 3, 14] }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <fogExp2 attach="fog" args={['#f6f8fb', 0.018]} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 14, 10]} intensity={0.6} />

        <ParticleField />
        <QuantumChannel threatColorRef={threatColorRef} />
        <MessagePacket threatColorRef={threatColorRef} />
        <Interference pulseRef={evePulseRef} />
        <RejectBurst />

        <CharacterNode position={ALICE_POS} label="SENDER" color="#1fb6d6" glowColor="#5fe0f4" />
        <CharacterNode
          position={BOB_POS}
          label="RECEIVER"
          color="#7c6cf6"
          glowColor="#a89bff"
          fadeStart={0.84}
          fadeEnd={0.92}
        />
        <CharacterNode
          position={EVE_POS}
          label="ATTACKER"
          color="#ff6b4a"
          glowColor="#ffb020"
          scale={0.85}
          pulseRef={evePulseRef}
        />

        <CameraRig />
      </Canvas>
    </div>
  );
}
