import type { ExperimentResponse } from '../types/api';

interface Props {
  data: ExperimentResponse;
  protocolDecision?: 'ACCEPT' | 'REJECT';
}

type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const LEVEL_CONFIG: Record<ThreatLevel, { cls: string; icon: string; verdict: string; textColor: string }> = {
  LOW:      { cls: 'threat-low',      icon: '', verdict: 'LOW ANOMALY SIGNAL',  textColor: 'var(--threat-low)' },
  MEDIUM:   { cls: 'threat-medium',   icon: '', verdict: 'ANOMALY DETECTED',    textColor: 'var(--threat-med)' },
  HIGH:     { cls: 'threat-high',     icon: '', verdict: 'THREAT DETECTED',     textColor: 'var(--threat-high)' },
  CRITICAL: { cls: 'threat-critical', icon: '', verdict: 'CRITICAL THREAT',     textColor: 'var(--threat-crit)' },
};

function aggregateResults(data: ExperimentResponse) {
  const results = data.results;
  if (!results.length) return null;

  // Pick the worst threat level across all symbols
  const levelOrder: ThreatLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  let worstLevel: ThreatLevel = 'LOW';
  let maxScore = 0;
  let totalFidelity = 0;
  let totalTv = 0;
  let totalJsd = 0;

  for (const r of results) {
    const lvl = r.detection.threat_level as ThreatLevel;
    if (levelOrder.indexOf(lvl) > levelOrder.indexOf(worstLevel)) worstLevel = lvl;
    if (r.detection.threat_score > maxScore) maxScore = r.detection.threat_score;
    totalFidelity += r.fidelity;
    totalTv += r.detection.distribution_total_variation;
    totalJsd += r.detection.jensen_shannon_divergence;
  }

  return {
    worstLevel,
    maxScore,
    avgFidelity: totalFidelity / results.length,
    avgTv: totalTv / results.length,
    avgJsd: totalJsd / results.length,
    symbolCount: results.length,
    attackType: data.attack,
    attackStrength: data.attack_strength,
  };
}

function riskBadge(score: number) {
  const pct = Math.min(100, score);
  let color = 'var(--threat-low)';
  if (pct >= 80) color = 'var(--threat-crit)';
  else if (pct >= 60) color = 'var(--threat-high)';
  else if (pct >= 25) color = 'var(--threat-med)';
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, fontWeight: 500 }}>
        <span style={{ color: 'inherit', opacity: 0.8 }}>Threat Score</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{pct.toFixed(1)} / 100</span>
      </div>
      <div className="progress-bar-outer">
        <div className="progress-bar-inner" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function ThreatAssessment({ data }: Props) {

  const agg = aggregateResults(data);
  if (!agg) return null;

  const cfg = LEVEL_CONFIG[agg.worstLevel];

  let verdictText = cfg.verdict;
  let verdictIcon = cfg.icon;
  let verdictCls = cfg.cls;

  // Note: threat level and protocol decision are INDEPENDENT.
  // Protocol decision is the authoritative source of truth shown above.
  // This threat assessment reflects only the heuristic classifier output.

  const formatAttackLabel = (a: string) =>
    a === 'none' ? 'None' : a.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="section">
      <div style={{ marginBottom: 6 }}>
        <div className="section-label">Supporting Analysis Only</div>
        <div className="section-title">Statistical / Heuristic Threat Assessment</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
          Heuristic classifier — does NOT override the deterministic protocol decision above.
        </div>
      </div>

      <div className={`threat-card ${verdictCls}`}>
        <div className="threat-verdict">
          <span className="threat-icon">{verdictIcon}</span>
          {verdictText}
        </div>

        {riskBadge(agg.maxScore)}

        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Risk Level',    value: agg.worstLevel },
            { label: 'Confidence',    value: `${(100 - agg.maxScore).toFixed(1)}%` },
            { label: 'Attack Type',   value: formatAttackLabel(agg.attackType) },
            { label: 'Symbols Tested', value: String(agg.symbolCount) },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.55)', borderRadius: 8,
              padding: '12px 14px', backdropFilter: 'blur(4px)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.7, marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Avg. Fidelity',  value: `${(agg.avgFidelity * 100).toFixed(1)}%` },
              { label: 'Avg. TV Dist.',  value: agg.avgTv.toFixed(4) },
              { label: 'Avg. JSD',       value: agg.avgJsd.toFixed(4) },
            ].map(({ label, value }) => (
              <div key={label} style={{ fontSize: 12 }}>
                <span style={{ opacity: 0.7 }}>{label}: </span>
                <strong style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
