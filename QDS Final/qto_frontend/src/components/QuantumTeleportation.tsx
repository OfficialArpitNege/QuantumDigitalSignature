import type { ExperimentSymbolResult } from '../types/api';
import FormulaAccordion from './FormulaAccordion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  results: ExperimentSymbolResult[];
}

function blochChartData(results: ExperimentSymbolResult[]) {
  // Average across symbols
  const n = results.length;
  const avg = (key: 'X' | 'Y' | 'Z', src: 'expected' | 'observed') =>
    results.reduce((s, r) => s + r[src][key], 0) / n;

  return ['X', 'Y', 'Z'].map(axis => ({
    axis,
    Expected: parseFloat(avg(axis as 'X', 'expected').toFixed(4)),
    Observed: parseFloat(avg(axis as 'X', 'observed').toFixed(4)),
  }));
}

export default function QuantumTeleportation({ results }: Props) {
  if (!results.length) return null;

  const first = results[0];
  const avgFidelity = results.reduce((s, r) => s + r.fidelity, 0) / results.length;
  const qberProxy = results.filter(r =>
    (r.observed.Z >= 0) !== (r.expected.Z >= 0)
  ).length / results.length;

  const chartData = blochChartData(results);

  return (
    <div className="card section">
      <div style={{ marginBottom: 16 }}>
        <div className="section-label">Quantum Channel</div>
        <div className="section-title">Quantum Teleportation</div>
        <div className="section-sub">Bell pair generation, teleportation and state reconstruction per symbol</div>
      </div>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Avg. Fidelity',        value: `${(avgFidelity * 100).toFixed(2)}%`, highlight: avgFidelity > 0.9 },
          { label: 'QBER Proxy',           value: `${(qberProxy * 100).toFixed(1)}%`,   highlight: qberProxy < 0.1 },
          { label: 'Symbols Teleported',   value: String(results.length) },
          { label: 'Bell Measurement (1st)', value: first.bell_measurement, mono: true },
        ].map(({ label, value, highlight, mono }) => (
          <div key={label} className="metric-card" style={highlight ? { borderColor: 'var(--blue-300)', background: 'var(--blue-50)' } : {}}>
            <div className="metric-label">{label}</div>
            <div className="metric-value" style={{ fontSize: 22, fontFamily: mono ? "'JetBrains Mono', monospace" : undefined }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Bloch expectations chart */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
          Expected vs Observed Bloch Expectations (averaged over {results.length} symbol{results.length !== 1 ? 's' : ''})
        </div>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <XAxis dataKey="axis" tick={{ fontSize: 12, fontFamily: 'Inter' }} />
              <YAxis domain={[-1, 1]} tick={{ fontSize: 11 }} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={((v: unknown) => (v == null ? '' : typeof v === 'number' ? v.toFixed(4) : String(v))) as any}
                contentStyle={{ borderRadius: 8, border: '1px solid var(--blue-200)', fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Expected" fill="#93C5FD" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Observed" fill="#2563EB" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-symbol table */}
      {results.length > 1 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Symbol Detail</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--blue-50)' }}>
                  {['#', 'Bit', 'Bell', 'Fidelity', '⟨X⟩ Exp', '⟨X⟩ Obs', '⟨Z⟩ Exp', '⟨Z⟩ Obs', 'Threat'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', fontSize: 10, textTransform: 'uppercase', borderBottom: '1px solid var(--blue-100)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map(r => {
                  const lvl = r.detection.threat_level;
                  const lvlColor = lvl === 'LOW' ? 'var(--threat-low)' : lvl === 'MEDIUM' ? 'var(--threat-med)' : lvl === 'HIGH' ? 'var(--threat-high)' : 'var(--threat-crit)';
                  return (
                    <tr key={r.index} style={{ borderBottom: '1px solid var(--blue-50)' }}>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{r.index}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{r.source_bit}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{r.bell_measurement}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{(r.fidelity * 100).toFixed(1)}%</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{r.expected.X.toFixed(3)}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{r.observed.X.toFixed(3)}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{r.expected.Z.toFixed(3)}</td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{r.observed.Z.toFixed(3)}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: lvlColor }}>{lvl}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Formula accordion */}
      <FormulaAccordion title="Show Quantum State & Teleportation Formulas">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-700)', marginBottom: 6 }}>Quantum State</div>
            <div className="formula-block">
              |ψ⟩ = cos(θ/2)|0⟩ + exp(iφ)sin(θ/2)|1⟩
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-700)', marginBottom: 6 }}>Bloch Expectations</div>
            <div className="formula-block">
              ⟨X⟩ = sin(θ)cos(φ){'\n'}
              ⟨Y⟩ = sin(θ)sin(φ){'\n'}
              ⟨Z⟩ = cos(θ)
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-700)', marginBottom: 6 }}>Bell Pair</div>
            <div className="formula-block">|Φ⁺⟩ = (|00⟩ + |11⟩) / √2</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-700)', marginBottom: 6 }}>Teleportation Decomposition</div>
            <div className="formula-block">
              |Ψ⟩ = ½ [ |00⟩|ψ⟩ + |01⟩X|ψ⟩ + |10⟩Z|ψ⟩ + |11⟩XZ|ψ⟩ ]
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-700)', marginBottom: 6 }}>Classical Correction</div>
            <div className="formula-block">Apply X^m₂ Z^m₁  (m₁, m₂ from Bell measurement)</div>
          </div>
        </div>
      </FormulaAccordion>
    </div>
  );
}
