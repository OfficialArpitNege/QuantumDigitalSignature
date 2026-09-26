interface Props {
  currentStageIndex: number;
  isCompleted: boolean;
}

const STAGES = [
  '① Message',
  '② Signature',
  '③ Quantum Encode',
  '④ Bell Pair',
  '⑤ Teleportation',
  '⑥ Attack / Noise',
  '⑦ Measurement',
  '⑧ Verification',
  '⑨ Decision',
];

export default function ProtocolTimeline({ currentStageIndex, isCompleted }: Props) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
        <span>Protocol Execution Timeline</span>
        <span>{isCompleted ? '✓ Completed' : `Stage ${currentStageIndex + 1} of ${STAGES.length}`}</span>
      </div>

      {/* Progress Bar Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`,
          gap: 6,
        }}
      >
        {STAGES.map((label, idx) => {
          const isActive = idx === currentStageIndex && !isCompleted;
          const isDone = idx < currentStageIndex || isCompleted;

          return (
            <div key={label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  height: 6,
                  borderRadius: 2,
                  border: '1px solid #0F0F0F',
                  background: isDone ? '#1D4ED8' : isActive ? '#DC2626' : '#FAF9F5',
                  boxShadow: isActive ? '2px 2px 0px #0F0F0F' : 'none',
                  transition: 'all 0.2s ease',
                  marginBottom: 6,
                }}
              />
              <div
                style={{
                  fontSize: 10,
                  fontWeight: isActive || isDone ? 700 : 500,
                  color: isDone ? '#1D4ED8' : isActive ? '#DC2626' : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
