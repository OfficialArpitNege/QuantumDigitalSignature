import type { ProtocolVerificationResult } from '../../types/api';

interface Props {
  stepIndex: number; // -1 = idle, 0 = SIGN, 1 = ENCODE, 2 = TRANSMIT, 3 = ANALYZE, 4 = DECIDE, 5 = VERIFY, 6+ = DONE
  isRunning: boolean;
  isDone: boolean;
  verdict?: 'ACCEPT' | 'REJECT';
  verification?: ProtocolVerificationResult | null;
  checksRevealed?: number;
}

interface StageConfig {
  id: string;
  label: string;
  waitingDesc: string;
  activeDesc: string;
  completeDesc: string;
  icon: string;
}

const STAGES: StageConfig[] = [
  {
    id: 'sign',
    label: 'SIGN',
    waitingDesc: 'HMAC-SHA256',
    activeDesc: '🔐 Generating signature material...',
    completeDesc: 'Signature Material Ready',
    icon: '🔐',
  },
  {
    id: 'encode',
    label: 'ENCODE',
    waitingDesc: 'Qubit State Prep',
    activeDesc: '⚛ Converting payload into quantum symbols...',
    completeDesc: 'Quantum State Prepared',
    icon: '⚛',
  },
  {
    id: 'transmit',
    label: 'TRANSMIT',
    waitingDesc: 'Quantum Teleportation',
    activeDesc: '🌌 Transmitting quantum state through channel...',
    completeDesc: 'Teleportation Complete',
    icon: '🌌',
  },
  {
    id: 'analyze',
    label: 'ANALYZE',
    waitingDesc: 'Quantum Evidence',
    activeDesc: '📊 Scanning quantum evidence & fidelity...',
    completeDesc: 'Evidence Analyzed',
    icon: '📊',
  },
  {
    id: 'decide',
    label: 'DECIDE',
    waitingDesc: 'Verification Gates',
    activeDesc: '🛡️ Evaluating deterministic verification gates...',
    completeDesc: 'Gates Evaluated',
    icon: '🛡️',
  },
  {
    id: 'verify',
    label: 'VERIFY',
    waitingDesc: 'Bob Confirmation',
    activeDesc: '👨‍🔬 Bob verifying received state & consensus...',
    completeDesc: 'Protocol Consensus Reached',
    icon: '👨‍🔬',
  },
];

export default function ProtocolProcessFlow({
  stepIndex,
  isRunning,
  isDone,
  verdict,
  verification,
  checksRevealed = 0,
}: Props) {
  const isAccept = verdict === 'ACCEPT';

  return (
    <div className="lab-glass-shell" style={{
      padding: '20px 24px',
      marginBottom: 20,
      background: 'var(--lab-surface)',
      border: '1px solid var(--lab-border)',
      borderRadius: 16,
    }}>
      {/* Stage Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div style={{
          fontSize: 10.5,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#cc0000',
          fontFamily: "'IBM Plex Mono', monospace",
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span>⚛ QUANTUM PROTOCOL EXECUTION FLOW</span>
          {isRunning && (
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              background: 'rgba(204,0,0,0.12)',
              color: '#cc0000',
              padding: '2px 8px',
              borderRadius: 100,
              border: '1px solid rgba(204,0,0,0.3)',
              animation: 'qds-appear 0.3s ease',
            }}>
              ● LIVE SIMULATION
            </span>
          )}
          {isDone && (
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              background: isAccept ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: isAccept ? '#10b981' : '#ef4444',
              padding: '2px 8px',
              borderRadius: 100,
              border: `1px solid ${isAccept ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {isAccept ? '✓ PROTOCOL COMPLETE — ACCEPTED' : '❌ PROTOCOL COMPLETE — REJECTED'}
            </span>
          )}
        </div>

        {/* Current Active Step Badge */}
        {isRunning && stepIndex >= 0 && stepIndex < STAGES.length && (
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            color: '#1fb6d6',
            background: 'var(--lab-surface-2)',
            padding: '3px 10px',
            borderRadius: 6,
            border: '1px solid var(--lab-border)',
          }}>
            STAGE 0{stepIndex + 1}/06: <strong style={{ color: 'var(--lab-text)' }}>{STAGES[stepIndex].label}</strong>
          </div>
        )}
      </div>

      {/* Main Process Flow Nodes */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        position: 'relative',
        gap: 8,
      }}>
        {STAGES.map((stage, idx) => {
          const isComplete = isDone || stepIndex > idx;
          const isActive = isRunning && stepIndex === idx;
          const isWaiting = !isDone && stepIndex < idx;

          // Fail indicator logic if stage DECIDE or VERIFY failed
          const isFailedStage = isDone && !isAccept && (idx === 4 || idx === 5);

          return (
            <div
              key={stage.id}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 2,
                opacity: isWaiting ? 0.6 : 1,
                transition: 'opacity 0.3s ease',
              }}
            >
              {/* Top Node Indicator Circle */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 900,
                transition: 'all 0.4s ease',
                background: isComplete
                  ? (isFailedStage ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)')
                  : isActive
                  ? 'rgba(31, 182, 214, 0.2)'
                  : 'var(--lab-surface-2)',
                border: `2px solid ${
                  isComplete
                    ? (isFailedStage ? '#ef4444' : '#10b981')
                    : isActive
                    ? '#1fb6d6'
                    : 'var(--lab-border)'
                }`,
                color: isComplete
                  ? (isFailedStage ? '#ef4444' : '#10b981')
                  : isActive
                  ? '#1fb6d6'
                  : 'var(--lab-text-muted)',
                boxShadow: isActive
                  ? '0 0 16px rgba(31, 182, 214, 0.5)'
                  : isComplete
                  ? `0 0 10px ${isFailedStage ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`
                  : 'none',
                transform: isActive ? 'scale(1.12)' : 'scale(1)',
                marginBottom: 8,
              }}>
                {isComplete ? (
                  isFailedStage ? '✗' : '✓'
                ) : isActive ? (
                  <span style={{ animation: 'qds-spin 1.2s linear infinite', display: 'inline-block' }}>⚙</span>
                ) : (
                  <span style={{ opacity: 0.5 }}>○</span>
                )}
              </div>

              {/* Stage Title */}
              <div style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: isComplete
                  ? (isFailedStage ? '#ef4444' : '#10b981')
                  : isActive
                  ? 'var(--lab-text)'
                  : 'var(--lab-text-muted)',
                transition: 'color 0.3s ease',
                textAlign: 'center',
                marginBottom: 2,
              }}>
                {stage.label}
              </div>

              {/* Stage Status Description */}
              <div style={{
                fontSize: 9.5,
                color: isActive ? '#1fb6d6' : isComplete ? 'var(--lab-text-sub)' : 'var(--lab-text-muted)',
                textAlign: 'center',
                lineHeight: 1.35,
                maxWidth: 110,
                fontWeight: isActive ? 700 : 500,
                transition: 'color 0.3s ease',
                minHeight: 26,
              }}>
                {isActive ? stage.activeDesc : isComplete ? stage.completeDesc : stage.waitingDesc}
              </div>

              {/* Special Micro-Detail Badges during execution */}
              {isActive && idx === 4 && (
                <div style={{
                  marginTop: 4,
                  fontSize: 9,
                  fontWeight: 800,
                  background: 'rgba(31, 182, 214, 0.15)',
                  color: '#1fb6d6',
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: '1px solid rgba(31, 182, 214, 0.3)',
                }}>
                  Gates: {checksRevealed}/4
                </div>
              )}

              {isDone && idx === 4 && verification && (
                <div style={{
                  marginTop: 4,
                  fontSize: 9,
                  fontWeight: 800,
                  background: isAccept ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  color: isAccept ? '#10b981' : '#ef4444',
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: `1px solid ${isAccept ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}>
                  {isAccept ? '4/4 Passed' : `${[verification.signature_valid, verification.identity_valid, verification.replay_valid, verification.quantum_valid].filter(Boolean).length}/4 Passed`}
                </div>
              )}

              {/* Connecting Line to next stage */}
              {idx < STAGES.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: 17,
                  left: 'calc(50% + 20px)',
                  right: 'calc(-50% + 20px)',
                  height: 3,
                  background: 'var(--lab-border)',
                  borderRadius: 2,
                  zIndex: 1,
                  overflow: 'hidden',
                }}>
                  {/* Fill progress bar */}
                  <div style={{
                    height: '100%',
                    background: isComplete
                      ? 'linear-gradient(90deg, #10b981 0%, #1fb6d6 100%)'
                      : isActive
                      ? 'linear-gradient(90deg, #1fb6d6 0%, #38bdf8 100%)'
                      : 'transparent',
                    width: isComplete ? '100%' : isActive ? '60%' : '0%',
                    transition: 'width 1.2s ease-in-out',
                    boxShadow: isActive ? '0 0 8px #1fb6d6' : 'none',
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Stage Contextual Micro-Activity Bar */}
      {isRunning && stepIndex >= 0 && stepIndex < STAGES.length && (
        <div style={{
          marginTop: 14,
          padding: '10px 16px',
          background: 'var(--lab-surface-2)',
          border: '1px solid var(--lab-border)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          animation: 'qds-appear 0.25s ease',
        }}>
          <span style={{ fontSize: 16 }}>{STAGES[stepIndex].icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--lab-text)' }}>
              {STAGES[stepIndex].activeDesc}
            </div>
            <div style={{ fontSize: 9.5, color: 'var(--lab-text-sub)', marginTop: 1 }}>
              {stepIndex === 0 && 'Calculating SHA-256 message digest and HMAC signature keys...'}
              {stepIndex === 1 && 'Transforming message payload into quantum state symbols (|0⟩, |1⟩, |ψ⟩)...'}
              {stepIndex === 2 && 'Executing quantum teleportation protocol over Bell pair entangled channel...'}
              {stepIndex === 3 && 'Evaluating quantum state fidelity, total variation distance, and JSD metrics...'}
              {stepIndex === 4 && 'Evaluating Signature, Identity, Replay, and Quantum deterministic gates...'}
              {stepIndex === 5 && 'Transmitting final decision to Bob and verifying protocol state consensus...'}
            </div>
          </div>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            color: '#1fb6d6',
            background: 'rgba(31, 182, 214, 0.1)',
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid rgba(31, 182, 214, 0.3)',
          }}>
            EXECUTING STAGE 0{stepIndex + 1}
          </div>
        </div>
      )}
    </div>
  );
}
