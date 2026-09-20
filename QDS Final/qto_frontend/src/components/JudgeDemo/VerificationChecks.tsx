import type { ProtocolVerificationResult } from '../../types/api';

interface Props {
  verification: ProtocolVerificationResult;
  revealed: number; // 0–4, how many checks are visible (animated reveal)
}

const CHECKS = [
  { key: 'signature_valid' as const,  label: 'Signature Valid',  desc: 'HMAC cryptographic check' },
  { key: 'identity_valid' as const,   label: 'Identity Valid',   desc: 'Sender authentication' },
  { key: 'replay_valid' as const,     label: 'Replay Valid',     desc: 'Session freshness' },
  { key: 'quantum_valid' as const,    label: 'Quantum Valid',    desc: 'State fidelity ≥ threshold' },
];

export default function VerificationChecks({ verification, revealed }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {CHECKS.map((c, i) => {
        const visible = i < revealed;
        const ok = verification[c.key];
        if (!visible) {
          return (
            <div key={c.key} className="check-item pending" style={{ opacity: 0.3 }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>○</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</div>
                <div style={{ fontSize: 10, opacity: 0.6 }}>{c.desc}</div>
              </div>
            </div>
          );
        }
        return (
          <div
            key={c.key}
            className={`check-item ${ok ? 'pass' : 'fail'}`}
            style={{ animation: 'qds-appear 0.3s ease' }}
          >
            <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1 }}>{ok ? '✅' : '❌'}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</div>
              <div style={{ fontSize: 10, opacity: 0.75 }}>{ok ? 'PASSED' : 'FAILED'}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
