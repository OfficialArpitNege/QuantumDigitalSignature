import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { subscribe } from '../scrollStore.js';

export default function Nav({ onLaunchSimulator }) {
  const fillRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const [progressVal, setProgressVal] = useState(0);

  useEffect(
    () =>
      subscribe((t) => {
        setProgressVal(t);
        if (fillRef.current) fillRef.current.style.width = `${(t * 100).toFixed(1)}%`;
      }),
    []
  );

  const scrollToSender = () => {
    (document.getElementById('s-sender') || document.getElementById('s-alice'))?.scrollIntoView({ behavior: 'smooth' });
  };

  const isSimulatorActive = location.pathname.startsWith('/simulator');
  const isJourneyActive = !isSimulatorActive && progressVal > 0.05;

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: '#FAF9F5',
        borderBottom: '2px solid #0F0F0F',
        boxShadow: '0 2px 0px #0F0F0F',
        padding: '12px 32px',
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          {/* Left: Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 900,
                fontSize: 18,
                letterSpacing: '-0.02em',
                color: '#0F0F0F',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              Quantum<span style={{ color: '#DC2626' }}>Shield</span>
            </span>
          </div>

          {/* Center: Navigation Links matching simulator tab style */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#FAF9F5',
            border: '2px solid #0F0F0F',
            padding: '4px 6px',
            borderRadius: 2,
            boxShadow: '2px 2px 0px #0F0F0F',
          }}>
            <button
              onClick={scrollToSender}
              style={{
                padding: '6px 14px',
                borderRadius: 2,
                fontSize: 11,
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.06em',
                color: isJourneyActive ? '#FFFFFF' : '#0F0F0F',
                background: isJourneyActive ? '#DC2626' : 'transparent',
                border: isJourneyActive ? '1.5px solid #0F0F0F' : '1.5px solid transparent',
                boxShadow: isJourneyActive ? '2px 2px 0px #0F0F0F' : 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.15s ease',
              }}
            >
              EXPLORE PIPELINE ↓
            </button>

            <button
              onClick={() => {
                if (onLaunchSimulator) {
                  onLaunchSimulator();
                } else {
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  navigate('/transition');
                }
              }}
              style={{
                padding: '6px 14px',
                borderRadius: 2,
                fontSize: 11,
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.06em',
                color: '#FFFFFF',
                background: '#1D4ED8',
                border: '1.5px solid #0F0F0F',
                boxShadow: '2px 2px 0px #0F0F0F',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.15s ease',
              }}
            >
              START SIMULATION ⚛
            </button>
          </div>
        </div>
      </nav>

      {/* Floating Bottom-Right Progress Indicator (Appears ONLY when user scrolls down and not transitioning) */}
      {progressVal > 0.02 && !isSimulatorActive && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 32,
          zIndex: 90,
          background: '#FAF9F5',
          border: '2px solid #0F0F0F',
          boxShadow: '3px 3px 0px #0F0F0F',
          borderRadius: 2,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: "'JetBrains Mono', monospace",
          animation: 'qds-appear 0.3s ease',
        }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#0F0F0F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            PIPELINE PROGRESS: {(progressVal * 100).toFixed(0)}%
          </span>
          <div style={{
            width: '90px',
            height: '8px',
            background: '#FAF9F5',
            border: '1.5px solid #0F0F0F',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div
              ref={fillRef}
              style={{ height: '100%', width: '0%', background: '#DC2626', transition: 'width 0.1s linear' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
