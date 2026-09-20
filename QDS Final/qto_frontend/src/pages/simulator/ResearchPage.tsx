import { useSimulator } from '../../context/SimulatorContext';
import { useTheme } from '../../components/ThemeToggle';
import AttackBlindFlowModal from '../../components/JudgeDemo/AttackBlindFlowModal';
import ResearchResultsDashboard from '../../components/JudgeDemo/ResearchResultsDashboard';
import CollapsibleSection from '../../components/JudgeDemo/CollapsibleSection';
import TechnicalDetailsDrawer from '../../components/JudgeDemo/TechnicalDetailsDrawer';
import WorkflowPipeline from '../../components/WorkflowPipeline';
import ThreatAssessment from '../../components/ThreatAssessment';
import MessageAuth from '../../components/MessageAuth';
import QuantumTeleportation from '../../components/QuantumTeleportation';
import ThreatDetection from '../../components/ThreatDetection';
import StatisticalAnalysis from '../../components/StatisticalAnalysis';

export default function ResearchPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    scenarioAttack,
    fullPipelineData,
    experimentData,
    signData,
    benchmarkData,
    forgeryData,
    benchmarkLoading,
    runResearchBenchmarks,
    showDrawer,
    setShowDrawer,
    pipeline,
  } = useSimulator();

  const isDone = !!fullPipelineData && !!experimentData;

  return (
    <div style={{ animation: 'qds-appear 0.3s ease' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span className="eyebrow" style={{ color: '#1fb6d6', margin: 0 }}>
            RESEARCH &amp; DIAGNOSTICS
          </span>
          <span style={{
            fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
            background: 'rgba(31, 182, 214, 0.12)', color: '#1fb6d6',
            border: '1px solid rgba(31, 182, 214, 0.3)', padding: '2px 8px', borderRadius: 100,
          }}>
            Attack-Blind Engine
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(22px, 2.5vw, 28px)',
          fontWeight: 800,
          color: 'var(--lab-text)',
          margin: 0,
        }}>
          Security Architecture &amp; Empirical Research Benchmarks
        </h1>
      </div>

      {/* ══════════════════════════════════════════════════
          1. SECURITY ARCHITECTURE
      ══════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 24 }}>
        <AttackBlindFlowModal attackType={scenarioAttack} isDark={isDark} />
      </div>

      {/* ══════════════════════════════════════════════════
          2. RESEARCH BENCHMARK SUMMARY & MULTI-TRIAL RUNNER
      ══════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 24 }}>
        <CollapsibleSection title="Research Benchmarks & Empirical Evaluation" badge="Phase 15 Validated" defaultOpen={true}>
          <ResearchResultsDashboard
            benchmarkData={benchmarkData}
            forgeryData={forgeryData}
            loading={benchmarkLoading}
            onRunBenchmark={runResearchBenchmarks}
            isDark={isDark}
          />
        </CollapsibleSection>
      </div>

      {/* ══════════════════════════════════════════════════
          3. FULL DIAGNOSTICS & AUDIT LOG
      ══════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 24 }}>
        <CollapsibleSection title="Technical Details & Audit Log" badge={isDone ? "Active Execution" : "Diagnostic Ready"} defaultOpen={true}>
          <div style={{ padding: '12px 0' }}>
            <TechnicalDetailsDrawer
              fullPipelineData={fullPipelineData}
              signData={signData}
              experimentData={experimentData}
              isOpen={showDrawer}
              onToggle={() => setShowDrawer(v => !v)}
            />
          </div>
        </CollapsibleSection>
      </div>

      {/* Post-execution deep diagnostic panels */}
      {isDone && experimentData && (
        <div style={{ marginBottom: 24 }}>
          <CollapsibleSection title="Deep Layer Diagnostics" badge="Post-Execution">
            <WorkflowPipeline stages={pipeline.stages} />
            <ThreatAssessment data={experimentData} protocolDecision={fullPipelineData?.verification.decision} />

            <div className="grid-2 section" style={{ marginBottom: 0 }}>
              {signData && <MessageAuth data={signData} />}
              <QuantumTeleportation results={experimentData.results} />
            </div>

            <ThreatDetection results={experimentData.results} attackType={experimentData.attack} />
            <StatisticalAnalysis results={experimentData.results} />
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}
