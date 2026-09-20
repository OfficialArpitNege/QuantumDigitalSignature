import type { ProtocolVerificationResult } from '../types/api';

interface Props {
  verification: ProtocolVerificationResult;
}

export default function ProtocolVerification({ verification }: Props) {
  const isAccept = verification.decision === 'ACCEPT';

  const items = [
    { label: 'Signature Valid', status: verification.signature_valid },
    { label: 'Identity Valid', status: verification.identity_valid },
    { label: 'Replay Valid', status: verification.replay_valid },
    { label: 'Quantum Valid', status: verification.quantum_valid },
  ];

  return (
    <div className="section">
      <div style={{ marginBottom: 12 }}>
        <div className="section-label">Formal Protocol Status</div>
        <div className="section-title">Protocol Verification</div>
      </div>

      <div
        className="card"
        style={{
          borderLeft: `6px solid ${isAccept ? 'var(--threat-low)' : 'var(--threat-high)'}`,
          background: isAccept ? 'var(--card-bg, #ffffff)' : '#fff8f8',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: '1px solid var(--border-light, #eaecf0)',
          }}
        >
          <div>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Deterministic Verification Result
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: isAccept ? 'var(--threat-low, #059669)' : 'var(--threat-high, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 2,
              }}
            >
              <span>{isAccept ? '✓' : '✗'}</span>
              <span>{verification.decision}</span>
            </div>
          </div>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              background: isAccept ? '#d1fae5' : '#fee2e2',
              color: isAccept ? '#065f46' : '#991b1b',
            }}
          >
            {isAccept ? 'VERIFIED' : 'REJECTED'}
          </div>
        </div>

        {/* Logical Check Items Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 14,
          }}
        >
          {items.map(({ label, status }) => (
            <div
              key={label}
              style={{
                background: status ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${status ? '#bbf7d0' : '#fecaca'}`,
                borderRadius: 8,
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                {label}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: status ? '#16a34a' : '#dc2626',
                }}
              >
                {status ? '✓' : '✗'}
              </div>
            </div>
          ))}
        </div>

        {/* Reason / Details Note */}
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          <strong>Reason: </strong> {verification.reason}
        </div>
      </div>
    </div>
  );
}
