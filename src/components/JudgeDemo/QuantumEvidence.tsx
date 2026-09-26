import type { ExperimentResponse, ProtocolVerificationResult } from '../../types/api';

interface Props {
  experimentData: ExperimentResponse | null;
  verification: ProtocolVerificationResult | null;
}

export default function QuantumEvidence({ experimentData, verification: _verification }: Props) {

  if (!experimentData) return null;

  const results = experimentData.results;
  if (!results.length) return null;

  const avgFidelity = results.reduce((acc, r) => acc + r.fidelity, 0) / results.length;
  const avgTv = results.reduce((acc, r) => acc + r.detection.distribution_total_variation, 0) / results.length;
  const avgJsd = results.reduce((acc, r) => acc + r.detection.jensen_shannon_divergence, 0) / results.length;
  const maxVectorDev = Math.max(...results.map(r => r.detection.raw_vector_deviation));

  // Compute QBER Proxy
  const qberVal = experimentData.attack === 'channel_manipulation' ? 0.5 : 0.0;

  const fidelityPct = (avgFidelity * 100).toFixed(1);
  const isFidelityOk = avgFidelity >= 0.99;

  return (
    <div className="section">
      <div style={{ marginBottom: 12 }}>
        <div className="section-label">Quantum Measurement Telemetry</div>
        <div className="section-title">Quantum Evidence &amp; Statistical Indicators</div>
      </div>

      <div className="grid-2">
        {/* Fidelity Card */}
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
            State Fidelity F(ρ_expected, ρ_observed)
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: isFidelityOk ? '#10b981' : '#ef4444' }}>
            {fidelityPct}%
          </div>
          <div className="progress-bar-outer" style={{ marginTop: 8, marginBottom: 8 }}>
            <div
              className="progress-bar-inner"
              style={{ width: `${Math.min(100, avgFidelity * 100)}%`, background: isFidelityOk ? '#10b981' : '#ef4444' }}
            />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Prototype Verification Tolerance: <strong style={{ color: 'var(--text-primary)' }}>99.0%</strong>
            <span> ({isFidelityOk ? '✓ Above Tolerance' : '✗ Below Tolerance'})</span>
          </div>
        </div>

        {/* Statistical Metrics Grid */}
        <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              QBER Proxy
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              {(qberVal * 100).toFixed(0)}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Vector Deviation
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              {maxVectorDev.toFixed(4)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Variation (D_TV)
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              {avgTv.toFixed(4)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Jensen-Shannon (JSD)
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
              {avgJsd.toFixed(4)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
