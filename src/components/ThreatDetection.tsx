import type { ExperimentSymbolResult } from '../types/api';

interface Props {
  results: ExperimentSymbolResult[];
  attackType: string;
}

const EVIDENCE_LABELS: Record<string, string> = {
  forgery_probability:      'Forgery Probability',
  verification_failure:     'Verification Failure Rate',
  statistical_deviation:    'Statistical Deviation',
  distribution_tv:          'Distribution TV Distance',
  duplicate_detected:       'Duplicate Detected',
  freshness_failure:        'Freshness Failure',
  qber:                     'QBER',
  fidelity_loss:            'Fidelity Loss',
  jsd:                      'Jensen-Shannon Div.',
  identity_failure:         'Identity Failure Rate',
  signature_anomaly:        'Signature Anomaly',
  distribution_anomaly:     'Distribution Anomaly',
};

function scoreBar(value: number) {
  const pct = Math.min(100, value * 100);
  let color = '#16A34A';
  if (pct >= 80) color = '#DC2626';
  else if (pct >= 60) color = '#EA580C';
  else if (pct >= 30) color = '#CA8A04';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
      <div style={{ flex: 1, height: 5, background: 'var(--blue-50)', borderRadius: 999, overflow: 'hidden', border: '1px solid var(--blue-100)' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', minWidth: 38, textAlign: 'right' }}>
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

function formatAttack(a: string) {
  return a === 'none' ? 'None (Baseline)' : a.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function ThreatDetection({ results, attackType }: Props) {
  if (!results.length) return null;

  // Aggregate evidence across symbols (average numeric values)
  const evidenceKeys = Object.keys(results[0].detection.evidence);
  const avgEvidence: Record<string, number> = {};
  for (const key of evidenceKeys) {
    avgEvidence[key] = results.reduce((s, r) => s + (r.detection.evidence[key] ?? 0), 0) / results.length;
  }

  const avgScore = results.reduce((s, r) => s + r.detection.threat_score, 0) / results.length;
  const avgVecDev = results.reduce((s, r) => s + r.detection.raw_vector_deviation, 0) / results.length;
  const avgTv = results.reduce((s, r) => s + r.detection.distribution_total_variation, 0) / results.length;
  const avgJsd = results.reduce((s, r) => s + r.detection.jensen_shannon_divergence, 0) / results.length;

  const worstResult = results.reduce((a, b) => b.detection.threat_score > a.detection.threat_score ? b : a);
  const lvl = worstResult.detection.threat_level;
  const lvlColor = lvl === 'LOW' ? 'var(--threat-low)' : lvl === 'MEDIUM' ? 'var(--threat-med)' : lvl === 'HIGH' ? 'var(--threat-high)' : 'var(--threat-crit)';

  return (
    <div className="card section">
      <div style={{ marginBottom: 16 }}>
        <div className="section-label">Analysis</div>
        <div className="section-title">Threat Detection</div>
        <div className="section-sub">
          Attack model: <strong>{formatAttack(attackType)}</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left: Evidence breakdown */}
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '11px' }}>
            Evidence Breakdown
          </div>
          {evidenceKeys.map(key => (
            <div key={key} className="evidence-row">
              <span className="evidence-key">{EVIDENCE_LABELS[key] ?? key.replace(/_/g, ' ')}</span>
              {scoreBar(avgEvidence[key])}
            </div>
          ))}
        </div>

        {/* Right: Aggregate metrics */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Aggregate Metrics
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Threat Score (avg)', value: `${avgScore.toFixed(1)} / 100` },
              { label: 'Threat Level',       value: lvl, color: lvlColor },
              { label: 'Vector Deviation',   value: avgVecDev.toFixed(4) },
              { label: 'TV Distance',        value: avgTv.toFixed(4) },
              { label: 'Jensen-Shannon Div.',value: avgJsd.toFixed(4) },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px',
                background: 'var(--blue-50)', border: 'var(--border-light)',
                borderRadius: 8,
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700,
                  color: color ?? 'var(--text-primary)',
                }}>{value}</span>
              </div>
            ))}
          </div>

          {results[0].detection.note && (
            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
              {results[0].detection.note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
