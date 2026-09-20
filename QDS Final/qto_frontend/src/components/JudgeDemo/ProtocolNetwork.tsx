import type { ExtendedAttackType } from './ScenarioSelector';
import { SCENARIOS } from './ScenarioSelector';

interface Props {
  attackType: ExtendedAttackType;
  stepIndex: number;   // -1 = idle, 0-8 = running, 9+ = done
  isRunning: boolean;
  isDone: boolean;
  verdict?: 'ACCEPT' | 'REJECT';
}

const STEP_LABELS = [
  'Preparing message payload…',
  'Generating SHA-256 + HMAC signature…',
  'Encoding payload into quantum states…',
  'Establishing Bell pair |Φ+⟩ entangled state…',
  'Initiating quantum teleportation transfer…',
  'Checking quantum channel integrity…',
  'Bob measuring quantum state…',
  'Running deterministic verification gates…',
  'Protocol decision reached',
];

const ATTACK_STEP_LABEL: Partial<Record<ExtendedAttackType, string>> = {
  forgery: '⚠ EVE — Signature bit tampering detected',
  replay: '⚠ EVE — Replayed session nonce detected',
  channel_manipulation: '⚠ EVE — Entangled quantum state perturbed',
  impersonation: '⚠ EVE — Identity spoofing attempt',
  unauthorized_verification: '⚠ EVE — Unauthorized verification attempt',
};

export default function ProtocolNetwork({ attackType, stepIndex, isRunning, isDone, verdict }: Props) {
  const scenario = SCENARIOS.find(s => s.id === attackType) ?? SCENARIOS[0];
  const isAttack = attackType !== 'none';
  const channelColor = isAttack ? '#ef4444' : '#1fb6d6';
  const attackActive = isRunning && stepIndex >= 5 && isAttack;

  let channelLabel = '';
  if (isRunning && stepIndex >= 0 && stepIndex <= 8) {
    channelLabel = (stepIndex === 5 && isAttack)
      ? (ATTACK_STEP_LABEL[attackType] ?? STEP_LABELS[5])
      : STEP_LABELS[stepIndex];
  } else if (isDone && verdict) {
    channelLabel = verdict === 'ACCEPT' ? '✓ Transmission verified — ACCEPTED' : '✕ Verification failed — REJECTED';
  } else if (!isRunning && !isDone) {
    channelLabel = 'System online — configure threat scenario & payload';
  }

  const aliceActive = isRunning && stepIndex < 5;
  const bobActive = isRunning && stepIndex >= 6;
  const eveActive = isRunning && stepIndex === 5 && isAttack;

  const verdictColor = verdict === 'ACCEPT' ? '#10b981' : verdict === 'REJECT' ? '#ef4444' : undefined;

  return (
    <div className="lab-canvas" style={{ marginBottom: 18 }}>
      {/* Background network grid effect */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(31, 182, 214, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(31, 182, 214, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '36px 36px',
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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isRunning ? '#f59e0b' : isDone ? (verdict === 'ACCEPT' ? '#10b981' : '#ef4444') : 'var(--status-text-color, #1fb6d6)',
            boxShadow: isRunning ? '0 0 10px #f59e0b' : '0 0 8px #1fb6d6',
            animation: isRunning ? 'qds-eve-pulse 1s ease-in-out infinite' : 'none',
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 12.5,
            fontFamily: "'JetBrains Mono', monospace",
            color: attackActive
              ? 'var(--status-text-attack-color, #fca5a5)'
              : isDone && verdict === 'REJECT'
              ? 'var(--status-text-attack-color, #fca5a5)'
              : isDone && verdict === 'ACCEPT'
              ? 'var(--status-text-accept-color, #6ee7b7)'
              : 'var(--status-text-color, #38bdf8)',
            fontWeight: 700,
            transition: 'color 0.3s',
          }}>
            {channelLabel}
          </span>
        </div>

        <div style={{
          fontSize: 10,
          fontWeight: 800,
          padding: '4px 12px',
          borderRadius: 100,
          background: isAttack ? 'var(--badge-threat-bg, rgba(239, 68, 68, 0.15))' : 'var(--badge-legit-bg, rgba(31, 182, 214, 0.15))',
          border: `1px solid ${isAttack ? 'var(--badge-threat-bd, rgba(239, 68, 68, 0.35))' : 'var(--badge-legit-bd, rgba(31, 182, 214, 0.35))'}`,
          color: isAttack ? 'var(--badge-threat-text, #fca5a5)' : 'var(--badge-legit-text, #38bdf8)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
        }}>
          {isAttack ? `⚠ THREAT: ${scenario.label}` : '✓ LEGITIMATE SCENARIO'}
        </div>
      </div>

      {/* Main Quantum Channel Network Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '32px 36px',
        gap: 0,
        position: 'relative',
        zIndex: 1,
        minHeight: 190,
      }}>

        {/* ── ALICE NODE ── */}
        <ActorNode
          label="ALICE"
          role="Legitimate Sender"
          icon="👩‍💻"
          color="#1fb6d6"
          isActive={aliceActive || (isDone && verdict === 'ACCEPT')}
          badge={isRunning && stepIndex < 3 ? stepIndex === 0 ? 'SIGN' : stepIndex === 1 ? 'HMAC' : 'ENCODE' : undefined}
          verdict={isDone ? verdict : undefined}
        />

        {/* ── QUANTUM CHANNEL TRACK ── */}
        <div style={{ flex: 1, position: 'relative', height: 90, minWidth: 0, display: 'flex', alignItems: 'center' }}>

          {/* Glowing quantum channel backbone line */}
          <div style={{
            position: 'absolute',
            left: 0, right: 0,
            height: 4,
            background: `linear-gradient(90deg, #1fb6d6, ${channelColor}, #7c6cf6)`,
            boxShadow: `0 0 12px ${channelColor}`,
            opacity: 0.6,
            borderRadius: 2,
          }} />

          {/* Animated flowing quantum particle stream */}
          {isRunning && (
            <div
              key={`particle-${stepIndex}`}
              style={{
                position: 'absolute',
                top: '50%',
                width: 12, height: 12,
                borderRadius: '50%',
                background: attackActive ? '#ef4444' : '#1fb6d6',
                boxShadow: `0 0 16px ${attackActive ? '#ef4444' : '#1fb6d6'}`,
                transform: 'translateY(-50%)',
                animation: `qds-flow 1.2s ${attackActive ? 'ease-in' : 'linear'} infinite`,
                zIndex: 3,
              }}
            />
          )}

          {/* Bell Pair formula tag */}
          <div
            className="bell-pair-tag"
            style={{
              position: 'absolute',
              top: -22,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 10.5,
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--bell-text, #38bdf8)',
              background: 'var(--bell-bg, rgba(8, 14, 26, 0.9))',
              padding: '4px 14px',
              borderRadius: 100,
              whiteSpace: 'nowrap',
              border: '1px solid var(--bell-bd, rgba(31, 182, 214, 0.3))',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              fontWeight: 700,
            }}
          >
            |Φ+⟩ = (|00⟩ + |11⟩) / √2
          </div>

          {/* EVE Threat Node (Appears when attack scenario active) */}
          {isAttack && (
            <div style={{
              position: 'absolute',
              bottom: -72,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              zIndex: 5,
              transition: 'opacity 0.3s',
              opacity: eveActive || (isDone && verdict === 'REJECT') ? 1 : 0.5,
            }}>
              {/* Intercept line */}
              <div style={{
                width: 2, height: 20,
                background: eveActive ? '#ef4444' : '#475569',
                borderLeft: eveActive ? '2px dashed #ef4444' : '2px dashed #475569',
              }} />
              <div style={{
                background: eveActive ? 'rgba(69, 10, 10, 0.95)' : 'var(--card-bg, rgba(26, 16, 20, 0.9))',
                border: `1.5px solid ${eveActive ? '#ef4444' : 'var(--card-border, #475569)'}`,
                borderRadius: 12,
                padding: '8px 18px',
                textAlign: 'center',
                animation: eveActive ? 'qds-eve-pulse 1s ease-in-out infinite' : 'none',
                minWidth: 170,
                boxShadow: eveActive ? '0 0 20px rgba(239, 68, 68, 0.4)' : 'none',
              }}>
                <div style={{ fontSize: 18, marginBottom: 2 }}>🕵️‍♀️</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: eveActive ? '#fca5a5' : 'var(--card-text, #9ca3af)', letterSpacing: '0.08em' }}>
                  EVE (INTERCEPTOR)
                </div>
                <div style={{ fontSize: 9.5, color: eveActive ? '#fca5a5' : 'var(--card-text-sub, #6b7280)' }}>
                  {scenario.eveRole}
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
          badge={isRunning && stepIndex >= 7 ? stepIndex === 7 ? 'VERIFY' : 'DECIDE' : undefined}
          verdict={isDone ? verdict : undefined}
          verdictColor={isDone ? verdictColor : undefined}
        />
      </div>

      {/* Pipeline progress bar */}
      <div
        className="pipeline-bar-container"
        style={{
          borderTop: '1px solid var(--lab-border, rgba(31, 182, 214, 0.15))',
          padding: '10px 24px',
          display: 'flex',
          gap: 4,
          background: 'var(--pipeline-bg, rgba(8, 14, 26, 0.65))',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {STEP_LABELS.map((label, idx) => {
          const done = isDone || (isRunning && idx < stepIndex);
          const active = isRunning && idx === stepIndex;
          const isAttackStep = idx === 5;
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 3,
                background: done
                  ? (isAttackStep && isAttack ? '#ef4444' : '#10b981')
                  : active
                    ? (isAttackStep && isAttack ? '#ef4444' : '#1fb6d6')
                    : 'var(--segment-inactive-bg, rgba(71, 85, 105, 0.3))',
                boxShadow: active ? `0 0 10px ${isAttackStep && isAttack ? '#ef4444' : '#1fb6d6'}` : 'none',
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
