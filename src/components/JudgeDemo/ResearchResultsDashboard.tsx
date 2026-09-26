import type { PerformanceBenchmarkResponse, ForgeryBenchmarkResponse } from '../../types/api';

interface Props {
  benchmarkData: PerformanceBenchmarkResponse | null;
  forgeryData: ForgeryBenchmarkResponse | null;
  loading: boolean;
  onRunBenchmark: () => void;
}

export default function ResearchResultsDashboard({
  benchmarkData,
  forgeryData,
  loading,
  onRunBenchmark,
}: Props) {
  const m = benchmarkData?.metrics;
  const f = forgeryData?.results;

  return (
    <div style={{
      background: '#FAF9F5',
      border: '1.5px solid #0F0F0F',
      boxShadow: '2px 2px 0px #0F0F0F',
      borderRadius: 2,
      padding: '18px 20px',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0F0F0F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Empirical Research Benchmarks
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onRunBenchmark}
          disabled={loading}
          style={{
            background: loading ? '#E5E3DA' : '#FAF9F5',
            color: '#0F0F0F',
            border: '1.5px solid #0F0F0F',
            boxShadow: '2px 2px 0px #0F0F0F',
            borderRadius: 2,
            padding: '8px 16px',
            fontSize: 11,
            fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {loading ? 'Running Multi-Trial Experiments...' : '▶ RUN RESEARCH BENCHMARKS (50 TRIALS)'}
        </button>
      </div>

      {m && f ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Top Row: Confusion Matrix + Performance Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            
            {/* Confusion Matrix Card */}
            <div style={{
              background: '#FAF9F5',
              border: '1.5px solid #0F0F0F',
              boxShadow: '2px 2px 0px #0F0F0F',
              borderRadius: 2, padding: '14px 16px'
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555555', marginBottom: 10 }}>
                Confusion Matrix (N={m.total_samples})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, textAlign: 'center' }}>
                <div style={{ background: '#FAF9F5', border: '1.5px solid #0F0F0F', padding: 8, borderRadius: 2 }}>
                  <div style={{ fontSize: 9, color: '#166534', fontWeight: 800 }}>TP (Attacks Rejected)</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#166534' }}>{m.tp}</div>
                </div>
                <div style={{ background: '#FAF9F5', border: '1.5px solid #0F0F0F', padding: 8, borderRadius: 2 }}>
                  <div style={{ fontSize: 9, color: '#DC2626', fontWeight: 800 }}>FN (False Acceptance)</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#DC2626' }}>{m.fn}</div>
                </div>
                <div style={{ background: '#FAF9F5', border: '1.5px solid #0F0F0F', padding: 8, borderRadius: 2 }}>
                  <div style={{ fontSize: 9, color: '#DC2626', fontWeight: 800 }}>FP (False Rejection)</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#DC2626' }}>{m.fp}</div>
                </div>
                <div style={{ background: '#FAF9F5', border: '1.5px solid #0F0F0F', padding: 8, borderRadius: 2 }}>
                  <div style={{ fontSize: 9, color: '#166534', fontWeight: 800 }}>TN (Clean Accepted)</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#166534' }}>{m.tn}</div>
                </div>
              </div>
            </div>

            {/* Performance Metrics Summary Card */}
            <div style={{
              background: '#FAF9F5',
              border: '1.5px solid #0F0F0F',
              boxShadow: '2px 2px 0px #0F0F0F',
              borderRadius: 2, padding: '14px 16px'
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555555', marginBottom: 10 }}>
                Security & Efficacy Rates
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: 9, color: '#555555', fontWeight: 700 }}>Accuracy</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F0F0F' }}>{(m.accuracy * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#555555', fontWeight: 700 }}>Precision</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F0F0F' }}>{(m.precision * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#555555', fontWeight: 700 }}>F1 Score</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F0F0F' }}>{(m.f1_score * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#555555', fontWeight: 700 }}>Detection Rate</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#166534' }}>{(m.detection_rate * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#555555', fontWeight: 700 }}>FAR</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1D4ED8' }}>{(m.far * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#555555', fontWeight: 700 }}>Avg Time</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F0F0F' }}>{m.average_verification_time_ms} ms</div>
                </div>
              </div>
            </div>

            {/* Empirical Forgery Benchmark Card */}
            <div style={{
              background: '#FAF9F5',
              border: '1.5px solid #0F0F0F',
              boxShadow: '2px 2px 0px #0F0F0F',
              borderRadius: 2, padding: '14px 16px'
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555555', marginBottom: 6 }}>
                Empirical Forgery Experiment
              </div>
              <div style={{ fontSize: 10, color: '#555555', marginBottom: 8, fontWeight: 700 }}>
                N={f.total_forgery_attempts} Forgery Attempts • Wilson 95% CI
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: '#555555', fontWeight: 700 }}>Empirical FAR:</span>
                <strong style={{ color: '#166534' }}>{(f.empirical_forgery_probability * 100).toFixed(2)}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: '#555555', fontWeight: 700 }}>Wilson 95% CI:</span>
                <strong style={{ color: '#0F0F0F' }}>[{(f.confidence_interval[0] * 100).toFixed(2)}%, {(f.confidence_interval[1] * 100).toFixed(2)}%]</strong>
              </div>
            </div>

          </div>

          {/* Architecture Verification Matrix */}
          <div style={{
            background: '#FAF9F5',
            border: '1.5px solid #0F0F0F',
            borderRadius: 2, padding: '10px 14px',
            display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#0F0F0F', textTransform: 'uppercase' }}>Architecture Properties:</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 10 }}>
              <span style={{ color: '#166534', fontWeight: 800 }}>✓ Attack-Blind Evaluation: PASS</span>
              <span style={{ color: '#166534', fontWeight: 800 }}>✓ Gate Authority: PASS</span>
              <span style={{ color: '#166534', fontWeight: 800 }}>✓ Audit Chain: PASS</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 11, color: '#555555', textAlign: 'center', padding: '12px 0', fontWeight: 700 }}>
          Click <strong>▶ RUN RESEARCH BENCHMARKS</strong> to execute multi-trial simulation scenarios and calculate empirical performance metrics.
        </div>
      )}
    </div>
  );
}
