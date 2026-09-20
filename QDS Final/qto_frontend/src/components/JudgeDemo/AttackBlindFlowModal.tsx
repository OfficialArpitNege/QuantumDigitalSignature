import { useState } from 'react';
import type { ExtendedAttackType } from './ScenarioSelector';

interface Props {
  attackType: ExtendedAttackType;
  isDark?: boolean;
}

export default function AttackBlindFlowModal({ attackType, isDark = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const getAttackLabel = () => {
    switch (attackType) {
      case 'none': return 'No Attack (Clean Transmission)';
      case 'forgery': return 'Classical Signature Bit Inversion';
      case 'replay': return 'Nonce Reuse Attack';
      case 'impersonation': return 'Sender Identity Spoofing';
      case 'channel_manipulation': return 'Entangled Qubit Phase Noise';
      case 'unauthorized_verification': return 'Unauthorized Receiver Verification';
      default: return attackType;
    }
  };

  return (
    <div style={{
      background: isDark ? 'rgba(8, 14, 26, 0.95)' : 'rgba(248, 250, 252, 0.95)',
      border: isDark ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid var(--blue-200)',
      borderRadius: 12,
      marginBottom: 16,
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
    }}>
      {/* Collapsible header bar */}
      <button
        onClick={() => setIsOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15 }}>🔒</span>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
            Security Architecture
          </span>
          <span style={{
            fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
            background: 'rgba(16, 185, 129, 0.12)', color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.25)', padding: '2px 7px', borderRadius: 4,
          }}>
            Attack-Blind
          </span>
        </div>
        <span style={{
          fontSize: 11, color: 'var(--text-muted)', fontWeight: 600,
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s ease',
          display: 'inline-block',
        }}>▼</span>
      </button>

      {/* Expandable content */}
      <div style={{
        maxHeight: isOpen ? '600px' : '0px',
        opacity: isOpen ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s ease, opacity 0.25s ease',
      }}>
        <div style={{ padding: '0 18px 16px' }}>
          {/* Visual Pipeline Diagram */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            overflowX: 'auto',
            padding: '10px 0',
          }}>
            {/* Step 1: Ground Truth */}
            <div style={{
              background: isDark ? '#1e293b' : '#ffffff',
              border: '1px dashed #f59e0b',
              borderRadius: 8, padding: '10px 12px', textAlign: 'center', flex: 1, minWidth: 130
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>1. Ground Truth (Hidden)</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                {getAttackLabel()}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 2 }}>Injects Adversarial Condition</div>
            </div>

            <div style={{ fontSize: 16, color: 'var(--text-muted)' }}>➔</div>

            {/* Step 2: Protocol Evidence */}
            <div style={{
              background: isDark ? '#1e293b' : '#ffffff',
              border: '1px solid var(--blue-300)',
              borderRadius: 8, padding: '10px 12px', textAlign: 'center', flex: 1, minWidth: 130
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>2. Protocol Evidence</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
                HMAC Bits • Nonce • Qubit Fidelities
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 2 }}>Transmitted Over Channel</div>
            </div>

            <div style={{ fontSize: 16, color: 'var(--text-muted)' }}>➔</div>

            {/* Step 3: Attack-Blind Engine */}
            <div style={{
              background: isDark ? '#0f172a' : '#eff6ff',
              border: '1px solid #3b82f6',
              borderRadius: 8, padding: '10px 12px', textAlign: 'center', flex: 1.2, minWidth: 150
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase' }}>3. Attack-Blind Engine</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                4 Deterministic Gates
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 2 }}>
                No Attack Label Passed
              </div>
            </div>

            <div style={{ fontSize: 16, color: 'var(--text-muted)' }}>➔</div>

            {/* Step 4: Decision & Post-Run Evaluation */}
            <div style={{
              background: isDark ? '#1e293b' : '#ffffff',
              border: '1px solid #10b981',
              borderRadius: 8, padding: '10px 12px', textAlign: 'center', flex: 1, minWidth: 130
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>4. Decision & Benchmark</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                ACCEPT / REJECT
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 2 }}>Compared Post-Run vs Truth</div>
            </div>
          </div>

          <div style={{
            fontSize: 11,
            color: 'var(--text-secondary)',
            background: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.7)',
            padding: '8px 12px',
            borderRadius: 6,
            marginTop: 8,
            lineHeight: 1.5,
          }}>
            <strong>Security Assurance:</strong> Ground truth label ({getAttackLabel()}) configures the physical simulator, but is <em>never</em> passed into verification or threat detection functions. Decision is independently derived from evidence.
          </div>
        </div>
      </div>
    </div>
  );
}
