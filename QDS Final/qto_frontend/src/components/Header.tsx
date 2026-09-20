import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ThemeToggle from './ThemeToggle';
import type { Theme } from './ThemeToggle';

type BackendStatus = 'checking' | 'connected' | 'unavailable';

interface HeaderProps {
  theme?: Theme;
  onToggleTheme?: () => void;
  onOpenHowItWorks?: () => void;
  onToggleConfig?: () => void;
  showConfig?: boolean;
}

export default function Header({
  theme = 'light',
  onToggleTheme,
  onOpenHowItWorks,
  onToggleConfig,
  showConfig = false,
}: HeaderProps) {
  const [status, setStatus] = useState<BackendStatus>('checking');
  const navigate = useNavigate();

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
      background: 'var(--lab-surface)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--lab-border)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'all 0.2s ease',
    }}>
      <div className="container" style={{ maxWidth: 1280 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 0',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          {/* Left: Brand + Section title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'rgba(31, 182, 214, 0.1)',
                border: '1px solid var(--lab-border)',
                borderRadius: 100,
                padding: '6px 16px',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--lab-text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              title="Return to 3D Landing Page"
            >
              ← Back to Home
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="font-display font-semibold text-base tracking-wide whitespace-nowrap">
                QUANTUM<span style={{ color: '#1fb6d6' }}>·</span>NET
              </span>
              <span style={{ color: 'var(--lab-border)', fontSize: 16 }}>|</span>
              <span style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--lab-text-sub)',
              }}>
                Security Lab
              </span>
            </div>
          </div>

          {/* Right: Actions + Backend Status + Theme Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {onOpenHowItWorks && (
              <button
                onClick={onOpenHowItWorks}
                style={{
                  background: 'rgba(31, 182, 214, 0.12)',
                  border: '1px solid rgba(31, 182, 214, 0.3)',
                  color: '#1fb6d6',
                  padding: '6px 14px',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >📖 How It Works</button>
            )}

            {onToggleConfig && (
              <button
                onClick={onToggleConfig}
                style={{
                  background: 'var(--lab-surface-2)',
                  border: '1px solid var(--lab-border)',
                  color: 'var(--lab-text-sub)',
                  padding: '6px 14px',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >{showConfig ? '▲ Config' : '⚙ Config'}</button>
            )}

            {status === 'checking' && (
              <span className="pill pill-blue"><span className="dot dot-pulse" />Connecting…</span>
            )}
            {status === 'connected' && (
              <span className="pill pill-green" style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                borderRadius: 100,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 600,
              }}><span className="dot" style={{ background: '#10b981' }} />Backend Connected</span>
            )}
            {status === 'unavailable' && (
              <>
                <span className="pill pill-red"><span className="dot" />Unavailable</span>
                <button className="btn btn-secondary" style={{ height: 28, padding: '0 10px', fontSize: 11 }} onClick={check}>
                  Retry
                </button>
              </>
            )}

            {onToggleTheme && (
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
