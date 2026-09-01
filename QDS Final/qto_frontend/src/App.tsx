import Header from './components/Header';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <>
      <Header />
      <Dashboard />
      <footer style={{
        textAlign: 'center', padding: '20px 24px',
        borderTop: '1px solid var(--blue-100)',
        fontSize: 12, color: 'var(--text-muted)',
        background: '#FFFFFF',
      }}>
        Research prototype / simulator — thresholds and detector weights require experimental calibration.
      </footer>
    </>
  );
}
