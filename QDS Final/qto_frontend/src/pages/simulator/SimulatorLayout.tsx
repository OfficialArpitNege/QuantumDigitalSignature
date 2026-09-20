import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';
import HowItWorksModal from '../../components/JudgeDemo/HowItWorksModal';
import { useTheme } from '../../components/ThemeToggle';
import { SimulatorProvider, useSimulator } from '../../context/SimulatorContext';
import '../../qds-lab.css';

function DisclaimerFooter() {
  const [open, setOpen] = useState(false);
  return (
    <footer style={{
      textAlign: 'center',
      padding: '0',
      borderTop: 'var(--border-light)',
      background: 'var(--bg-card)',
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
      position: 'relative',
      zIndex: 10,
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          padding: '10px 24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          transition: 'color 0.15s ease',
        }}
      >
        <span>ⓘ</span>
        <span>Research Disclaimer</span>
        <span style={{
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          display: 'inline-block',
          fontSize: 9,
        }}>▼</span>
      </button>
      {open && (
        <div style={{
          padding: '0 24px 14px',
          fontSize: 11,
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          maxWidth: 640,
          margin: '0 auto',
          animation: 'qds-appear 0.25s ease',
        }}>
          Research prototype / simulator — thresholds and detector weights require experimental calibration.
          This is not a production security system. Results are for educational and research purposes only.
        </div>
      )}
    </footer>
  );
}

function InnerLayout() {
  const { theme, toggleTheme } = useTheme();
  const { showModal, setShowModal } = useSimulator();

  return (
    <div className="lab-page-root">
      {/* Background Ambient Orbs matching 3D Landing Page */}
      <div className="lab-ambient-bg">
        <div className="lab-orb-1" />
        <div className="lab-orb-2" />
        <div className="lab-orb-3" />
      </div>

      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenHowItWorks={() => setShowModal(true)}
      />

      <HowItWorksModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <main style={{ padding: '28px 0 80px', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ maxWidth: 1280 }}>
          <Outlet />
        </div>
      </main>

      <DisclaimerFooter />
    </div>
  );
}

export default function SimulatorLayout() {
  return (
    <SimulatorProvider>
      <InnerLayout />
    </SimulatorProvider>
  );
}
