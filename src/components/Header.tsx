import { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { api } from '../services/api';

type BackendStatus = 'checking' | 'connected' | 'unavailable';

interface HeaderProps {
  onOpenHowItWorks?: () => void;
  onToggleConfig?: () => void;
  showConfig?: boolean;
}

export default function Header({
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
    { label: 'EXPERIMENT', path: '/simulator', end: true },
    { label: '3-DEVICE DEMO ⚡', path: '/simulator/network', end: false },
    { label: 'ANALYSIS', path: '/simulator/analysis', end: false },
    { label: 'QUANTUM DATA', path: '/simulator/quantum', end: false },
    { label: 'RESEARCH', path: '/simulator/research', end: false },
  ];

  return (
    <header style={{
      background: '#FAF9F5',
      borderBottom: '2px solid #0F0F0F',
      boxShadow: '0 2px 0px #0F0F0F',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'all 0.15s ease',
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
                background: '#FAF9F5',
                border: '1.5px solid #0F0F0F',
                boxShadow: '2px 2px 0px #0F0F0F',
                borderRadius: 2,
                padding: '5px 12px',
                fontSize: 11,
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#0F0F0F',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              title="Return to 3D Landing Page"
            >
              ← HOME
            </button>

            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: 17,
              letterSpacing: '-0.02em',
              color: '#0F0F0F',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
            }}>
              Quantum<span style={{ color: '#DC2626' }}>Shield</span>
            </span>
          </div>

          {/* Center: Lab Navigation Tabs */}
          <nav className="lab-nav-tabs" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#FAF9F5',
            border: '2px solid #0F0F0F',
            padding: '4px 6px',
            borderRadius: 2,
            boxShadow: '2px 2px 0px #0F0F0F',
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
                  padding: '6px 14px',
                  borderRadius: 2,
                  fontSize: 11,
                  fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.06em',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  color: isActive ? '#FFFFFF' : '#0F0F0F',
                  background: isActive ? '#DC2626' : 'transparent',
                  border: isActive ? '1.5px solid #0F0F0F' : '1.5px solid transparent',
                  boxShadow: isActive ? '2px 2px 0px #0F0F0F' : 'none',
                })}
              >
                <span>{tab.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right: Actions + Theme Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {onOpenHowItWorks && (
              <button
                onClick={onOpenHowItWorks}
                style={{
                  background: '#FAF9F5',
                  border: '1.5px solid #0F0F0F',
                  boxShadow: '2px 2px 0px #0F0F0F',
                  color: '#DC2626',
                  padding: '6px 14px',
                  borderRadius: 2,
                  fontSize: 11,
                  fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >HOW IT WORKS</button>
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
            {status === 'unavailable' && (
              <>
                <span className="pill pill-red"><span className="dot" />Unavailable</span>
                <button className="btn btn-secondary" style={{ height: 28, padding: '0 10px', fontSize: 11 }} onClick={check}>
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

