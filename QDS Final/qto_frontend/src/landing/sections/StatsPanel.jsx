import { useEffect, useRef } from 'react';
import { subscribe } from '../scrollStore.js';
import { TIMELINE } from '../three/paths.js';

export default function StatsPanel() {
  const sigRef = useRef();
  const intRef = useRef();
  const anomRef = useRef();
  const threatRef = useRef();
  const barRef = useRef();
  const flagRef = useRef();

  useEffect(
    () =>
      subscribe((t) => {
        const { eveStart, eveEnd } = TIMELINE;
        const eveT = Math.min(Math.max((t - eveStart) / (eveEnd - eveStart), 0), 1);

        if (sigRef.current) sigRef.current.textContent = `${Math.round(100 - eveT * 38)}%`;
        if (intRef.current)
          intRef.current.textContent = eveT < 0.25 ? 'LOW' : eveT < 0.6 ? 'MODERATE' : 'HIGH';
        if (anomRef.current)
          anomRef.current.textContent = eveT < 0.4 ? 'NONE' : eveT < 0.75 ? 'SCANNING' : 'DETECTED';
        if (threatRef.current)
          threatRef.current.textContent =
            eveT < 0.4 ? 'NOMINAL' : eveT < 0.75 ? 'ELEVATED' : 'CRITICAL';
        if (barRef.current) barRef.current.style.width = `${(eveT * 100).toFixed(0)}%`;
        if (flagRef.current) flagRef.current.style.opacity = eveT > 0.7 ? '1' : '0';
      }),
    []
  );

  return (
    <div className="glass-panel w-[400px] ml-auto pointer-events-auto"
         style={{ padding: '38px 44px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="font-mono text-xs tracking-[0.14em] mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: '#DC2626' }}>
        DETECTION ENGINE · STATISTICAL ANALYSIS
      </div>

      <StatRow label="State Fidelity (F)" valueRef={sigRef} initial="100%" />
      <StatRow label="Quantum Bit Error (QBER)" valueRef={intRef} initial="LOW" />
      <StatRow label="Measurement Variance" valueRef={anomRef} initial="NONE" />
      <StatRow label="Threat Classification" valueRef={threatRef} initial="NOMINAL" />

      <div style={{
        width: '100%',
        height: '6px',
        background: '#FAF9F5',
        border: '1.5px solid #0F0F0F',
        borderRadius: '2px',
        marginTop: '14px',
        overflow: 'hidden',
      }}>
        <div
          ref={barRef}
          style={{ height: '100%', width: '0%', background: '#DC2626', transition: 'width 0.1s linear' }}
        />
      </div>

      <span
        ref={flagRef}
        className="inline-block mt-4 px-3 py-1 font-mono text-[11px] tracking-[0.08em] opacity-0"
        style={{
          background: '#FAF9F5',
          color: '#DC2626',
          border: '1.5px solid #0F0F0F',
          boxShadow: '2px 2px 0px #0F0F0F',
          borderRadius: 2,
          fontWeight: 800,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        ANOMALOUS BEHAVIOUR DETECTED
      </span>
    </div>
  );
}

function StatRow({ label, valueRef, initial }) {
  return (
    <div className="flex justify-between items-center font-mono text-[12px] mb-3.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <span style={{ color: '#555555', fontWeight: 700 }}>{label}</span>
      <b ref={valueRef} style={{ color: '#0F0F0F', fontWeight: 800 }}>
        {initial}
      </b>
    </div>
  );
}
