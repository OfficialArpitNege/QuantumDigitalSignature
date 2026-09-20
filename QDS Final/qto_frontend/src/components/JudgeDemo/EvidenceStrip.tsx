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

function statusColor(ok: boolean | null): string {
  if (ok === null) return '#64748b';
  return ok ? '#10b981' : '#ef4444';
}

export default function EvidenceStrip({
  statisticalAnalysis,
  experimentData,
  verification,
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
      label: 'QBER PROXY ¹',
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
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--lab-text-sub, #94a3b8)' }}>
          Quantum Evidence
        </span>
        <span style={{ fontSize: 10, color: 'var(--lab-text-muted, #475569)' }}>
          — from actual backend measurement data
        </span>
        {hasAnomaly && (
          <span style={{
            fontSize: 9, fontWeight: 800,
            background: 'rgba(239,68,68,0.15)',
            color: '#ef4444',
            border: '1px solid rgba(239,68,68,0.3)',
            padding: '1px 7px',
            borderRadius: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}>Anomaly Detected</span>
        )}
      </div>

      <div className="evidence-strip">
        {items.map(item => (
          <div key={item.label} className="evidence-cell">
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', marginBottom: 2 }}>
              {item.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{
                fontSize: 18,
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                color: statusColor(item.ok),
                lineHeight: 1,
              }}>
                {item.value}
              </span>
              <span style={{ fontSize: 14, color: statusColor(item.ok), fontWeight: 700 }}>
                {statusIcon(item.ok)}
              </span>
            </div>
            {item.threshold && (
              <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>{item.threshold}</div>
            )}
          </div>
        ))}
      </div>

      {/* Formal protocol decision indicator */}
      {verification && (
        <div style={{
          marginTop: 6,
          padding: '6px 12px',
          background: verification.decision === 'ACCEPT' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${verification.decision === 'ACCEPT' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          borderRadius: 6,
          fontSize: 10,
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ fontWeight: 800, color: verification.decision === 'ACCEPT' ? '#10b981' : '#ef4444' }}>
            {verification.decision === 'ACCEPT' ? '✓ ACCEPTED' : '✗ REJECTED'}
          </span>
          <span>by formal deterministic protocol verification — quantum evidence is supporting data only</span>
        </div>
      )}

      <div style={{ fontSize: 9, color: '#374151', marginTop: 4, paddingLeft: 2 }}>
        ¹ QBER Proxy: channel manipulation detector — 0% = clean, 50% = noise injected. Not a formal BB84 QBER.
      </div>
    </div>
  );
}
