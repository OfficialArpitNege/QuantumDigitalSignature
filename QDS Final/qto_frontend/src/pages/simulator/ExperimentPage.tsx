import { useNavigate } from 'react-router-dom';
import { useSimulator } from '../../context/SimulatorContext';
import ScenarioSelector from '../../components/JudgeDemo/ScenarioSelector';
import ProtocolNetwork from '../../components/JudgeDemo/ProtocolNetwork';
import ProtocolProcessFlow from '../../components/JudgeDemo/ProtocolProcessFlow';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';

export default function ExperimentPage() {
  const navigate = useNavigate();
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
    setShowModal,
  } = useSimulator();

  const hasResults = !!fullPipelineData;
  const isDone = hasResults && !loading;
  const verdict = fullPipelineData?.verification.decision;

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

      {/* ══════════════════════════════════════════════════
          MAIN LABORATORY WORKSPACE — Choose → Configure → Run
      ══════════════════════════════════════════════════ */}
      <div className="lab-glass-shell" style={{ padding: '28px 32px', marginBottom: 24 }}>

        {/* 1. Experiment Scenario Selector */}
        <ScenarioSelector selectedAttack={scenarioAttack} onSelect={handleScenarioSelect} />

        {/* 2. Quantum Channel Visualization Hero */}
        <ProtocolNetwork
          attackType={scenarioAttack}
          stepIndex={stepIndex}
          isRunning={loading}
          isDone={isDone}
          verdict={verdict}
        />

        {/* 3. Real-Time Protocol Execution Flow */}
        <ProtocolProcessFlow
          stepIndex={stepIndex}
          isRunning={loading}
          isDone={isDone}
          verdict={verdict}
          verification={fullPipelineData?.verification}
          checksRevealed={checksRevealed}
        />


        {/* 3. Message Console & Primary Action Button */}
        <div style={{
          background: 'var(--lab-surface-2)',
          border: '1px solid var(--lab-border)',
          borderRadius: 16,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
        }}>
          {/* Message Payload Input */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <label style={{
              fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: '#1fb6d6', display: 'block', marginBottom: 6,
              fontFamily: "'IBM Plex Mono', monospace",
            }}>Alice's Message Payload</label>
            <input
              id="judge-message-input"
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') runProtocol(); }}
              placeholder="Enter message payload..."
              style={{
                width: '100%',
                padding: '14px 18px',
                border: '1px solid var(--lab-border)',
                borderRadius: 12,
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                color: 'var(--lab-text)',
                background: 'var(--lab-bg)',
                outline: 'none',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)',
              }}
            />
          </div>

          {/* Attack Strength slider if attack selected */}
          {scenarioAttack !== 'none' && (
            <div style={{ minWidth: 160 }}>
              <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lab-text)', display: 'block', marginBottom: 6 }}>
                Attack Intensity: {(attackStrength * 100).toFixed(0)}%
              </label>
              <input
                type="range" min="0.1" max="1.0" step="0.05"
                value={attackStrength}
                onChange={e => setAttackStrength(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#1fb6d6' }}
              />
            </div>
          )}

          {/* PRIMARY ACTION BUTTON */}
          <button
            id="run-protocol-btn"
            onClick={runProtocol}
            disabled={loading || !message.trim()}
            className="lab-transmit-btn"
            style={{
              background: loading
                ? '#64748b'
                : 'linear-gradient(135deg, #1fb6d6 0%, #1e40af 100%)',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(31, 182, 214, 0.35)',
            }}
          >
            {loading
              ? <><span style={{ animation: 'qds-spin 0.7s linear infinite', display: 'inline-block' }}>⚙</span> Executing Quantum Protocol…</>
              : <>▶ RUN PROTOCOL</>
            }
          </button>

          {/* Advanced Config toggle */}
          <button
            onClick={() => setShowAdvanced(v => !v)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--lab-text-sub)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >{showAdvanced ? '▲ Config' : '⚙ Config'}</button>

          {/* Advanced drawer */}
          {showAdvanced && (
            <div style={{
              flex: '0 0 100%',
              paddingTop: 16,
              marginTop: 4,
              borderTop: '1px solid var(--lab-border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 18,
            }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--lab-text-sub)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 4 }}>
                  Shots: {shots.toLocaleString()}
                </label>
                <input type="range" min="256" max="8192" step="256" value={shots}
                  onChange={e => setShots(parseInt(e.target.value))} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--lab-text-sub)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 4 }}>
                  Max Symbols: {maxSymbols}
                </label>
                <input type="range" min="1" max="8" step="1" value={maxSymbols}
                  onChange={e => setMaxSymbols(parseInt(e.target.value))} />
              </div>
            </div>
          )}
        </div>
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
            Select an attack scenario above, configure Alice's payload, then click{' '}
            <strong style={{ color: '#cc0000' }}>▶ RUN PROTOCOL</strong> to initiate quantum teleportation.
          </div>
        </div>
      )}
    </div>
  );
}
