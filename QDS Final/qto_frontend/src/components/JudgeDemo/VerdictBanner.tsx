import type { ProtocolVerificationResult } from '../../types/api';

interface Props {
  verification: ProtocolVerificationResult;
}

export default function VerdictBanner({ verification }: Props) {
  const isAccept = verification.decision === 'ACCEPT';

  return (
    <div className={isAccept ? 'verdict-accept' : 'verdict-reject'} style={{
      background: '#FAF9F5',
      borderRadius: 4,
      border: '2px solid #0F0F0F',
      boxShadow: '4px 4px 0px #0F0F0F',
      padding: '24px 32px',
      marginBottom: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 32,
      flexWrap: 'wrap',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Verdict text */}
      <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
        <div style={{
          fontSize: 11,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#0F0F0F',
          marginBottom: 6,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          RECEIVER'S DETERMINISTIC DECISION
        </div>
        <div style={{
          fontSize: 48,
          fontWeight: 900,
          color: isAccept ? '#1D4ED8' : '#DC2626',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          marginBottom: 10,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          {isAccept ? 'ACCEPTED' : 'REJECTED'}
        </div>
        <div style={{
          fontSize: 13,
          color: '#333333',
          maxWidth: 480,
          lineHeight: 1.55,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {verification.reason}
        </div>
      </div>
    </div>
  );
}
