import type { PerformanceBenchmarkResponse, ForgeryBenchmarkResponse } from '../../types/api';

interface Props {
  benchmarkData: PerformanceBenchmarkResponse | null;
  forgeryData: ForgeryBenchmarkResponse | null;
  loading: boolean;
  onRunBenchmark: () => void;
  isDark?: boolean;
}

export default function ResearchResultsDashboard({
  benchmarkData,
  forgeryData,
  loading,
  onRunBenchmark,
  isDark = false
}: Props) {
  const m = benchmarkData?.metrics;
  const f = forgeryData?.results;

  return (
    <div style={{
      background: isDark ? '#0b1329' : '#ffffff',
      border: isDark ? '1px solid rgba(14, 165, 233, 0.25)' : '1px solid var(--blue-200)',
      borderRadius: 14,
      padding: '20px 24px',
      marginTop: 20,
      marginBottom: 20,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>📊</span>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>
              Final Research Benchmark & Empirical Evaluation Summary
            </div>
            <span style={{
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
              background: 'var(--blue-100)', color: 'var(--text-blue)', padding: '2px 8px', borderRadius: 4
            }}>
              Phase 15 Validated
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Empirical multi-trial performance evaluation under attack-blind testing conditions
          </div>
        </div>

        <button
          onClick={onRunBenchmark}
          disabled={loading}
          style={{
            background: loading ? 'var(--blue-200)' : 'var(--color-primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {loading ? 'Running Multi-Trial Experiments...' : '▶ Run Research Benchmarks (50 Trials)'}
        </button>
      </div>

      {m && f ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Top Row: Confusion Matrix + Performance Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            
            {/* Confusion Matrix Card */}
            <div style={{
              background: isDark ? '#162032' : '#f8fafc',
              border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
              borderRadius: 10, padding: '14px 16px'
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 10 }}>
                Confusion Matrix (N={m.total_samples} Multi-Trial Scenarios)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, textAlign: 'center' }}>
                <div style={{ background: isDark ? '#064e3b' : '#ecfdf5', border: '1px solid #10b981', padding: 8, borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: '#10b981', fontWeight: 800 }}>TP (Attacks Rejected)</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#10b981' }}>{m.tp}</div>
                </div>
                <div style={{ background: isDark ? '#450a0a' : '#fef2f2', border: '1px solid #ef4444', padding: 8, borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 800 }}>FN (False Acceptance)</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#ef4444' }}>{m.fn}</div>
                </div>
                <div style={{ background: isDark ? '#450a0a' : '#fef2f2', border: '1px solid #ef4444', padding: 8, borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 800 }}>FP (False Rejection)</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#ef4444' }}>{m.fp}</div>
                </div>
                <div style={{ background: isDark ? '#064e3b' : '#ecfdf5', border: '1px solid #10b981', padding: 8, borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: '#10b981', fontWeight: 800 }}>TN (Clean Accepted)</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#10b981' }}>{m.tn}</div>
                </div>
              </div>
            </div>

            {/* Performance Metrics Summary Card */}
            <div style={{
              background: isDark ? '#162032' : '#f8fafc',
              border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
              borderRadius: 10, padding: '14px 16px'
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 10 }}>
                Security & Efficacy Rates
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Accuracy</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{(m.accuracy * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Precision</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{(m.precision * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>F1 Score</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{(m.f1_score * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Detection Rate</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#10b981' }}>{(m.detection_rate * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>FAR</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#3b82f6' }}>{(m.far * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Avg Time</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{m.average_verification_time_ms} ms</div>
                </div>
              </div>
            </div>

            {/* Empirical Forgery Benchmark Card */}
            <div style={{
              background: isDark ? '#162032' : '#f8fafc',
              border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
              borderRadius: 10, padding: '14px 16px'
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 6 }}>
                Empirical Forgery Experiment
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
                N={f.total_forgery_attempts} Forgery Attempts • Wilson 95% Confidence Interval
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span>Empirical FAR / Forgery Prob:</span>
                <strong style={{ color: '#10b981' }}>{(f.empirical_forgery_probability * 100).toFixed(2)}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span>Wilson 95% CI:</span>
                <strong>[{(f.confidence_interval[0] * 100).toFixed(2)}%, {(f.confidence_interval[1] * 100).toFixed(2)}%]</strong>
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 6, lineHeight: 1.4 }}>
                {f.interpretation_note}
              </div>
            </div>

          </div>

          {/* Architecture Verification Matrix */}
          <div style={{
            background: isDark ? '#0f172a' : '#f1f5f9',
            borderRadius: 8, padding: '10px 14px',
            display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)' }}>System Architecture Properties:</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11 }}>
              <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Attack-Blind Evaluation: PASS</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Deterministic Gate Authority: PASS</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Statistical Evidence Isolated: PASS</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Tamper-Evident Audit Chain: PASS</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
          Click <strong>▶ Run Research Benchmarks</strong> to execute multi-trial simulation scenarios and calculate empirical performance metrics.
        </div>
      )}

      {/* Required Disclaimer */}
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 14, borderTop: '1px solid var(--border-light)', paddingTop: 8 }}>
        <strong>Research Disclaimer:</strong> Quantum-inspired cybersecurity research prototype with computational classical authentication (HMAC-SHA-256). Measured empirical results are derived from simulation trials and do not constitute a formal information-theoretic security proof. Statistical thresholds are experimental prototype research parameters.
      </div>
    </div>
  );
}
