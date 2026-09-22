import type { ExtendedAttackType } from './ScenarioSelector';
import { SCENARIOS } from './ScenarioSelector';

interface Props {
  attackType: ExtendedAttackType;
  stepIndex: number;   // -1 = idle, 0 = SIGN, 1 = ENCODE, 2 = TRANSMIT, 3 = ANALYZE, 4 = DECIDE, 5 = VERIFY, 6 = DONE
  isRunning: boolean;
  isDone: boolean;
  verdict?: 'ACCEPT' | 'REJECT';
}

const STAGE_LABELS = [
  'Generating SHA-256 digest + HMAC signature material…',
  'Encoding payload into quantum qubit spin states (|0⟩, |1⟩, |ψ⟩)…',
  'Initiating quantum teleportation over fiber-optic Bell pair channel…',
  'Evaluating quantum state fidelity & statistical divergence…',
  'Running deterministic verification gates (Sig, ID, Replay, Quantum)…',
  'Bob verifying received quantum state & decision consensus…',
];

const ATTACK_DETECTION_LABEL: Partial<Record<ExtendedAttackType, string>> = {
  forgery: '⚠ ANOMALY DETECTED — HMAC signature tampering detected',
  replay: '⚠ ANOMALY DETECTED — Replayed session nonce detected',
  channel_manipulation: '⚠ ANOMALY DETECTED — Entangled state perturbed by channel noise',
  impersonation: '⚠ ANOMALY DETECTED — Sender identity spoofing attempt intercepted',
  unauthorized_verification: '⚠ ANOMALY DETECTED — Unauthorized verification key attempt detected',
};

export default function ProtocolNetwork({ attackType, stepIndex, isRunning, isDone, verdict }: Props) {
  const scenario = SCENARIOS.find(s => s.id === attackType) ?? SCENARIOS[0];
  const isAttackConfigured = attackType !== 'none';

  // CRITICAL REQUIREMENT: Red/Threat visual state is ONLY activated upon actual threat detection
  // (stepIndex >= 4 / DECIDE stage or final REJECT decision), NEVER before execution or during SIGN/ENCODE/TRANSMIT!
  const isThreatDetected = (isDone && verdict === 'REJECT') || (isRunning && stepIndex >= 4 && isAttackConfigured);
  const pulseColor = isThreatDetected ? '#ef4444' : '#1fb6d6';

  let channelLabel = '';
  if (isRunning && stepIndex >= 0 && stepIndex < STAGE_LABELS.length) {
    channelLabel = (isThreatDetected && ATTACK_DETECTION_LABEL[attackType])
      ? ATTACK_DETECTION_LABEL[attackType]!
      : STAGE_LABELS[stepIndex];
  } else if (isDone && verdict) {
    channelLabel = verdict === 'ACCEPT'
      ? '✓ Protocol Verification Passed — ACCEPTED'
      : (ATTACK_DETECTION_LABEL[attackType] || '✕ Protocol Verification Failed — REJECTED');
  } else if (!isRunning && !isDone) {
    channelLabel = isAttackConfigured
      ? `Quantum Laboratory Console Ready — Configured Scenario: ${scenario.label}`
      : 'Quantum Laboratory Console Ready — Standard Protocol Simulation';
  }

  const aliceActive = isRunning && (stepIndex === 0 || stepIndex === 1 || stepIndex === 2);
  const bobActive = isRunning && (stepIndex === 2 || stepIndex === 4 || stepIndex === 5);
  const eveActive = isAttackConfigured && (isThreatDetected || (isRunning && stepIndex === 2));

  const verdictColor = verdict === 'ACCEPT' ? '#10b981' : verdict === 'REJECT' ? '#ef4444' : undefined;

  return (
    <div className="lab-canvas" style={{ marginBottom: 18 }}>
      {/* Precise Micro-Dot Grid Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          radial-gradient(rgba(31, 182, 214, 0.16) 1.2px, transparent 1.2px),
          linear-gradient(rgba(31, 182, 214, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px, 40px 40px',
        pointerEvents: 'none',
      }} />

      {/* Top Status Bar */}
      <div
        className="top-status-bar"
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--lab-border, rgba(31, 182, 214, 0.15))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: 'var(--status-bar-bg, rgba(8, 14, 26, 0.75))',
          position: 'relative',
          zIndex: 2,
          minHeight: 44,
          transition: 'background 0.4s ease, border-color 0.4s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isRunning ? '#f59e0b' : isDone ? (verdict === 'ACCEPT' ? '#10b981' : '#ef4444') : '#1fb6d6',
            boxShadow: isRunning ? '0 0 10px #f59e0b' : '0 0 8px #1fb6d6',
            animation: isRunning ? 'qds-eve-pulse 1s ease-in-out infinite' : 'none',
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 12.5,
            fontFamily: "'JetBrains Mono', monospace",
            color: isThreatDetected
              ? '#fca5a5'
              : isDone && verdict === 'ACCEPT'
              ? '#6ee7b7'
              : 'var(--status-text-color, #38bdf8)',
            fontWeight: 700,
            transition: 'color 0.4s ease',
          }}>
            {channelLabel}
          </span>
        </div>

        {/* Top Badge: Neutral before detection, Threat Red only AFTER actual detection! */}
        <div style={{
          fontSize: 10,
          fontWeight: 800,
          padding: '4px 12px',
          borderRadius: 100,
          background: isThreatDetected
            ? 'rgba(239, 68, 68, 0.15)'
            : 'rgba(31, 182, 214, 0.12)',
          border: `1px solid ${isThreatDetected ? 'rgba(239, 68, 68, 0.4)' : 'rgba(31, 182, 214, 0.3)'}`,
          color: isThreatDetected ? '#ef4444' : '#1fb6d6',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
          transition: 'all 0.4s ease',
        }}>
          {isThreatDetected
            ? `⚠ THREAT DETECTED: ${scenario.label}`
            : isAttackConfigured
            ? `SCENARIO CONFIG: ${scenario.label}`
            : '✓ LEGITIMATE PROTOCOL'
          }
        </div>
      </div>

      {/* Main Quantum Channel Network Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '36px 40px',
        gap: 0,
        position: 'relative',
        zIndex: 1,
        minHeight: 200,
      }}>

        {/* ── ALICE NODE ── */}
        <ActorNode
          label="ALICE"
          role="Legitimate Sender"
          icon="👩‍💻"
          color="#1fb6d6"
          isActive={aliceActive || (isDone && verdict === 'ACCEPT')}
          badge={isRunning && stepIndex <= 1 ? (stepIndex === 0 ? 'SIGNING' : 'ENCODING') : undefined}
          verdict={isDone ? verdict : undefined}
        />

        {/* ── CINEMATIC FIBER-OPTIC QUANTUM CHANNEL TRACK ── */}
        <div style={{ flex: 1, position: 'relative', height: 90, minWidth: 0, display: 'flex', alignItems: 'center' }}>

          {/* Outer Ambient Fiber Duct Glow */}
          <div style={{
            position: 'absolute',
            left: 0, right: 0,
            height: 10,
            borderRadius: 999,
            background: isThreatDetected
              ? 'linear-gradient(90deg, rgba(31,182,214,0.3), rgba(239,68,68,0.6) 50%, rgba(124,108,246,0.3))'
              : 'linear-gradient(90deg, rgba(31,182,214,0.3), rgba(56,189,248,0.6) 50%, rgba(16,185,129,0.3))',
            filter: 'blur(6px)',
            opacity: isRunning && (stepIndex === 2 || stepIndex === 3) ? 0.9 : 0.4,
            transition: 'all 0.5s ease',
          }} />

          {/* Inner Core Fiber Guide Line — Stays clean cyan/blue during transmission! */}
          <div style={{
            position: 'absolute',
            left: 0, right: 0,
            height: 3,
            borderRadius: 999,
            background: isThreatDetected
              ? 'linear-gradient(90deg, #1fb6d6, #ef4444, #7c6cf6)'
              : 'linear-gradient(90deg, #1fb6d6, #38bdf8 50%, #10b981)',
            boxShadow: isThreatDetected
              ? '0 0 14px #ef4444, 0 0 28px rgba(239, 68, 68, 0.5)'
              : '0 0 14px #1fb6d6, 0 0 28px rgba(31, 182, 214, 0.5)',
            transition: 'all 0.5s ease',
          }} />

          {/* CINEMATIC ENERGY PULSE & SOFT AMBIENT TRAIL (Alice -> Bob) */}
          {isRunning && (stepIndex === 2 || stepIndex === 3) && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: 20,
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              overflow: 'visible',
            }}>
              {/* Energy pulse beam wrapper */}
              <div style={{
                position: 'absolute',
                top: '50%',
                display: 'flex',
                alignItems: 'center',
                animation: 'qds-energy-beam 2.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                zIndex: 4,
              }}>
                {/* Trailing ambient energy glow stream */}
                <div style={{
                  width: 140,
                  height: 6,
                  borderRadius: 100,
                  background: `linear-gradient(90deg, transparent, ${pulseColor}66 50%, ${pulseColor} 100%)`,
                  filter: 'blur(1px)',
                  boxShadow: `0 0 12px ${pulseColor}`,
                }} />

                {/* Bright Energy Core Node */}
                <div style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow: `0 0 12px #ffffff, 0 0 24px ${pulseColor}, 0 0 36px ${pulseColor}`,
                  marginLeft: -7,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}>
                  <span style={{ fontSize: 7, color: '#0b1220', fontWeight: 900 }}>⚛</span>
                </div>

                {/* Floating Qubit Symbol Chip */}
                <div style={{
                  position: 'absolute',
                  top: -20,
                  left: 60,
                  fontSize: 10,
                  fontWeight: 900,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: pulseColor,
                  background: 'var(--lab-bg)',
                  border: `1px solid ${pulseColor}66`,
                  padding: '1px 7px',
                  borderRadius: 100,
                  boxShadow: `0 2px 8px ${pulseColor}44`,
                  whiteSpace: 'nowrap',
                }}>
                  |ψ⟩ payload
                </div>
              </div>
            </div>
          )}

          {/* ANALYZE STAGE: Scanning laser sweep effect */}
          {isRunning && stepIndex === 3 && (
            <div style={{
              position: 'absolute',
              top: '-20%',
              bottom: '-20%',
              width: 4,
              background: isThreatDetected ? '#ef4444' : '#1fb6d6',
              boxShadow: isThreatDetected ? '0 0 20px #ef4444, 0 0 40px #ef4444' : '0 0 20px #1fb6d6, 0 0 40px #1fb6d6',
              animation: 'qds-flow 2.2s ease-in-out infinite alternate',
              zIndex: 5,
              borderRadius: 2,
            }} />
          )}

          {/* Bell Pair formula tag */}
          <div
            className="bell-pair-tag"
            style={{
              position: 'absolute',
              top: -24,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--bell-text, #38bdf8)',
              background: 'var(--bell-bg, rgba(8, 14, 26, 0.9))',
              padding: '4px 16px',
              borderRadius: 100,
              whiteSpace: 'nowrap',
              border: '1px solid var(--bell-bd, rgba(31, 182, 214, 0.3))',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              fontWeight: 700,
            }}
          >
            |Φ+⟩ = (|00⟩ + |11⟩) / √2
          </div>

          {/* EVE Threat Node & Optical Tap Line (Stays subtle until actual detection!) */}
          {isAttackConfigured && (
            <div style={{
              position: 'absolute',
              bottom: -74,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              zIndex: 5,
              transition: 'all 0.4s ease',
              opacity: eveActive ? 1 : 0.35,
            }}>
              {/* Optical tap line */}
              <div style={{
                width: 2, height: 22,
                background: isThreatDetected ? '#ef4444' : '#475569',
                borderLeft: isThreatDetected ? '2px dashed #ef4444' : '2px dashed #475569',
                boxShadow: isThreatDetected ? '0 0 8px #ef4444' : 'none',
              }} />
              <div style={{
                background: isThreatDetected ? 'rgba(69, 10, 10, 0.95)' : 'var(--card-bg, rgba(26, 16, 20, 0.9))',
                border: `1.5px solid ${isThreatDetected ? '#ef4444' : 'var(--card-border, #475569)'}`,
                borderRadius: 12,
                padding: '8px 18px',
                textAlign: 'center',
                animation: isThreatDetected ? 'qds-eve-pulse 1s ease-in-out infinite' : 'none',
                minWidth: 170,
                boxShadow: isThreatDetected ? '0 0 24px rgba(239, 68, 68, 0.5)' : 'none',
              }}>
                <div style={{ fontSize: 18, marginBottom: 2 }}>🕵️‍♀️</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: isThreatDetected ? '#fca5a5' : 'var(--card-text, #9ca3af)', letterSpacing: '0.08em' }}>
                  EVE (INTERCEPTOR)
                </div>
                <div style={{ fontSize: 9.5, color: isThreatDetected ? '#fca5a5' : 'var(--card-text-sub, #6b7280)' }}>
                  {isThreatDetected ? `⚠ ${scenario.eveRole}` : scenario.eveRole}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── BOB NODE ── */}
        <ActorNode
          label="BOB"
          role="Receiver / Verifier"
          icon="👨‍🔬"
          color="#10b981"
          isActive={bobActive || isDone}
          badge={isRunning && stepIndex >= 4 ? (stepIndex === 4 ? 'DECIDING' : 'VERIFYING') : undefined}
          verdict={isDone ? verdict : undefined}
          verdictColor={isDone ? verdictColor : undefined}
        />
      </div>

      {/* Pipeline progress bar indicator */}
      <div
        className="pipeline-bar-container"
        style={{
          borderTop: '1px solid var(--lab-border, rgba(31, 182, 214, 0.15))',
          padding: '10px 24px',
          display: 'flex',
          gap: 6,
          background: 'var(--pipeline-bg, rgba(8, 14, 26, 0.65))',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {STAGE_LABELS.map((label, idx) => {
          const done = isDone || (isRunning && idx < stepIndex);
          const active = isRunning && idx === stepIndex;
          const isFailedStep = isThreatDetected && idx >= 3;
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 3,
                background: done
                  ? (isFailedStep ? '#ef4444' : '#10b981')
                  : active
                    ? (isThreatDetected ? '#ef4444' : '#1fb6d6')
                    : 'var(--segment-inactive-bg, rgba(71, 85, 105, 0.3))',
                boxShadow: active ? `0 0 12px ${isThreatDetected ? '#ef4444' : '#1fb6d6'}` : 'none',
                transition: 'all 0.3s ease',
              }}
              title={label}
            />
          );
        })}
      </div>
    </div>
  );
}

// Sub-component: Actor Node
interface ActorNodeProps {
  label: string;
  role: string;
  icon: string;
  color: string;
  isActive: boolean;
  badge?: string;
  verdict?: 'ACCEPT' | 'REJECT';
  verdictColor?: string;
}

function ActorNode({ label, role, icon, color, isActive, badge, verdict, verdictColor }: ActorNodeProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      width: 140,
      flexShrink: 0,
    }}>
      <div style={{
        width: 76, height: 76,
        borderRadius: '50%',
        background: isActive ? `rgba(${color === '#1fb6d6' ? '31,182,214' : '16,185,129'},0.15)` : 'var(--actor-circle-bg, rgba(30, 41, 59, 0.6))',
        border: `2px solid ${isActive ? color : 'var(--actor-circle-bd, rgba(71, 85, 105, 0.4))'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 30,
        transition: 'all 0.3s ease',
        boxShadow: isActive ? `0 0 24px ${color}50` : 'none',
        position: 'relative',
      }}>
        {icon}
        <div style={{
          position: 'absolute',
          bottom: 4, right: 4,
          width: 12, height: 12,
          borderRadius: '50%',
          background: isActive ? color : 'var(--dot-bg, #374151)',
          border: '2px solid var(--dot-border, #080e1a)',
          transition: 'background 0.3s',
        }} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 13, fontWeight: 900,
          color: isActive ? color : 'var(--actor-label-color, #94a3b8)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          transition: 'color 0.3s',
        }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--lab-text-sub)', marginTop: 1 }}>{role}</div>
      </div>

      {badge && (
        <div style={{
          fontSize: 9,
          fontWeight: 800,
          background: 'rgba(31, 182, 214, 0.2)',
          color: '#38bdf8',
          border: '1px solid rgba(31, 182, 214, 0.4)',
          padding: '2px 8px',
          borderRadius: 100,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}>{badge}</div>
      )}
      {verdict && verdictColor && (
        <div style={{
          fontSize: 9,
          fontWeight: 900,
          background: `${verdictColor}22`,
          color: verdictColor,
          border: `1px solid ${verdictColor}44`,
          padding: '2px 8px',
          borderRadius: 100,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}>{verdict}</div>
      )}
    </div>
  );
}
