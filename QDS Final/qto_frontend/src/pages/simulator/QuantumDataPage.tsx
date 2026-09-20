import { useSimulator } from '../../context/SimulatorContext';
import NoSimulationCard from '../../components/NoSimulationCard';
import QuantumPipelineFlow from '../../components/QuantumPipelineFlow';
import QuantumTeleportation from '../../components/QuantumTeleportation';

export default function QuantumDataPage() {
  const {
    fullPipelineData,
    experimentData,
  } = useSimulator();

  const results = experimentData?.results || [];
  const qtx = fullPipelineData?.quantum_transmission;
  const stats = fullPipelineData?.statistical_analysis;

  if (!fullPipelineData && results.length === 0) {
    return (
      <NoSimulationCard
        title="NO QUANTUM STATE DATA AVAILABLE"
        description="Run a quantum protocol experiment on the main simulator page first to inspect Bell pairs, qubit teleportation, and Bloch expectations."
      />
    );
  }

  const avgFidelity = qtx?.average_fidelity ?? (results.length > 0 ? results.reduce((s, r) => s + r.fidelity, 0) / results.length : 1.0);
  const qberProxy = stats?.qber_proxy ?? (experimentData?.attack === 'channel_manipulation' ? 0.5 : 0.0);
  const symbolCount = qtx?.qubits_transmitted ?? results.length ?? 4;

  return (
    <div style={{ animation: 'qds-appear 0.3s ease' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span className="eyebrow" style={{ color: '#1fb6d6', margin: 0 }}>
            QUANTUM CHANNEL DATA
          </span>
          <span style={{
            fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
            background: 'rgba(31, 182, 214, 0.12)', color: '#1fb6d6',
            border: '1px solid rgba(31, 182, 214, 0.3)', padding: '2px 8px', borderRadius: 100,
          }}>
            State Fidelity: {(avgFidelity * 100).toFixed(2)}%
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(22px, 2.5vw, 28px)',
          fontWeight: 800,
          color: 'var(--lab-text)',
          margin: 0,
        }}>
          Quantum State Teleportation &amp; Bloch Expectations
        </h1>
      </div>

      {/* ══════════════════════════════════════════════════
          1. QUANTUM PIPELINE VISUALIZER
      ══════════════════════════════════════════════════ */}
      <QuantumPipelineFlow />

      {/* ══════════════════════════════════════════════════
          2. QUANTUM CHANNEL METRICS SUMMARY CARD
      ══════════════════════════════════════════════════ */}
      <div className="lab-glass-shell" style={{ padding: '24px 28px', marginBottom: 24 }}>
        <div style={{
          fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.12em', color: '#1fb6d6', marginBottom: 16,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          QUANTUM TELEPORTATION SUMMARY
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <div className="metric-card" style={{ background: 'var(--lab-surface-2)' }}>
            <div className="metric-label">Average Fidelity</div>
            <div className="metric-value" style={{ fontSize: 24, color: avgFidelity >= 0.99 ? '#10b981' : '#ef4444' }}>
              {(avgFidelity * 100).toFixed(2)}%
            </div>
          </div>

          <div className="metric-card" style={{ background: 'var(--lab-surface-2)' }}>
            <div className="metric-label">QBER Proxy</div>
            <div className="metric-value" style={{ fontSize: 24, color: qberProxy === 0 ? '#10b981' : '#ef4444' }}>
              {(qberProxy * 100).toFixed(1)}%
            </div>
          </div>

          <div className="metric-card" style={{ background: 'var(--lab-surface-2)' }}>
            <div className="metric-label">Symbols Teleported</div>
            <div className="metric-value" style={{ fontSize: 24, color: 'var(--lab-text)' }}>
              {symbolCount}
            </div>
          </div>

          <div className="metric-card" style={{ background: 'var(--lab-surface-2)' }}>
            <div className="metric-label">1st Bell Measurement</div>
            <div className="metric-value" style={{ fontSize: 22, fontFamily: "'JetBrains Mono', monospace", color: '#1fb6d6' }}>
              {results[0]?.bell_measurement || '|Φ⁺⟩ (00)'}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          3. BLOCH EXPECTATIONS CHART & SYMBOL DETAIL TABLE
      ══════════════════════════════════════════════════ */}
      {results.length > 0 ? (
        <QuantumTeleportation results={results} />
      ) : (
        <div className="lab-glass-shell" style={{ padding: '24px 28px', marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: 'var(--lab-text-sub)', textAlign: 'center', padding: '20px 0' }}>
            Full symbol table available when experiment qubit telemetry is captured.
          </div>
        </div>
      )}
    </div>
  );
}
