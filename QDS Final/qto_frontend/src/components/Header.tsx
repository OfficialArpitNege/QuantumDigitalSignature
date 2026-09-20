import { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
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

  const navTabs = [
    { label: 'EXPERIMENT', path: '/simulator', end: true, icon: '🧪' },
    { label: 'ANALYSIS', path: '/simulator/analysis', end: false, icon: '🔍' },
    { label: 'QUANTUM DATA', path: '/simulator/quantum', end: false, icon: '⚛' },
    { label: 'RESEARCH', path: '/simulator/research', end: false, icon: '📊' },
  ];

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
          padding: '12px 0',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          {/* Left: Brand + Section title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'rgba(31, 182, 214, 0.1)',
                border: '1px solid var(--lab-border)',
                borderRadius: 100,
                padding: '5px 14px',
                fontSize: 12,
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="font-display font-semibold text-base tracking-wide whitespace-nowrap">
                QUANTUM<span style={{ color: '#cc0000' }}>·</span>NET
              </span>
            </div>
          </div>

          {/* Center: Lab Navigation Tabs */}
          <nav className="lab-nav-tabs" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--lab-surface-2)',
            border: '1px solid var(--lab-border)',
            padding: '4px 6px',
            borderRadius: 100,
          }}>
            {navTabs.map(tab => (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.end}
                className={({ isActive }) => `lab-nav-tab ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  color: isActive ? '#ffffff' : 'var(--lab-text-sub)',
                  background: isActive
                    ? 'linear-gradient(135deg, #cc0000 0%, #8a0000 100%)'
                    : 'transparent',
                  boxShadow: isActive ? '0 2px 10px rgba(204, 0, 0, 0.3)' : 'none',
                })}
              >
                <span style={{ fontSize: 12 }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right: Actions + Backend Status + Theme Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {onOpenHowItWorks && (
              <button
                onClick={onOpenHowItWorks}
                style={{
                  background: 'rgba(204, 0, 0, 0.08)',
                  border: '1px solid rgba(204, 0, 0, 0.3)',
                  color: '#cc0000',
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

