import { useState } from 'react';
import type { ExtendedAttackType } from './ScenarioSelector';

interface Props {
  attackType: ExtendedAttackType;
}

export default function AttackBlindFlowModal({ attackType }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const getAttackLabel = () => {
    switch (attackType) {
      case 'none': return 'No Attack (Clean Transmission)';
      case 'forgery': return 'Classical Signature Bit Inversion';
      case 'replay': return 'Nonce Reuse Attack';
      case 'impersonation': return 'Sender Identity Spoofing';
      case 'channel_manipulation': return 'Entangled Qubit Phase Noise';
      default: return attackType;
    }
  };

  return (
    <div style={{
      background: '#FAF9F5',
      border: '1.5px solid #0F0F0F',
      boxShadow: '2px 2px 0px #0F0F0F',
      borderRadius: 2,
      marginBottom: 16,
      overflow: 'hidden',
    }}>
      {/* Collapsible header bar */}
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: '#FAF9F5',
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: '#0F0F0F',
          }}>
            Security Architecture
          </span>
        </div>
        <span style={{
          fontSize: 12, color: '#0F0F0F', fontWeight: 800,
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }}>▼</span>
      </button>

      {/* Expandable content */}
      {isOpen && (
        <div style={{ padding: '0 18px 16px 18px', borderTop: '1.5px solid #0F0F0F' }}>
          {/* Visual Pipeline Diagram */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            overflowX: 'auto',
            padding: '14px 0',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {/* Step 1: Ground Truth */}
            <div style={{
              background: '#FAF9F5',
              border: '1.5px solid #0F0F0F',
              boxShadow: '2px 2px 0px #0F0F0F',
              borderRadius: 2, padding: '10px 12px', textAlign: 'center', flex: 1, minWidth: 130
            }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>1. Ground Truth</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0F0F0F', marginTop: 4 }}>
                {getAttackLabel()}
              </div>
              <div style={{ fontSize: 9, color: '#555555', marginTop: 2, fontWeight: 600 }}>Physical Condition</div>
            </div>

            <div style={{ fontSize: 14, color: '#0F0F0F', fontWeight: 800 }}>➔</div>

            {/* Step 2: Protocol Evidence */}
            <div style={{
              background: '#FAF9F5',
              border: '1.5px solid #0F0F0F',
              boxShadow: '2px 2px 0px #0F0F0F',
              borderRadius: 2, padding: '10px 12px', textAlign: 'center', flex: 1, minWidth: 130
            }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase' }}>2. Evidence</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0F0F0F', marginTop: 4 }}>
                HMAC • Nonce • Fidelities
              </div>
              <div style={{ fontSize: 9, color: '#555555', marginTop: 2, fontWeight: 600 }}>Transmitted Payload</div>
            </div>

            <div style={{ fontSize: 14, color: '#0F0F0F', fontWeight: 800 }}>➔</div>

            {/* Step 3: Attack-Blind Engine */}
            <div style={{
              background: '#FAF9F5',
              border: '1.5px solid #0F0F0F',
              boxShadow: '2px 2px 0px #0F0F0F',
              borderRadius: 2, padding: '10px 12px', textAlign: 'center', flex: 1.2, minWidth: 150
            }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase' }}>3. Attack-Blind Engine</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0F0F0F', marginTop: 4 }}>
                4 Deterministic Gates
              </div>
              <div style={{ fontSize: 9, color: '#555555', marginTop: 2, fontWeight: 600 }}>
                No Attack Label Passed
              </div>
            </div>

            <div style={{ fontSize: 14, color: '#0F0F0F', fontWeight: 800 }}>➔</div>

            {/* Step 4: Decision & Post-Run Evaluation */}
            <div style={{
              background: '#FAF9F5',
              border: '1.5px solid #0F0F0F',
              boxShadow: '2px 2px 0px #0F0F0F',
              borderRadius: 2, padding: '10px 12px', textAlign: 'center', flex: 1, minWidth: 130
            }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>4. Decision</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0F0F0F', marginTop: 4 }}>
                ACCEPT / REJECT
              </div>
              <div style={{ fontSize: 9, color: '#555555', marginTop: 2, fontWeight: 600 }}>Derived Outcome</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
