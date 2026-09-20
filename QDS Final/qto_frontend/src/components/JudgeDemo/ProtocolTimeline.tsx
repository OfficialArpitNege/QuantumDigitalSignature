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
                  borderRadius: 3,
                  background: isDone ? '#10b981' : isActive ? '#38bdf8' : '#e2e8f0',
                  boxShadow: isActive ? '0 0 8px #38bdf8' : 'none',
                  transition: 'all 0.3s ease',
                  marginBottom: 6,
                }}
              />
              <div
                style={{
                  fontSize: 10,
                  fontWeight: isActive || isDone ? 700 : 500,
                  color: isDone ? '#059669' : isActive ? '#0284c7' : '#94a3b8',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
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
