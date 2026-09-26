interface LoadingProps {
  message?: string;
}

export default function LoadingState({ message = 'Running Quantum Experiment…' }: LoadingProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 16, padding: '48px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>{message}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Simulating quantum teleportation and computing threat metrics…
      </div>
    </div>
  );
}
