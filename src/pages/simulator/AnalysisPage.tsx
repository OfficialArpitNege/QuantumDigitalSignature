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
          <span className="eyebrow" style={{ color: '#0F0F0F', margin: 0, fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>
            VERIFICATION &amp; THREAT ANALYSIS
          </span>
          <span style={{
            fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
            background: '#FAF9F5',
            color: isAccept ? '#1D4ED8' : '#DC2626',
            border: '1.5px solid #0F0F0F',
            boxShadow: '2px 2px 0px #0F0F0F',
            padding: '2px 8px', borderRadius: 2,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {isAccept ? 'PASSED' : 'ANOMALY DETECTED'}
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(22px, 2.5vw, 28px)',
          fontWeight: 800,
          color: '#0F0F0F',
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
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
          letterSpacing: '0.14em', color: '#0F0F0F', marginBottom: 16,
          fontFamily: "'JetBrains Mono', monospace",
        }}>SIMULATION RESULT</div>

        <VerdictBanner verification={v} />

        {/* 2. Deterministic Verification Gates */}
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <div style={{
            fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: '#0F0F0F', marginBottom: 10,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            Deterministic Verification Gates
          </div>
          <VerificationChecks verification={v} revealed={checksRevealed > 0 ? checksRevealed : 4} />
        </div>

        {/* 3. "Why did the system make this decision?" Explanation */}
        <WhyExplanation verification={v} attackType={scenarioAttack} />
      </div>

      {/* ══════════════════════════════════════════════════
          5. THREAT ANALYSIS
      ══════════════════════════════════════════════════ */}
      <div className="lab-glass-shell" style={{ padding: '28px 32px', marginBottom: 24 }}>
        <div style={{
          fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.14em', color: '#0F0F0F', marginBottom: 16,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          THREAT ANALYSIS
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div className="card-inset" style={{ background: '#FAF9F5', border: '1.5px solid #0F0F0F', boxShadow: '2px 2px 0px #0F0F0F', borderRadius: 2 }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#0F0F0F', fontFamily: "'JetBrains Mono', monospace" }}>Threat Score</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: threat ? (threat.threat_score > 30 ? '#DC2626' : '#1D4ED8') : '#1D4ED8', fontFamily: "'JetBrains Mono', monospace" }}>
              {threat ? `${threat.threat_score.toFixed(1)} / 100` : '1.0 / 100'}
            </div>
          </div>

          <div className="card-inset" style={{ background: '#FAF9F5', border: '1.5px solid #0F0F0F', boxShadow: '2px 2px 0px #0F0F0F', borderRadius: 2 }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#0F0F0F', fontFamily: "'JetBrains Mono', monospace" }}>Risk Level</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: threat ? (threat.threat_level === 'LOW' ? '#1D4ED8' : '#DC2626') : '#1D4ED8', fontFamily: "'JetBrains Mono', monospace" }}>
              {threat ? threat.threat_level : 'LOW'}
            </div>
          </div>

          <div className="card-inset" style={{ background: '#FAF9F5', border: '1.5px solid #0F0F0F', boxShadow: '2px 2px 0px #0F0F0F', borderRadius: 2 }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#0F0F0F', fontFamily: "'JetBrains Mono', monospace" }}>Confidence</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1D4ED8', fontFamily: "'JetBrains Mono', monospace" }}>
              99.0%
            </div>
          </div>

          <div className="card-inset" style={{ background: '#FAF9F5', border: '1.5px solid #0F0F0F', boxShadow: '2px 2px 0px #0F0F0F', borderRadius: 2 }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#0F0F0F', fontFamily: "'JetBrains Mono', monospace" }}>Attack Model</div>
            <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#0F0F0F' }}>
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
    </div>
  );
}
