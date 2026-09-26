interface StepDef {
  label: string;
  sub: string;
  phase: 'CLASSICAL' | 'TELEPORTATION' | 'THREAT DETECTION';
}

export default function QuantumPipelineFlow() {
  const steps: StepDef[] = [
    { label: 'MESSAGE', sub: 'Input Payload', phase: 'CLASSICAL' },
    { label: 'SHA-256', sub: 'Message Digest', phase: 'CLASSICAL' },
    { label: 'SIGNING MATERIAL', sub: 'HMAC-SHA256 Layer', phase: 'CLASSICAL' },
    { label: 'QUBIT ENCODING', sub: 'Pauli Eigenstates', phase: 'TELEPORTATION' },
    { label: 'BELL PAIR', sub: '|Φ⁺⟩ Entanglement', phase: 'TELEPORTATION' },
    { label: 'BSM MEASURE', sub: 'Bell State Basis', phase: 'TELEPORTATION' },
    { label: 'RECONSTRUCT', sub: 'Pauli Corrections', phase: 'TELEPORTATION' },
    { label: 'PROJECTIVE BASIS', sub: 'Quantum Measurement', phase: 'THREAT DETECTION' },
    { label: 'THREAT DETECTION', sub: 'Fidelity & QBER Gates', phase: 'THREAT DETECTION' },
    { label: 'VERIFICATION', sub: 'Deterministic Decision', phase: 'THREAT DETECTION' },
  ];

  return (
    <div className="lab-glass-shell" style={{ padding: '22px 26px', marginBottom: 24 }}>
      <div style={{
        fontSize: 11,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#0F0F0F',
        marginBottom: 16,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        QUANTUM PIPELINE LIFECYCLE (TELEPORTATION-BASED QDS &amp; THREAT DETECTION)
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
        gap: 10,
        position: 'relative',
      }}>
        {steps.map((step, idx) => (
          <div
            key={step.label}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 6,
              padding: '12px 10px',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 118,
            }}
          >
            <div>
              <span style={{
                fontSize: 8,
                fontWeight: 800,
                color: '#64748B',
                background: '#F1F5F9',
                padding: '2px 6px',
                borderRadius: 3,
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'inline-block',
                marginBottom: 6,
              }}>
                {step.phase}
              </span>

              <div style={{
                fontSize: 10,
                fontWeight: 800,
                color: '#0F0F0F',
                marginBottom: 4,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.05em',
              }}>
                STEP {idx < 9 ? '0' : ''}{idx + 1}
              </div>

              <div style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#0F0F0F',
                marginBottom: 4,
                letterSpacing: '0.02em',
                lineHeight: 1.25,
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                {step.label}
              </div>
            </div>

            <div style={{
              fontSize: 10,
              color: '#64748B',
              lineHeight: 1.3,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {step.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
