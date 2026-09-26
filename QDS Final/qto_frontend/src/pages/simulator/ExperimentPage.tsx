import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulator } from '../../context/SimulatorContext';
import ScenarioSelector from '../../components/JudgeDemo/ScenarioSelector';
import ProtocolNetwork from '../../components/JudgeDemo/ProtocolNetwork';
import ProtocolProcessFlow from '../../components/JudgeDemo/ProtocolProcessFlow';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { ResultModal } from '../../components/ResultModal';
import AliceBobConsole from '../../components/JudgeDemo/AliceBobConsole';

export default function ExperimentPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const {
    scenarioAttack,
    handleScenarioSelect,
    message,
    setMessage,
    attackStrength,
    setAttackStrength,
    shots,
    setShots,
    maxSymbols,
    setMaxSymbols,
    showAdvanced,
    setShowAdvanced,
    loading,
    error,
    stepIndex,
    checksRevealed,
    runProtocol,
    fullPipelineData,
  } = useSimulator();

  const hasResults = !!fullPipelineData;
  const isDone = hasResults && !loading;
  const verdict = fullPipelineData?.verification.decision;

  useEffect(() => {
    if (isDone && verdict) {
      setModalOpen(true);
    }
  }, [isDone, verdict]);

  return (
    <div>
      {/* ══════════════════════════════════════════════════
          COMPACT HERO — Header & Title
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
              <span className="eyebrow" style={{ color: '#0F0F0F', margin: 0, fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>
                QUANTUM SECURITY LAB
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(20px, 2.4vw, 26px)',
              fontWeight: 800,
              lineHeight: 1.2,
              color: '#0F0F0F',
              margin: 0,
              letterSpacing: '-0.01em',
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              Teleportation-Based Signature &amp; Threat Detection
            </h1>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MAIN LABORATORY WORKSPACE — Choose → Configure → Run
      ══════════════════════════════════════════════════ */}
      <div className="lab-glass-shell" style={{ padding: '28px 32px', marginBottom: 24 }}>

        {/* 1. Experiment Scenario Selector */}
        <ScenarioSelector selectedAttack={scenarioAttack} onSelect={handleScenarioSelect} />

        {/* 2. Interactive Transmission & Receiver Console */}
        <AliceBobConsole
          message={message}
          setMessage={setMessage}
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

        {/* 3. Quantum Channel Visualization Hero */}
        <ProtocolNetwork
          attackType={scenarioAttack}
          stepIndex={stepIndex}
          isRunning={loading}
          isDone={isDone}
          verdict={verdict}
        />

        {/* 4. Real-Time Protocol Execution Flow */}
        <ProtocolProcessFlow
          stepIndex={stepIndex}
          isRunning={loading}
          isDone={isDone}
          verdict={verdict}
          verification={fullPipelineData?.verification}
          checksRevealed={checksRevealed}
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
          COMPACT RESULT BANNER AFTER EXECUTION
      ══════════════════════════════════════════════════ */}
      {isDone && fullPipelineData && (
        <div className="lab-glass-shell" style={{
          padding: '24px 32px',
          marginBottom: 28,
          animation: 'qds-appear 0.4s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
          borderLeft: `6px solid ${verdict === 'ACCEPT' ? '#10b981' : '#ef4444'}`,
        }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.14em', color: verdict === 'ACCEPT' ? '#10b981' : '#ef4444',
              marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace",
            }}>
              SIMULATION COMPLETE
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontSize: 22,
                fontWeight: 900,
                color: verdict === 'ACCEPT' ? '#10b981' : '#ef4444',
                letterSpacing: '-0.01em',
              }}>
                {verdict === 'ACCEPT' ? '✓ ACCEPTED' : '❌ REJECTED'}
              </span>
              <span style={{
                fontSize: 12,
                color: 'var(--lab-text-sub)',
                fontWeight: 600,
              }}>
                {verdict === 'ACCEPT'
                  ? 'All 4 deterministic verification gates passed clean.'
                  : `Quantum protocol rejected transmission (${fullPipelineData.verification.reason || 'Verification check failed'}).`
                }
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/simulator/analysis')}
            className="lab-transmit-btn"
            style={{
              background: 'linear-gradient(135deg, #1fb6d6 0%, #1e40af 100%)',
              boxShadow: '0 6px 20px rgba(31, 182, 214, 0.3)',
              fontSize: 13,
              padding: '12px 24px',
            }}
          >
            VIEW ANALYSIS →
          </button>
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

      <ResultModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        verdict={verdict || null}
        attackType={
          fullPipelineData?.signature?.attack_type ||
          (scenarioAttack !== 'none' ? scenarioAttack.toUpperCase() : 'None')
        }
        reason={fullPipelineData?.verification?.reason}
      />
    </div>
  );
}
