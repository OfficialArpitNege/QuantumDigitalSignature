import { useState, useCallback, useEffect, useRef } from 'react';
import '../qds-lab.css';
import type { AttackType, ExperimentResponse, SignResponse, FullPipelineResponse, PerformanceBenchmarkResponse, ForgeryBenchmarkResponse } from '../types/api';
import { api } from '../services/api';


// Diagnostic panels (below the fold)
import WorkflowPipeline from '../components/WorkflowPipeline';
import ThreatAssessment from '../components/ThreatAssessment';
import MessageAuth from '../components/MessageAuth';
import QuantumTeleportation from '../components/QuantumTeleportation';
import ThreatDetection from '../components/ThreatDetection';
import StatisticalAnalysis from '../components/StatisticalAnalysis';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

// Judge Demo components
import ScenarioSelector from '../components/JudgeDemo/ScenarioSelector';
import type { ExtendedAttackType } from '../components/JudgeDemo/ScenarioSelector';
import ProtocolNetwork from '../components/JudgeDemo/ProtocolNetwork';
import VerdictBanner from '../components/JudgeDemo/VerdictBanner';
import VerificationChecks from '../components/JudgeDemo/VerificationChecks';
import WhyExplanation from '../components/JudgeDemo/WhyExplanation';
import EvidenceStrip from '../components/JudgeDemo/EvidenceStrip';
import TechnicalDetailsDrawer from '../components/JudgeDemo/TechnicalDetailsDrawer';
import HowItWorksModal from '../components/JudgeDemo/HowItWorksModal';
import AttackBlindFlowModal from '../components/JudgeDemo/AttackBlindFlowModal';
import ResearchResultsDashboard from '../components/JudgeDemo/ResearchResultsDashboard';
import CollapsibleSection from '../components/JudgeDemo/CollapsibleSection';
import AliceBobConsole from '../components/JudgeDemo/AliceBobConsole';

type PipelineStatus = 'idle' | 'active' | 'complete' | 'anomaly';
interface PipelineState { stages: Array<{ status: PipelineStatus }>; }
const IDLE_PIPELINE: PipelineState = { stages: Array(9).fill({ status: 'idle' }) };
function makePipeline(hasAnomaly: boolean): PipelineState {
  const stages = Array(8).fill({ status: 'complete' as PipelineStatus });
  stages.push({ status: (hasAnomaly ? 'anomaly' : 'complete') as PipelineStatus });
  return { stages };
}

const TIMELINE_STEPS = 9;

export default function Dashboard() {
  // ── Scenario / config state ──────────────────────────────
  const [scenarioAttack, setScenarioAttack] = useState<ExtendedAttackType>('none');
  const [message, setMessage] = useState('HELLO QUANTUM');
  const [impersonatedMessage, setImpersonatedMessage] = useState('');
  const [shots, setShots] = useState(2048);
  const [maxSymbols, setMaxSymbols] = useState(4);
  const [attackStrength, setAttackStrength] = useState(0.35);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ── Execution state ──────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [checksRevealed, setChecksRevealed] = useState(0);
  const [pipeline, setPipeline] = useState<PipelineState>(IDLE_PIPELINE);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkRevealRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Response stores ──────────────────────────────────────
  const [fullPipelineData, setFullPipelineData] = useState<FullPipelineResponse | null>(null);
  const [experimentData, setExperimentData] = useState<ExperimentResponse | null>(null);
  const [signData, setSignData] = useState<SignResponse | null>(null);

  // Benchmark response stores
  const [benchmarkData, setBenchmarkData] = useState<PerformanceBenchmarkResponse | null>(null);
  const [forgeryData, setForgeryData] = useState<ForgeryBenchmarkResponse | null>(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const runResearchBenchmarks = async () => {
    setBenchmarkLoading(true);
    try {
      const [bmRes, fgRes] = await Promise.all([
        api.runPerformanceBenchmark(10),
        api.runForgeryExperiment(50),
      ]);
      setBenchmarkData(bmRes);
      setForgeryData(fgRes);
    } catch (e: unknown) {
      console.error('Failed to run research benchmarks:', e);
    } finally {
      setBenchmarkLoading(false);
    }
  };

  const backendAttack = useCallback((): AttackType => {
    return scenarioAttack as AttackType;
  }, [scenarioAttack]);

  useEffect(() => {
    if (loading) {
      setStepIndex(0);
      setChecksRevealed(0);
      intervalRef.current = setInterval(() => {
        setStepIndex(prev => Math.min(prev + 1, TIMELINE_STEPS - 1));
      }, 420);
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (fullPipelineData) {
        setStepIndex(TIMELINE_STEPS);
        setChecksRevealed(0);
        let count = 0;
        checkRevealRef.current = setInterval(() => {
          count++;
          setChecksRevealed(count);
          if (count >= 4) { clearInterval(checkRevealRef.current!); checkRevealRef.current = null; }
        }, 250);
      } else {
        setStepIndex(-1);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loading, fullPipelineData]);

  useEffect(() => {
    return () => { if (checkRevealRef.current) clearInterval(checkRevealRef.current); };
  }, []);

  const resetResults = useCallback(() => {
    setFullPipelineData(null);
    setExperimentData(null);
    setSignData(null);
    setPipeline(IDLE_PIPELINE);
    setStepIndex(-1);
    setChecksRevealed(0);
    setShowDrawer(false);
    setError(null);
  }, []);

  const handleScenarioSelect = useCallback((a: ExtendedAttackType) => {
    setScenarioAttack(a);
    if (a !== 'impersonation') {
      setImpersonatedMessage('');
    }
    resetResults();
  }, [resetResults]);

  const runProtocol = async () => {
    if (!message.trim()) return;
    resetResults();
    setLoading(true);
    setPipeline({ stages: [{ status: 'active' }, ...Array(8).fill({ status: 'idle' })] });

    try {
      const attack = backendAttack();
      const effectiveMsg = (attack === 'impersonation' && impersonatedMessage.trim())
        ? impersonatedMessage.trim()
        : message;

      const reqBody = {
        message: effectiveMsg,
        attack,
        attack_strength: attackStrength,
        shots,
        max_symbols: maxSymbols,
      };

      const fullRes = await api.runFullPipeline(reqBody);
      setFullPipelineData(fullRes);

      const experimentAttack = attack === 'unauthorized_verification'
        ? ({ ...reqBody, attack: 'none' as AttackType })
        : reqBody;

      Promise.all([
        api.signMessage({ message: effectiveMsg, max_symbols: maxSymbols }),
        api.runExperiment(experimentAttack),
      ]).then(([signRes, expRes]) => {
        setSignData(signRes);
        setExperimentData(expRes);
      }).catch(() => { });

      const hasAnomaly = fullRes.verification.decision === 'REJECT';
      setPipeline(makePipeline(hasAnomaly));

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setPipeline(IDLE_PIPELINE);
    } finally {
      setLoading(false);
    }
  };

  const hasResults = !!fullPipelineData;
  const isDone = hasResults && !loading;
  const verdict = fullPipelineData?.verification.decision;

  return (
    <div className="lab-page-root">
      {/* Background Ambient Orbs matching 3D Landing Page */}
      <div className="lab-ambient-bg">
        <div className="lab-orb-1" />
        <div className="lab-orb-2" />
        <div className="lab-orb-3" />
      </div>

      <HowItWorksModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <main style={{ padding: '32px 0 80px', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ maxWidth: 1280 }}>

          {/* ══════════════════════════════════════════════════
              COMPACT HERO — one title, one line, one status
          ══════════════════════════════════════════════════ */}
          <div style={{
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span className="eyebrow" style={{ color: '#cc0000', margin: 0 }}>
                    QUANTUM SECURITY LAB
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                    background: 'rgba(204, 0, 0, 0.12)', color: '#cc0000',
                    border: '1px solid rgba(204, 0, 0, 0.3)', padding: '2px 8px', borderRadius: 100,
                  }}>Research Prototype</span>
                </div>
                <h1 style={{
                  fontSize: 'clamp(20px, 2.4vw, 26px)',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  color: 'var(--lab-text)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}>
                  Teleportation-Based Signature &amp; Threat Detection
                </h1>
              </div>

              <button
                onClick={() => setShowModal(true)}
                style={{
                  background: 'rgba(204, 0, 0, 0.08)',
                  border: '1px solid rgba(204, 0, 0, 0.3)',
                  color: '#cc0000',
                  padding: '7px 16px',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >📖 How It Works</button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              MAIN LABORATORY WORKSPACE — choose → configure → run
          ══════════════════════════════════════════════════ */}
          <div className="lab-glass-shell" style={{ padding: '28px 32px', marginBottom: 20 }}>

            {/* 1. Experiment selector */}
            <ScenarioSelector selectedAttack={scenarioAttack} onSelect={handleScenarioSelect} />

            {/* 2. Quantum Channel Visualization Hero */}
            <ProtocolNetwork
              attackType={scenarioAttack}
              stepIndex={stepIndex}
              isRunning={loading}
              isDone={isDone}
              verdict={verdict}
            />

            {/* 3. Interactive Transmission & Receiver Console */}
            <AliceBobConsole
              message={message}
              setMessage={setMessage}
              impersonatedMessage={impersonatedMessage}
              setImpersonatedMessage={setImpersonatedMessage}
              scenarioAttack={scenarioAttack}
              attackStrength={attackStrength}
              setAttackStrength={setAttackStrength}
              loading={loading}
              isDone={isDone}
              verdict={verdict}
              verification={fullPipelineData?.verification}
              onRunProtocol={runProtocol}
              showAdvanced={showAdvanced}
              setShowAdvanced={setShowAdvanced}
              shots={shots}
              setShots={setShots}
              maxSymbols={maxSymbols}
              setMaxSymbols={setMaxSymbols}
            />
          </div>

          {/* ══════════════════════════════════════════════════
              LOADING STATE
          ══════════════════════════════════════════════════ */}
          {loading && (
            <div className="lab-glass-shell" style={{ padding: 24, marginBottom: 28 }}>
              <LoadingState />
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              ERROR STATE
          ══════════════════════════════════════════════════ */}
          {error && !loading && (
            <div style={{ marginBottom: 28 }}>
              <ErrorState error={error} onRetry={runProtocol} />
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              SIMULATION RESULT CONSOLE (DYNAMICALLY REVEALED)
          ══════════════════════════════════════════════════ */}
          {isDone && fullPipelineData && (
            <div className="lab-glass-shell" style={{
              padding: '28px 32px',
              marginBottom: 28,
              animation: 'qds-appear 0.4s ease',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.14em', color: '#cc0000', marginBottom: 16,
                fontFamily: "'IBM Plex Mono', monospace",
              }}>SIMULATION RESULT</div>

              {/* Verdict Banner */}
              <VerdictBanner verification={fullPipelineData.verification} />

              {/* Verification Checks */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--lab-text-sub)', marginBottom: 10 }}>
                  Deterministic Verification Gates
                </div>
                <VerificationChecks
                  verification={fullPipelineData.verification}
                  revealed={checksRevealed}
                />
              </div>

              {/* Why Explanation */}
              <WhyExplanation
                verification={fullPipelineData.verification}
                attackType={scenarioAttack}
              />

              {/* Quantum Evidence Strip */}
              <EvidenceStrip
                statisticalAnalysis={fullPipelineData.statistical_analysis}
                quantumTransmission={fullPipelineData.quantum_transmission}
                experimentData={experimentData}
                verification={fullPipelineData.verification}
              />

              {/* Technical Details Drawer */}
              <div style={{ paddingTop: 16, borderTop: '1px solid var(--lab-border)', marginTop: 16 }}>
                <TechnicalDetailsDrawer
                  fullPipelineData={fullPipelineData}
                  signData={signData}
                  experimentData={experimentData}
                  isOpen={showDrawer}
                  onToggle={() => setShowDrawer(v => !v)}
                />
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              READY STATE (BEFORE RUNNING)
          ══════════════════════════════════════════════════ */}
          {!hasResults && !loading && !error && (
            <div className="lab-glass-shell" style={{
              textAlign: 'center',
              padding: '48px 32px',
              marginBottom: 28,
              color: 'var(--lab-text-sub)',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(204, 0, 0, 0.08)', border: '1px solid rgba(204, 0, 0, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px', fontSize: 26, color: '#cc0000',
              }}>⚛</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--lab-text)', marginBottom: 6 }}>
                Quantum Laboratory Console Ready
              </div>
              <div style={{ fontSize: 13, maxWidth: 440, margin: '0 auto', lineHeight: 1.6, color: 'var(--lab-text-sub)' }}>
                Select an attack scenario above, configure the sender's payload, then click{' '}
                <strong style={{ color: '#cc0000' }}>▶ RUN PROTOCOL</strong> to initiate quantum teleportation.
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              ADVANCED RESEARCH — closed by default, expand on demand
          ══════════════════════════════════════════════════ */}
          <div style={{ marginTop: 32 }}>
            <div style={{
              fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.14em', color: 'var(--lab-text-sub)', marginBottom: 12,
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              Advanced Research
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Security architecture is already a self-contained, closed-by-default
                  accordion — reused verbatim here rather than re-wrapped. */}
              <AttackBlindFlowModal attackType={scenarioAttack} />

              <CollapsibleSection title="Research Benchmarks" badge="Phase 15 Validated">
                <ResearchResultsDashboard
                  benchmarkData={benchmarkData}
                  forgeryData={forgeryData}
                  loading={benchmarkLoading}
                  onRunBenchmark={runResearchBenchmarks}
                />
              </CollapsibleSection>

              {isDone && experimentData && (
                <CollapsibleSection title="Full Diagnostics" badge="Post-Execution">
                  <WorkflowPipeline stages={pipeline.stages} />
                  <ThreatAssessment data={experimentData} protocolDecision={fullPipelineData?.verification.decision} />

                  <div className="grid-2 section" style={{ marginBottom: 0 }}>
                    {signData && <MessageAuth data={signData} />}
                    <QuantumTeleportation results={experimentData.results} />
                  </div>

                  <ThreatDetection results={experimentData.results} attackType={experimentData.attack} />
                  <StatisticalAnalysis results={experimentData.results} />
                </CollapsibleSection>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
