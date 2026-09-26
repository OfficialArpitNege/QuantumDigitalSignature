import { useEffect, useRef, useState } from 'react';
import { subscribe } from '../scrollStore.js';
import { TIMELINE } from '../three/paths.js';
import { emit } from '../events.js';
import { ResultModal } from '../../components/ResultModal';

export default function DecisionSection() {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
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

  const handleChoice = (type) => {
    setChoice(type);
    emit(type);
    setModalOpen(true);
  };

  return (
    <>
      <div className="glass-panel max-w-[560px] mx-auto text-center pointer-events-auto"
           style={{ padding: '36px 42px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p className="eyebrow text-cyan" style={{ marginBottom: '0px' }}>05 · Security Decision</p>

        {/* Spacious Pipeline Stepper */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          margin: '4px 0 10px 0',
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.05em',
            padding: '5px 12px',
            borderRadius: '2px',
            background: step >= 1 ? '#0F0F0F' : '#FAF9F5',
            color: step >= 1 ? '#FFFFFF' : '#777777',
            border: '1.5px solid #0F0F0F',
            boxShadow: step >= 1 ? '1.5px 1.5px 0px #0F0F0F' : 'none',
            transition: 'all 0.25s ease',
          }}>
            1. MEASUREMENT
          </span>
          <span style={{ color: '#888888', fontSize: '11px', fontWeight: 700 }}>→</span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.05em',
            padding: '5px 12px',
            borderRadius: '2px',
            background: step >= 2 ? '#0F0F0F' : '#FAF9F5',
            color: step >= 2 ? '#FFFFFF' : '#777777',
            border: '1.5px solid #0F0F0F',
            boxShadow: step >= 2 ? '1.5px 1.5px 0px #0F0F0F' : 'none',
            transition: 'all 0.25s ease',
          }}>
            2. ANALYSIS
          </span>
          <span style={{ color: '#888888', fontSize: '11px', fontWeight: 700 }}>→</span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.05em',
            padding: '5px 12px',
            borderRadius: '2px',
            background: step >= 3 ? '#DC2626' : '#FAF9F5',
            color: step >= 3 ? '#FFFFFF' : '#777777',
            border: '1.5px solid #0F0F0F',
            boxShadow: step >= 3 ? '1.5px 1.5px 0px #0F0F0F' : 'none',
            transition: 'all 0.25s ease',
          }}>
            3. DECISION
          </span>
        </div>

        {/* Spacious Action Cards */}
        <div className="flex flex-row items-stretch justify-center gap-4 text-center mt-2">
          <button
            onClick={() => handleChoice('accept')}
            className="flex-1 cursor-pointer transition-transform hover:-translate-y-0.5"
            style={{
              padding: '16px 18px',
              background: choice === 'accept' ? '#F0FDF4' : '#FAF9F5',
              border: '1.5px solid #0F0F0F',
              boxShadow: choice === 'accept' ? '3px 3px 0px #15803D' : '2px 2px 0px #0F0F0F',
              borderRadius: '2px',
              textAlign: 'center',
            }}
          >
            <div className="font-bold tracking-wider flex items-center justify-center gap-1.5 mb-1.5"
                 style={{
                   fontFamily: "'Space Grotesk', sans-serif",
                   fontSize: '14px',
                   color: '#15803D',
                 }}>
              <span>✓</span> ACCEPT
            </div>
            <p className="text-[11px] leading-snug" style={{ color: '#555555', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
              Valid Signature · Forward to Receiver
            </p>
          </button>

          <button
            onClick={() => handleChoice('reject')}
            className="flex-1 cursor-pointer transition-transform hover:-translate-y-0.5"
            style={{
              padding: '16px 18px',
              background: choice === 'reject' ? '#FEF2F2' : '#FAF9F5',
              border: '1.5px solid #0F0F0F',
              boxShadow: choice === 'reject' ? '3px 3px 0px #DC2626' : '2px 2px 0px #0F0F0F',
              borderRadius: '2px',
              textAlign: 'center',
            }}
          >
            <div className="font-bold tracking-wider flex items-center justify-center gap-1.5 mb-1.5"
                 style={{
                   fontFamily: "'Space Grotesk', sans-serif",
                   fontSize: '14px',
                   color: '#DC2626',
                 }}>
              <span>✕</span> REJECT
            </div>
            <p className="text-[11px] leading-snug" style={{ color: '#555555', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
              Anomaly Detected · Discard &amp; Log
            </p>
          </button>
        </div>
      </div>

      <ResultModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        verdict={choice === 'accept' ? 'ACCEPT' : choice === 'reject' ? 'REJECT' : null}
        attackType={choice === 'reject' ? 'Interception / Eavesdropping' : undefined}
      />
    </>
  );
}
