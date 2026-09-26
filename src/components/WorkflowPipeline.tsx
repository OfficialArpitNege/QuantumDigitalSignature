interface StageState {
  status: 'idle' | 'active' | 'complete' | 'anomaly';
}

interface Props {
  stages: StageState[];
}

const STAGE_DEFS = [
  { label: 'Message',      icon: '✉' },
  { label: 'SHA-256',      icon: '#' },
  { label: 'Signing\nMaterial', icon: '🔑' },
  { label: 'Qubit\nEncoding',   icon: '|ψ⟩' },
  { label: 'Bell\nPair',        icon: 'Φ⁺' },
  { label: 'Teleport',    icon: '→' },
  { label: 'Measure',     icon: '⊙' },
  { label: 'Statistics',  icon: '∑' },
  { label: 'Threat\nDetect',    icon: '🛡' },
];

function nodeStyle(status: StageState['status']) {
  switch (status) {
    case 'active':   return { borderColor: 'var(--color-primary)', background: 'var(--color-primary)', color: 'white', boxShadow: '0 0 0 4px var(--blue-100)' };
    case 'complete': return { borderColor: 'var(--threat-low)', background: 'var(--threat-low-bg)', color: 'var(--threat-low)' };
    case 'anomaly':  return { borderColor: 'var(--threat-crit)', background: 'var(--threat-crit-bg)', color: 'var(--threat-crit)' };
    default:         return { borderColor: 'var(--blue-200)', background: 'var(--bg-card)', color: 'var(--text-muted)' };
  }
}

function connectorColor(from: StageState, to: StageState) {
  if (from.status === 'anomaly' || to.status === 'anomaly') return 'var(--threat-crit-bd)';
  if (from.status === 'complete') return 'var(--threat-low-bd)';
  if (from.status === 'active') return 'var(--blue-300)';
  return 'var(--blue-100)';
}

export default function WorkflowPipeline({ stages }: Props) {
  const padded = [...stages];
  while (padded.length < STAGE_DEFS.length) padded.push({ status: 'idle' });

  return (
    <div className="card section">
      <div style={{ marginBottom: 20 }}>
        <div className="section-label">Process Flow</div>
        <div className="section-title">Quantum Pipeline</div>
        <div className="section-sub">End-to-end workflow from message to threat decision</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 4, gap: 0 }}>
        {STAGE_DEFS.map((stage, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72 }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%', border: '2px solid',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, transition: 'all 0.3s ease',
                fontFamily: "'JetBrains Mono', monospace",
                ...nodeStyle(padded[i].status),
              }}>
                {stage.icon}
              </div>
              <div style={{
                fontSize: 10, fontWeight: 500, color: padded[i].status !== 'idle' ? 'var(--text-secondary)' : 'var(--text-muted)',
                textAlign: 'center', marginTop: 8, lineHeight: 1.3,
                whiteSpace: 'pre-line',
              }}>
                {stage.label}
              </div>
            </div>

            {i < STAGE_DEFS.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginTop: 23,
                background: connectorColor(padded[i], padded[i + 1]),
                transition: 'background 0.3s ease',
                minWidth: 12,
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
