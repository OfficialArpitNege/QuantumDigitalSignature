import { useEffect, useState } from 'react';
import { api } from '../services/api';

type BackendStatus = 'checking' | 'connected' | 'unavailable';

export default function Header() {
  const [status, setStatus] = useState<BackendStatus>('checking');

  const check = async () => {
    setStatus('checking');
    try {
      await api.checkHealth();
      setStatus('connected');
    } catch {
      setStatus('unavailable');
    }
  };

  useEffect(() => { check(); }, []);

  return (
    <header style={{
      background: '#FFFFFF',
      borderBottom: '1px solid var(--blue-100)',
      boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40,
              background: 'var(--color-primary)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: 'white', flexShrink: 0,
            }}>⚛</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                Quantum Threat Observatory
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Teleportation-Based Quantum Signature &amp; Threat Detection
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {status === 'checking' && (
              <span className="pill pill-blue"><span className="dot dot-pulse" />Connecting…</span>
            )}
            {status === 'connected' && (
              <span className="pill pill-green"><span className="dot" />Backend Connected</span>
            )}
            {status === 'unavailable' && (
              <>
                <span className="pill pill-red"><span className="dot" />Unavailable</span>
                <button className="btn btn-secondary" style={{ height: 30, padding: '0 12px', fontSize: 12 }} onClick={check}>
                  Retry
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
