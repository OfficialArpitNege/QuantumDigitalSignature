import type { ProtocolVerificationResult } from '../../types/api';

interface Props {
  verification: ProtocolVerificationResult;
}

export default function VerdictBanner({ verification }: Props) {
  const isAccept = verification.decision === 'ACCEPT';
  const color = isAccept ? '#cc0000' : '#8a0000';
  const bg    = isAccept
    ? 'linear-gradient(135deg, #fff7f7 0%, #ffe3e3 60%, #ffd0d0 100%)'
    : 'linear-gradient(135deg, #fff0f0 0%, #ffd6d6 60%, #ffb8b8 100%)';
  const glow  = isAccept ? 'rgba(204,0,0,0.14)' : 'rgba(138,0,0,0.18)';

  return (
    <div style={{
      background: bg,
      borderRadius: 16,
      padding: '28px 36px',
      marginBottom: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 32,
      flexWrap: 'wrap',
      position: 'relative',
      overflow: 'hidden',
      animation: 'qds-scale-in 0.4s ease',
      boxShadow: `0 24px 48px -8px ${glow}, 0 0 0 1px ${color}30`,
    }}>
      {/* Ambient glow disc */}
      <div style={{
        position: 'absolute',
        right: -60, top: '50%',
        transform: 'translateY(-50%)',
        width: 280, height: 280,
        background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      {/* Verdict text */}
      <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
        <div style={{
          fontSize: 11,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color,
          marginBottom: 6,
        }}>
          Bob's Deterministic Decision
        </div>
        <div style={{
          fontSize: 52,
          fontWeight: 900,
          color: isAccept ? color : '#8a0000',
          letterSpacing: '-0.03em',
          lineHeight: 1,
          marginBottom: 10,
          textShadow: `0 0 40px ${color}40`,
        }}>
          {isAccept ? '✓ ACCEPTED' : '✗ REJECTED'}
        </div>
        <div style={{
          fontSize: 14,
          color: 'var(--lab-text-sub)',
          maxWidth: 440,
          lineHeight: 1.55,
        }}>
          {verification.reason}
        </div>
      </div>

      {/* Formal rule */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.75)',
        border: `1px solid ${color}30`,
        borderRadius: 10,
        padding: '14px 18px',
        flexShrink: 0,
        minWidth: 220,
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7f1d1d', marginBottom: 8 }}>
          Verification Rule
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#1e293b', lineHeight: 1.8 }}>
          <div style={{ fontWeight: 600 }}>SIG ∧ ID ∧ REPLAY ∧ QTM</div>
          <div style={{ color: '#475569', fontSize: 10 }}>All checks must pass → ACCEPT</div>
          <div style={{ marginTop: 6, color: color, fontWeight: 800, fontSize: 12 }}>
            → {verification.decision}
          </div>
        </div>
      </div>
    </div>
  );
}
