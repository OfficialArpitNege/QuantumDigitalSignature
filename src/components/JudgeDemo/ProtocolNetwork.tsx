import { useNavigate } from 'react-router-dom';
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
  'Receiver verifying received quantum state & decision consensus…',
];

const ATTACK_DETECTION_LABEL: Partial<Record<ExtendedAttackType, string>> = {
  forgery: 'ANOMALY DETECTED — HMAC signature tampering detected',
  replay: 'ANOMALY DETECTED — Replayed session nonce detected',
  channel_manipulation: 'ANOMALY DETECTED — Entangled state perturbed by channel noise',
  impersonation: 'ANOMALY DETECTED — Sender identity spoofing attempt intercepted',
};

export default function ProtocolNetwork({ attackType, stepIndex, isRunning, isDone, verdict }: Props) {
  const navigate = useNavigate();
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
      ? 'Protocol Verification Passed — ACCEPTED'
      : (ATTACK_DETECTION_LABEL[attackType] || 'Protocol Verification Failed — REJECTED');
  } else if (!isRunning && !isDone) {
    channelLabel = isAttackConfigured
      ? `Scenario Configured: ${scenario.label}`
      : 'Protocol Simulation';
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
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
              ? '#991B1B'
              : isDone && verdict === 'ACCEPT'
              ? '#065F46'
              : '#0F0F0F',
            fontWeight: 800,
            transition: 'color 0.4s ease',
          }}>
            {channelLabel}
          </span>

          {isDone && (
            <button
              onClick={() => navigate('/simulator/analysis')}
              style={{
                background: '#1D4ED8',
                color: '#FFFFFF',
                border: '1.5px solid #0F0F0F',
                boxShadow: '2px 2px 0px #0F0F0F',
                borderRadius: 2,
                padding: '4px 12px',
                fontSize: 11,
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: 'pointer',
                marginLeft: 8,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              VIEW ANALYSIS →
            </button>
          )}
        </div>

        {/* Top Badge: Neutral before completion, Threat Red ONLY AFTER process is complete and REJECT decision given */}
        <div style={{
          fontSize: 10,
          fontWeight: 800,
          padding: '4px 12px',
          borderRadius: 100,
          background: (isDone && verdict === 'REJECT')
            ? '#FEE2E2'
            : 'rgba(31, 182, 214, 0.12)',
          border: `1.5px solid ${(isDone && verdict === 'REJECT') ? '#991B1B' : 'rgba(31, 182, 214, 0.4)'}`,
          color: (isDone && verdict === 'REJECT') ? '#991B1B' : '#0F0F0F',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
          transition: 'all 0.4s ease',
        }}>
          {(isDone && verdict === 'REJECT')
            ? `THREAT DETECTED: ${scenario.label}`
            : isAttackConfigured
            ? `SCENARIO CONFIG: ${scenario.label}`
            : 'NO ATTACK'
          }
        </div>
      </div>

      {/* Main Quantum Channel Network Row */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        padding: '36px 40px 60px 40px',
        gap: 0,
        position: 'relative',
        zIndex: 1,
        minHeight: 240,
      }}>

        {/* ── SENDER NODE ── */}
        <ActorNode
          label="SENDER"
          role="Legitimate Sender"
          icon="👩‍💻"
          color="#1fb6d6"
          isActive={aliceActive || (isDone && verdict === 'ACCEPT')}
          badge={isRunning && stepIndex <= 1 ? (stepIndex === 0 ? 'SIGNING' : 'ENCODING') : undefined}
          verdict={isDone ? verdict : undefined}
        />

        {/* ── CLEAN QUANTUM CHANNEL TRACK ── */}
        <div style={{ flex: 1, position: 'relative', height: 76, minWidth: 0, display: 'flex', alignItems: 'center' }}>

          {/* Clean Core Line (No messy gradients/glows) */}
          <div style={{
            position: 'absolute',
            left: 0, right: 0,
            top: 38,
            height: 2,
            transform: 'translateY(-50%)',
            background: isThreatDetected ? '#DC2626' : '#1D4ED8',
            transition: 'all 0.3s ease',
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
                  height: 4,
                  borderRadius: 2,
                  background: `linear-gradient(90deg, transparent, ${pulseColor} 100%)`,
                }} />

                {/* Bright Energy Core Node */}
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#0F0F0F',
                  border: `2px solid ${pulseColor}`,
                  marginLeft: -6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}>
                  <span style={{ fontSize: 7, color: '#FAF9F5', fontWeight: 900 }}>⚛</span>
                </div>

                {/* Floating Qubit Symbol Chip */}
                <div style={{
                  position: 'absolute',
                  top: -24,
                  left: 60,
                  fontSize: 10,
                  fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#0F0F0F',
                  background: '#FAF9F5',
                  border: '1.5px solid #0F0F0F',
                  boxShadow: '2px 2px 0px #0F0F0F',
                  padding: '2px 8px',
                  borderRadius: 2,
                  whiteSpace: 'nowrap',
                }}>
                  |ψ⟩ payload
                </div>
              </div>
            </div>
          )}

          {/* Bell Pair formula tag */}
          <div
            className="bell-pair-tag"
            style={{
              position: 'absolute',
              top: -28,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#0F0F0F',
              background: '#FAF9F5',
              padding: '4px 16px',
              borderRadius: 2,
              whiteSpace: 'nowrap',
              border: '1.5px solid #0F0F0F',
              boxShadow: '2px 2px 0px #0F0F0F',
              fontWeight: 700,
            }}
          >
            |Φ+⟩ = (|00⟩ + |11⟩) / √2
          </div>

          {/* EVE Threat Node & Tap Line (Clean spacing below channel) */}
          {isAttackConfigured && (
            <div style={{
              position: 'absolute',
              top: 38,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
              zIndex: 5,
              transition: 'all 0.3s ease',
              opacity: eveActive ? 1 : 0.5,
            }}>
              {/* Tap line */}
              <div style={{
                width: 2, height: 18,
                background: isThreatDetected ? '#DC2626' : '#0F0F0F',
              }} />
              <div style={{
                background: '#0F0F0F',
                border: '2px solid #0F0F0F',
                borderRadius: 2,
                padding: '8px 16px',
                textAlign: 'center',
                minWidth: 170,
                boxShadow: '3px 3px 0px #DC2626',
              }}>
                <div style={{ fontSize: 16, marginBottom: 2 }}>🕵️‍♀️</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#FAF9F5', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace" }}>
                  ATTACKER (INTERCEPTOR)
                </div>
                <div style={{ fontSize: 10, color: '#FCA5A5', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                  {isThreatDetected ? `⚠ ${scenario.eveRole}` : scenario.eveRole}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RECEIVER NODE ── */}
        <ActorNode
          label="RECEIVER"
          role="Receiver / Verifier"
          icon="👨‍🔬"
          color={isDone ? (verdict === 'REJECT' ? '#DC2626' : '#10b981') : (isRunning ? '#EAB308' : '#10b981')}
          isActive={bobActive || isDone}
          badge={isRunning && stepIndex >= 4 ? (stepIndex === 4 ? 'DECIDING' : 'VERIFYING') : undefined}
          verdict={isDone ? verdict : undefined}
          verdictColor={isDone ? verdictColor : undefined}
        />
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
        background: color === '#DC2626'
          ? '#FCA5A5'
          : color === '#EAB308'
          ? '#FEF08A'
          : (isActive ? `rgba(${color === '#1fb6d6' ? '31,182,214' : '16,185,129'},0.15)` : 'var(--actor-circle-bg, rgba(30, 41, 59, 0.6))'),
        border: (color === '#DC2626' || color === '#EAB308')
          ? '2px solid #0F0F0F'
          : `2px solid ${isActive ? color : 'var(--actor-circle-bd, rgba(71, 85, 105, 0.4))'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 30,
        transition: 'all 0.3s ease',
        boxShadow: (color === '#DC2626' || color === '#EAB308')
          ? '3px 3px 0px #0F0F0F'
          : (isActive ? `0 0 24px ${color}50` : 'none'),
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
          color: '#0F0F0F',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: "'Space Grotesk', sans-serif",
        }}>{label}</div>
        <div style={{ fontSize: 10, color: '#555555', marginTop: 1, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{role}</div>
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
