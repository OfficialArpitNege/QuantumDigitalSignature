import { useNavigate } from 'react-router-dom';

interface Props {
  title?: string;
  description?: string;
}

export default function NoSimulationCard({
  title = 'NO SIMULATION DATA AVAILABLE',
  description = 'Run a quantum protocol experiment on the main laboratory page first to view details and scientific metrics.',
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="lab-glass-shell" style={{
      textAlign: 'center',
      padding: '56px 32px',
      margin: '20px 0 40px',
      color: 'var(--lab-text-sub)',
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'rgba(204, 0, 0, 0.08)',
        border: '1px solid rgba(204, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        fontSize: 28,
        color: '#cc0000',
        boxShadow: '0 8px 24px rgba(204, 0, 0, 0.1)',
      }}>
        ⚛
      </div>
      <div style={{
        fontSize: 18,
        fontWeight: 800,
        color: 'var(--lab-text)',
        marginBottom: 8,
        letterSpacing: '0.02em',
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 13,
        maxWidth: 480,
        margin: '0 auto 24px',
        lineHeight: 1.6,
        color: 'var(--lab-text-sub)',
      }}>
        {description}
      </div>
      <button
        onClick={() => navigate('/simulator')}
        className="lab-transmit-btn"
        style={{
          fontSize: 14,
          padding: '12px 28px',
        }}
      >
        ▶ GO TO EXPERIMENT
      </button>
    </div>
  );
}
