import { useSimulator } from '../../context/SimulatorContext';
import NoSimulationCard from '../../components/NoSimulationCard';
import VerdictBanner from '../../components/JudgeDemo/VerdictBanner';
import VerificationChecks from '../../components/JudgeDemo/VerificationChecks';
import WhyExplanation from '../../components/JudgeDemo/WhyExplanation';
import EvidenceStrip from '../../components/JudgeDemo/EvidenceStrip';

export default function AnalysisPage() {
  const {
    fullPipelineData,
    experimentData,
    scenarioAttack,
    checksRevealed,
  } = useSimulator();

  if (!fullPipelineData) {
    return (
      <NoSimulationCard
        title="NO SIMULATION DATA AVAILABLE FOR ANALYSIS"
        description="Run a quantum protocol experiment on the main simulator page first to perform verification gate evaluation and threat analysis."
      />
    );
  }

  const v = fullPipelineData.verification;
  const threat = fullPipelineData.threat_assessment;
  const isAccept = v.decision === 'ACCEPT';

  return (
    <div style={{ animation: 'qds-appear 0.3s ease' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span className="eyebrow" style={{ color: '#1fb6d6', margin: 0 }}>
            VERIFICATION &amp; THREAT ANALYSIS
          </span>
          <span style={{
            fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
            background: isAccept ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: isAccept ? '#10b981' : '#ef4444',
            border: `1px solid ${isAccept ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            padding: '2px 8px', borderRadius: 100,
          }}>
            {isAccept ? 'PASSED' : 'ANOMALY DETECTED'}
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(22px, 2.5vw, 28px)',
          fontWeight: 800,
          color: 'var(--lab-text)',
          margin: 0,
        }}>
          Protocol Verification &amp; Security Evaluation
        </h1>
      </div>

      {/* ══════════════════════════════════════════════════
          1. TOP RESULT — Verdict Banner
      ══════════════════════════════════════════════════ */}
      <div className="lab-glass-shell" style={{ padding: '28px 32px', marginBottom: 24 }}>
        <div style={{
          fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.14em', color: '#1fb6d6', marginBottom: 16,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>SIMULATION RESULT</div>

        <VerdictBanner verification={v} />

        {/* 2. Deterministic Verification Gates */}
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <div style={{
            fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--lab-text-sub)', marginBottom: 10,
          }}>
            Deterministic Verification Gates
          </div>
          <VerificationChecks verification={v} revealed={checksRevealed > 0 ? checksRevealed : 4} />
        </div>

        {/* 3. Verification Rule Banner */}
        <div style={{
          background: 'var(--lab-surface-2)',
          border: '1px solid var(--lab-border)',
          borderRadius: 10,
          padding: '12px 18px',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--lab-text-sub)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#1fb6d6', fontSize: 16 }}>📐</span>
            <span>Formal Protocol Verification Rule:</span>
            <code style={{
              background: 'var(--lab-bg)',
              padding: '3px 8px',
              borderRadius: 6,
              color: '#1fb6d6',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
            }}>
              SIG ∧ ID ∧ REPLAY ∧ QTM
            </code>
          </div>
          <div style={{ fontSize: 11, color: 'var(--lab-text-muted)' }}>
            All four checks must pass → ACCEPT message
          </div>
        </div>

        {/* 4. "Why did the system make this decision?" Explanation */}
        <WhyExplanation verification={v} attackType={scenarioAttack} />
      </div>

      {/* ══════════════════════════════════════════════════
          5. THREAT ANALYSIS
      ══════════════════════════════════════════════════ */}
      <div className="lab-glass-shell" style={{ padding: '28px 32px', marginBottom: 24 }}>
        <div style={{
          fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.14em', color: '#ef4444', marginBottom: 16,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          THREAT ANALYSIS
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div className="metric-card" style={{ background: 'var(--lab-surface-2)' }}>
            <div className="metric-label">Threat Score</div>
            <div className="metric-value" style={{ fontSize: 24, color: threat ? (threat.threat_score > 30 ? '#ef4444' : '#10b981') : '#10b981' }}>
              {threat ? `${threat.threat_score.toFixed(1)} / 100` : '1.0 / 100'}
            </div>
          </div>

          <div className="metric-card" style={{ background: 'var(--lab-surface-2)' }}>
            <div className="metric-label">Risk Level</div>
            <div className="metric-value" style={{ fontSize: 24, color: threat ? (threat.threat_level === 'LOW' ? '#10b981' : '#ef4444') : '#10b981' }}>
              {threat ? threat.threat_level : 'LOW'}
            </div>
          </div>

          <div className="metric-card" style={{ background: 'var(--lab-surface-2)' }}>
            <div className="metric-label">Confidence</div>
            <div className="metric-value" style={{ fontSize: 24, color: '#1fb6d6' }}>
              99.0%
            </div>
          </div>

          <div className="metric-card" style={{ background: 'var(--lab-surface-2)' }}>
            <div className="metric-label">Attack Model</div>
            <div className="metric-value" style={{ fontSize: 18, fontFamily: "'JetBrains Mono', monospace", color: 'var(--lab-text)' }}>
              {threat ? threat.classified_attack : 'None'}
            </div>
          </div>
        </div>

        {/* Evidence Breakdown Strip */}
        <EvidenceStrip
          statisticalAnalysis={fullPipelineData.statistical_analysis}
          quantumTransmission={fullPipelineData.quantum_transmission}
          experimentData={experimentData}
          verification={v}
        />
      </div>

      {/* ══════════════════════════════════════════════════
          6. SUPPORTING ANALYSIS DISCLAIMER
      ══════════════════════════════════════════════════ */}
      <div style={{
        background: 'rgba(31, 182, 214, 0.08)',
        border: '1px solid rgba(31, 182, 214, 0.25)',
        borderRadius: 12,
        padding: '16px 20px',
        fontSize: 12,
        lineHeight: 1.6,
        color: 'var(--lab-text-sub)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <span style={{ fontSize: 18, color: '#1fb6d6', flexShrink: 0 }}>ℹ️</span>
        <div>
          <strong style={{ color: 'var(--lab-text)', display: 'block', marginBottom: 2 }}>
            Supporting Analysis Isolation Disclaimer
          </strong>
          Quantum evidence, statistical divergence metrics (TV Distance, JSD), and heuristic threat scores are supporting data only.
          The formal deterministic protocol decision is strictly governed by the 4 verification gates.
        </div>
      </div>
    </div>
  );
}
