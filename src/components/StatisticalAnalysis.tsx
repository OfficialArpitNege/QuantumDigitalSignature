import type { ExperimentSymbolResult } from '../types/api';
import MetricCard from './MetricCard';
import FormulaAccordion from './FormulaAccordion';

interface Props {
  results: ExperimentSymbolResult[];
}

export default function StatisticalAnalysis({ results }: Props) {
  if (!results.length) return null;

  const n = results.length;

  // Aggregate
  const avgFidelity  = results.reduce((s, r) => s + r.fidelity, 0) / n;
  const avgTv        = results.reduce((s, r) => s + r.detection.distribution_total_variation, 0) / n;
  const avgJsd       = results.reduce((s, r) => s + r.detection.jensen_shannon_divergence, 0) / n;
  const avgVecDev    = results.reduce((s, r) => s + r.detection.raw_vector_deviation, 0) / n;

  // QBER proxy: fraction of symbols where Z expectation sign flipped
  const qberProxy = results.filter(r =>
    Math.sign(r.observed.Z) !== Math.sign(r.expected.Z)
  ).length / n;

  return (
    <div className="card section">
      <div style={{ marginBottom: 16 }}>
        <div className="section-label">Metrics</div>
        <div className="section-title">Statistical Analysis</div>
        <div className="section-sub">Aggregated quantum channel statistics over {n} symbol{n !== 1 ? 's' : ''}</div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <MetricCard
          label="QBER Proxy"
          value={`${(qberProxy * 100).toFixed(1)}%`}
          unit="Quantum Bit Error Rate"
          highlight={qberProxy < 0.11}
        />
        <MetricCard
          label="Fidelity"
          value={`${(avgFidelity * 100).toFixed(2)}%`}
          unit="State reconstruction quality"
          highlight={avgFidelity > 0.9}
        />
        <MetricCard
          label="TV Distance"
          value={avgTv.toFixed(4)}
          unit="Total Variation Distance"
        />
        <MetricCard
          label="JSD"
          value={avgJsd.toFixed(4)}
          unit="Jensen-Shannon Divergence"
        />
      </div>

      {/* Secondary row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 }}>
        <div style={{
          background: 'var(--blue-50)', border: 'var(--border-light)', borderRadius: 10, padding: '14px 18px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div className="metric-label">Vector Deviation</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Bloch vector ‖expected − observed‖</div>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>
            {avgVecDev.toFixed(4)}
          </div>
        </div>
        <div style={{
          background: 'var(--blue-50)', border: 'var(--border-light)', borderRadius: 10, padding: '14px 18px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div className="metric-label">Symbols Analysed</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Total qubit-encoded signing bits</div>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>
            {n}
          </div>
        </div>
      </div>

      {/* Formula accordion */}
      <FormulaAccordion title="Show Statistical Formulas">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-700)', marginBottom: 6 }}>Quantum Bit Error Rate</div>
            <div className="formula-block">QBER = N_errors / N_total</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-700)', marginBottom: 6 }}>State Fidelity</div>
            <div className="formula-block">F = |⟨ψ_expected | ψ_observed⟩|²</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-700)', marginBottom: 6 }}>Total Variation Distance</div>
            <div className="formula-block">D_TV = ½ Σᵢ |pᵢ − qᵢ|</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-700)', marginBottom: 6 }}>Jensen-Shannon Divergence</div>
            <div className="formula-block">
              JSD(P, Q) = ½ KL(P ‖ M) + ½ KL(Q ‖ M){'\n'}
              M = (P + Q) / 2
            </div>
          </div>
        </div>
      </FormulaAccordion>
    </div>
  );
}
