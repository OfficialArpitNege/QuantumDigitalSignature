export default function QuantumPipelineFlow() {
  const steps = [
    { label: 'MESSAGE', sub: 'Input payload' },
    { label: 'SHA-256', sub: 'Message Digest' },
    { label: 'SIGNING MATERIAL', sub: 'HMAC-SHA256' },
    { label: 'QUBIT ENCODING', sub: 'State prep' },
    { label: 'BELL PAIR', sub: '|Φ⁺⟩ Entangled' },
    { label: 'TELEPORT', sub: 'Quantum Channel' },
    { label: 'MEASURE', sub: 'Bell Basis' },
    { label: 'RECONSTRUCT', sub: 'Receiver\'s State' },
  ];

  return (
    <div className="lab-glass-shell" style={{ padding: '24px 28px', marginBottom: 24 }}>
      <div style={{
        fontSize: 11,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: '#cc0000',
        marginBottom: 16,
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        QUANTUM PIPELINE LIFECYCLE
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: 10,
        position: 'relative',
      }}>
        {steps.map((step, idx) => (
          <div
            key={step.label}
            style={{
              background: 'var(--lab-surface-2)',
              border: '1px solid var(--lab-border)',
              borderRadius: 12,
              padding: '12px 10px',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{
              fontSize: 9,
              fontWeight: 800,
              color: '#cc0000',
              marginBottom: 4,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              STEP 0{idx + 1}
            </div>
            <div style={{
              fontSize: 11,
              fontWeight: 800,
              color: 'var(--lab-text)',
              marginBottom: 2,
              letterSpacing: '0.02em',
            }}>
              {step.label}
            </div>
            <div style={{
              fontSize: 10,
              color: 'var(--lab-text-sub)',
            }}>
              {step.sub}
            </div>

            {idx < steps.length - 1 && (
              <div
                style={{
                  display: 'none', // handled by grid spacing/responsive layout
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
