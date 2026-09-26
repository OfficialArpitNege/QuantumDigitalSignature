import { useSimulator } from '../../context/SimulatorContext';
import AttackBlindFlowModal from '../../components/JudgeDemo/AttackBlindFlowModal';
import ResearchResultsDashboard from '../../components/JudgeDemo/ResearchResultsDashboard';
import TechnicalDetailsDrawer from '../../components/JudgeDemo/TechnicalDetailsDrawer';

export default function ResearchPage() {
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
  } = useSimulator();

  return (
    <div style={{ animation: 'qds-appear 0.3s ease' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span className="eyebrow" style={{ color: '#0F0F0F', margin: 0, fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>
            RESEARCH &amp; DIAGNOSTICS
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(22px, 2.5vw, 28px)',
          fontWeight: 800,
          color: '#0F0F0F',
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          Security Architecture &amp; Empirical Research Benchmarks
        </h1>
      </div>

      {/* 1. SECURITY ARCHITECTURE */}
      <div style={{ marginBottom: 16 }}>
        <AttackBlindFlowModal attackType={scenarioAttack} />
      </div>

      {/* 2. RESEARCH BENCHMARK SUMMARY & MULTI-TRIAL RUNNER */}
      <div style={{ marginBottom: 16 }}>
        <ResearchResultsDashboard
          benchmarkData={benchmarkData}
          forgeryData={forgeryData}
          loading={benchmarkLoading}
          onRunBenchmark={runResearchBenchmarks}
        />
      </div>

      {/* 3. FULL DIAGNOSTICS & AUDIT LOG */}
      <div style={{ marginBottom: 16 }}>
        <TechnicalDetailsDrawer
          fullPipelineData={fullPipelineData}
          signData={signData}
          experimentData={experimentData}
          isOpen={showDrawer}
          onToggle={() => setShowDrawer(v => !v)}
        />
      </div>
    </div>
  );
}
