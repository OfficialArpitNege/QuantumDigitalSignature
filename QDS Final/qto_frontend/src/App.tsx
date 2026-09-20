import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import { useTheme } from './components/ThemeToggle';
import LandingPage from './landing/LandingPage';

function DisclaimerFooter() {
  const [open, setOpen] = useState(false);
  return (
    <footer style={{
      textAlign: 'center', padding: '0',
      borderTop: 'var(--border-light)',
      background: 'var(--bg-card)',
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
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

function SimulatorView() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <Dashboard theme={theme} onToggleTheme={toggleTheme} />
      <DisclaimerFooter />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulator" element={<SimulatorView />} />
      </Routes>
    </BrowserRouter>
  );
}
