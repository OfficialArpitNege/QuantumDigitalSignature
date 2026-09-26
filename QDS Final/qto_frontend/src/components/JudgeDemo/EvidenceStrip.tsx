import type {
  ExperimentResponse,
  ProtocolVerificationResult,
  FullPipelineStatisticalAnalysis,
  FullPipelineQuantumTransmission,
} from '../../types/api';

interface Props {
  // Phase 12 primary sources (preferred when available)
  statisticalAnalysis?: FullPipelineStatisticalAnalysis | null;
  quantumTransmission?: FullPipelineQuantumTransmission | null;
  // Legacy fallback from /api/v1/experiment (still used by diagnostic panels)
  experimentData?: ExperimentResponse | null;
  verification: ProtocolVerificationResult | null;
}

interface EvidenceItem {
  label: string;
  value: string;
  ok: boolean | null; // null = neutral
  threshold?: string;
}

function statusIcon(ok: boolean | null): string {
  if (ok === null) return '—';
  return ok ? '✓' : '✗';
}

export default function EvidenceStrip({
  statisticalAnalysis,
  experimentData,
}: Props) {
  // ── Prefer Phase 12 full-pipeline stats; fall back to legacy experiment data ──
  let avgFidelity: number | null = null;
  let qberProxy: number | null = null;
  let avgTv: number | null = null;
  let avgJsd: number | null = null;
  let vecDev: number | null = null;
  let stdError: number | null = null;
  let ci: [number, number] | null = null;

  if (statisticalAnalysis) {
    avgFidelity = statisticalAnalysis.average_fidelity;
    qberProxy   = statisticalAnalysis.qber_proxy;
    avgTv       = statisticalAnalysis.total_variation_distance;
    avgJsd      = statisticalAnalysis.jensen_shannon_divergence;
    vecDev      = statisticalAnalysis.vector_deviation;
    stdError    = statisticalAnalysis.standard_error;
    ci          = statisticalAnalysis.confidence_interval_95;
  } else if (experimentData && experimentData.results.length > 0) {
    const results = experimentData.results;
    const n = results.length;
    avgFidelity = results.reduce((s, r) => s + r.fidelity, 0) / n;
    avgTv       = results.reduce((s, r) => s + r.detection.distribution_total_variation, 0) / n;
    avgJsd      = results.reduce((s, r) => s + r.detection.jensen_shannon_divergence, 0) / n;
    vecDev      = Math.max(...results.map(r => r.detection.raw_vector_deviation));
    // QBER proxy: 0.5 for channel_manipulation, 0.0 otherwise
    qberProxy   = experimentData.attack === 'channel_manipulation' ? 0.5 : 0.0;
  }

  if (avgFidelity === null) return null;

  const fidelityOk = avgFidelity >= 0.99;
  const tvOk       = avgTv !== null ? avgTv < 0.1 : null;
  const jsdOk      = avgJsd !== null ? avgJsd < 0.05 : null;
  const qberOk     = qberProxy !== null ? qberProxy === 0.0 : null;

  const items: EvidenceItem[] = [
    {
      label: 'STATE FIDELITY',
      value: `${(avgFidelity * 100).toFixed(2)}%`,
      ok: fidelityOk,
      threshold: '≥ 99.0%',
    },
    {
      label: 'QBER PROXY',
      value: qberProxy !== null ? `${(qberProxy * 100).toFixed(0)}%` : 'N/A',
      ok: qberOk,
      threshold: '0% expected',
    },
    {
      label: 'TV DISTANCE',
      value: avgTv !== null ? avgTv.toFixed(4) : 'N/A',
      ok: tvOk,
      threshold: '< 0.10',
    },
    {
      label: 'JSD',
      value: avgJsd !== null ? avgJsd.toFixed(4) : 'N/A',
      ok: jsdOk,
      threshold: '< 0.05',
    },
    {
      label: 'VECTOR DEV.',
      value: vecDev !== null ? vecDev.toFixed(4) : 'N/A',
      ok: null,
      threshold: 'Bloch deviation',
    },
    ...(stdError !== null ? [{
      label: 'STD ERROR',
      value: stdError.toFixed(4),
      ok: null as boolean | null,
      threshold: 'σ(fidelity)',
    }] : []),
    ...(ci !== null ? [{
      label: '95% CI',
      value: `[${ci[0].toFixed(3)}, ${ci[1].toFixed(3)}]`,
      ok: null as boolean | null,
      threshold: 'Confidence interval',
    }] : []),
  ];

  const hasAnomaly = !fidelityOk || tvOk === false || jsdOk === false || qberOk === false;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0F0F0F', fontFamily: "'JetBrains Mono', monospace" }}>
          Quantum Evidence
        </span>
        {hasAnomaly && (
          <span style={{
            fontSize: 9, fontWeight: 800,
            background: '#FAF9F5',
            color: '#DC2626',
            border: '1.5px solid #0F0F0F',
            boxShadow: '2px 2px 0px #0F0F0F',
            padding: '2px 8px',
            borderRadius: 2,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            fontFamily: "'JetBrains Mono', monospace",
          }}>Anomaly Detected</span>
        )}
      </div>

      <div className="evidence-strip">
        {items.map(item => (
          <div key={item.label} className="evidence-cell">
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0F0F0F', marginBottom: 2 }}>
              {item.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{
                fontSize: 18,
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                color: item.ok === false ? '#DC2626' : item.ok === true ? '#1D4ED8' : '#0F0F0F',
                lineHeight: 1,
              }}>
                {item.value}
              </span>
              <span style={{ fontSize: 14, color: item.ok === false ? '#DC2626' : item.ok === true ? '#1D4ED8' : '#0F0F0F', fontWeight: 700 }}>
                {statusIcon(item.ok)}
              </span>
            </div>
            {item.threshold && (
              <div style={{ fontSize: 9, color: '#555555', marginTop: 2 }}>{item.threshold}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
