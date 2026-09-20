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
      <div className="font-mono text-xs tracking-[0.16em] text-threat mb-4" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>THREAT ANALYSIS</div>

      <StatRow label="Signal Integrity" valueRef={sigRef} initial="100%" />
      <StatRow label="Interference" valueRef={intRef} initial="LOW" />
      <StatRow label="Anomaly" valueRef={anomRef} initial="NONE" />
      <StatRow label="Threat Level" valueRef={threatRef} initial="NOMINAL" />

      <div className="w-full h-[5px] rounded-full bg-black/[0.06] dark:bg-white/10 mt-3.5 overflow-hidden">
        <div
          ref={barRef}
          className="h-full w-0 rounded-full"
          style={{ background: 'linear-gradient(90deg,#ffb020,#ff6b4a)' }}
        />
      </div>

      <span
        ref={flagRef}
        className="inline-block mt-5 px-4 py-1.5 rounded-full font-mono text-[11px] tracking-[0.08em] opacity-0"
        style={{ background: 'rgba(255,107,74,0.12)', color: '#ff6b4a' }}
      >
        ANOMALY DETECTED
      </span>
    </div>
  );
}

function StatRow({ label, valueRef, initial }) {
  return (
    <div className="flex justify-between items-center font-mono text-[13px] mb-3.5 text-ink-soft">
      <span>{label}</span>
      <b ref={valueRef} className="text-ink font-medium">
        {initial}
      </b>
    </div>
  );
}
