import { useState } from 'react';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false);

  const isNetworkError =
    error.toLowerCase().includes('fetch') ||
    error.toLowerCase().includes('network') ||
    error.toLowerCase().includes('failed to fetch') ||
    error.toLowerCase().includes('unavailable');

  return (
    <div style={{
      background: 'var(--threat-crit-bg)',
      border: '1px solid var(--threat-crit-bd)',
      borderRadius: 'var(--radius-md)',
      padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--threat-crit)', marginBottom: 4 }}>
            {isNetworkError ? 'Backend Connection Unavailable' : 'Experiment Failed'}
          </div>
          <div style={{ fontSize: 13, color: '#7F1D1D' }}>
            {isNetworkError
              ? 'Cannot reach the backend. Make sure it is running at the configured address.'
              : 'The experiment could not be completed. Check your inputs and try again.'}
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {onRetry && (
              <button className="btn btn-secondary" style={{ fontSize: 13, height: 34 }} onClick={onRetry}>
                ↺ Retry
              </button>
            )}
            <button
              className="btn btn-secondary"
              style={{ fontSize: 13, height: 34, color: 'var(--text-muted)' }}
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '▴ Hide Details' : '▾ Technical Details'}
            </button>
          </div>

          {showDetails && (
            <div style={{
              marginTop: 10, padding: '10px 14px',
              background: 'rgba(0,0,0,0.04)',
              borderRadius: 6,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: '#7F1D1D',
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap',
            }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
