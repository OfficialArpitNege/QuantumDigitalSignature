import { useEffect, useRef, useState } from 'react';
import { subscribe } from '../scrollStore.js';
import { TIMELINE } from '../three/paths.js';
import { emit } from '../events.js';

export default function DecisionSection() {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState(null);
  const lastStep = useRef(0);

  useEffect(
    () =>
      subscribe((t) => {
        const { decisionStep1, decisionStep2, decisionStep3 } = TIMELINE;
        const s = t > decisionStep3 ? 3 : t > decisionStep2 ? 2 : t > decisionStep1 ? 1 : 0;
        if (s !== lastStep.current) {
          lastStep.current = s;
          setStep(s);
        }
      }),
    []
  );

  return (
    <div className="glass-panel max-w-[520px] mx-auto text-center pointer-events-auto"
         style={{ padding: '38px 44px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <p className="eyebrow text-cyan mb-3">05 · Verification</p>

      <div className="flex flex-col items-center gap-3.5 mb-3">
        <div className={`decision-step ${step >= 1 ? 'active text-ink' : 'text-ink-soft'}`}>
          THREAT DETECTED
        </div>
        <div className={`decision-step ${step >= 2 ? 'active text-ink' : 'text-ink-soft'}`}>
          VERIFYING MESSAGE
        </div>
        <div className={`decision-step ${step >= 3 ? 'active text-ink' : 'text-ink-soft'}`}>
          AWAITING DECISION
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => {
            setChoice('accept');
            emit('accept');
          }}
          className="flex-1 rounded-2xl px-5 py-5 border text-left font-display font-semibold text-sm transition-all hover:-translate-y-0.5 cursor-pointer"
          style={{
            borderColor: choice === 'accept' ? '#2bb673' : 'var(--glass-border)',
            color: '#2bb673',
            background: 'rgba(255,255,255,0.4)',
          }}
        >
          ✓ Accept
          <small className="block font-body font-light text-ink-soft mt-1 text-xs">
            Channel verified — message continues to Bob
          </small>
        </button>
        <button
          onClick={() => {
            setChoice('reject');
            emit('reject');
          }}
          className="flex-1 rounded-2xl px-5 py-5 border text-left font-display font-semibold text-sm transition-all hover:-translate-y-0.5 cursor-pointer"
          style={{
            borderColor: choice === 'reject' ? '#ff6b4a' : 'var(--glass-border)',
            color: '#ff6b4a',
            background: 'rgba(255,255,255,0.4)',
          }}
        >
          ✕ Reject
          <small className="block font-body font-light text-ink-soft mt-1 text-xs">
            Compromised state — message is discarded
          </small>
        </button>
      </div>
    </div>
  );
}
