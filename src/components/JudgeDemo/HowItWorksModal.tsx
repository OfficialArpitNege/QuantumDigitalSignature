interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    n: '01', title: 'Sender Signs', color: '#0284c7',
    body: 'The sender generates a SHA-256 hash of the message, then signs it using HMAC-SHA256 with a session nonce and session ID. This is the prototype classical signing layer.',
  },
  {
    n: '02', title: 'Quantum Encoding', color: '#7c3aed',
    body: 'The signature bits are mapped to qubit state vectors |ψᵢ⟩ using polar angles (θ, φ). Each bit becomes a quantum state on the Bloch sphere.',
  },
  {
    n: '03', title: 'Bell Pair Entanglement', color: '#d97706',
    body: 'An entangled Bell pair |Φ+⟩ = (|00⟩ + |11⟩) / √2 is established. One qubit goes to the sender (for Bell measurement), the other to the receiver (for Pauli correction).',
  },
  {
    n: '04', title: 'Quantum Teleportation', color: '#059669',
    body: "The sender performs a Bell-basis measurement on (|ψ⟩, the EPR qubit), obtaining two classical bits and transmitting them to the receiver. The receiver applies the Pauli ZX correction to recover |ψ⟩.",
  },
  {
    n: '05', title: 'Attacker May Attack', color: '#dc2626',
    body: 'The attacker can attempt: Forgery (tamper with signature), Replay (re-send old session), Channel Manipulation (introduce quantum noise), Impersonation (fake sender identity), or Unauthorized Verification.',
  },
  {
    n: '06', title: 'Receiver Measures', color: '#0284c7',
    body: 'The receiver receives and corrects the qubit, then performs projective X, Y, Z measurements. The receiver computes Bloch expectations and statistical quantities: Fidelity F, TV Distance D_TV, and JSD.',
  },
  {
    n: '07', title: 'Deterministic Decision', color: '#059669',
    body: null,
    rule: true,
  },
];

export default function HowItWorksModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #fecaca',
          borderRadius: 16,
          maxWidth: 680,
          width: '100%',
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #fee2e2',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: '#fff7f7',
          zIndex: 1,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#cc0000' }}>
              How Quantum Digital Signatures Work
            </div>
            <div style={{ fontSize: 11, color: '#991b1b', opacity: 0.85, marginTop: 2 }}>
              Teleportation-based QDS — evaluator quick guide
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#cc0000',
              width: 32, height: 32,
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* Steps */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, background: '#ffffff' }}>
          {STEPS.map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 14 }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: '50%',
                background: `${s.color}15`,
                border: `1.5px solid ${s.color}44`,
                color: s.color,
                fontSize: 11,
                fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{s.n}</div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>
                  {s.title}
                </div>
                {s.rule ? (
                  <div>
                    <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, marginBottom: 8 }}>
                      The receiver evaluates all four checks deterministically:
                    </div>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      background: '#fff7f7',
                      border: '1px solid #fca5a5',
                      borderRadius: 8,
                      padding: '10px 14px',
                      color: '#1e293b',
                      lineHeight: 1.8,
                    }}>
                      <div>SIG_VALID ∧ ID_VALID ∧ REPLAY_VALID ∧ QTM_VALID</div>
                      <div style={{ color: '#059669', fontWeight: 700 }}>     → ACCEPT</div>
                      <div style={{ marginTop: 4 }}>Any check fails</div>
                      <div style={{ color: '#dc2626', fontWeight: 700 }}>     → REJECT</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, fontStyle: 'italic' }}>
                      Threat score is supporting evidence only — it does NOT override this rule.
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.65 }}>
                    {s.body}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer disclaimer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #fca5a5',
          background: '#fff7f7',
          borderRadius: '0 0 16px 16px',
        }}>
          <div style={{ fontSize: 11, color: '#cc0000', lineHeight: 1.5 }}>
            <strong style={{ color: '#cc0000', fontWeight: 700 }}>Research Prototype Disclaimer:</strong> The classical signing layer (HMAC-SHA256)
            is used as a prototype — it does not constitute a formally proven quantum digital signature scheme.
            This system is a simulation of teleportation-based QDS concepts for research and educational demonstration purposes.
          </div>
        </div>
      </div>
    </div>
  );
}
