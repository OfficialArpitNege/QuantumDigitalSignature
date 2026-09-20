import type { ExtendedAttackType } from './ScenarioSelector';

interface Props {
  attackType: ExtendedAttackType;
  stepProgress: number; // 0 to 9 step stage index during execution
  isRunning: boolean;
}

export default function NetworkFlow({ attackType, stepProgress, isRunning }: Props) {
  const isAttackActive = attackType !== 'none';

  const getAttackLabel = (a: string) => {
    switch (a) {
      case 'forgery': return 'Signature Forgery';
      case 'replay': return 'Replay Attempt';
      case 'channel_manipulation': return 'Quantum Channel Noise';
      case 'impersonation': return 'Sender Identity Spoofing';
      case 'unauthorized_verification': return 'Unauthorized Receiver Intercept';
      default: return 'Adversary Active';
    }
  };

  return (
    <div className="section">
      <div style={{ marginBottom: 12 }}>
        <div className="section-label">Central Protocol Network</div>
        <div className="section-title">Quantum Network Architecture &amp; Actor Topology</div>
      </div>

      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Network Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8' }}>
              Teleportation Channel Pipeline
            </span>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>
              Alice (Sender) ── EPR Pair (|Φ+⟩) ──▶ Bob (Verifier)
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 12,
              background: isAttackActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
              border: `1px solid ${isAttackActive ? '#ef4444' : '#10b981'}`,
              color: isAttackActive ? '#fca5a5' : '#6ee7b7',
            }}
          >
            {isAttackActive ? `⚠ ATTACK ACTIVE: ${getAttackLabel(attackType)}` : '✓ SECURE TRANSMISSION'}
          </div>
        </div>

        {/* 3 Major Visual Nodes Layout */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '20px 0' }}>
          
          {/* ALICE NODE */}
          <div
            style={{
              background: '#1e293b',
              border: '2px solid #38bdf8',
              borderRadius: 16,
              padding: '16px 20px',
              textAlign: 'center',
              width: 170,
              zIndex: 2,
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 4 }}>👩‍💻</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#f8fafc' }}>ALICE</div>
            <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>Legitimate Sender</div>
            <div
              style={{
                marginTop: 8,
                fontSize: 10,
                fontWeight: 700,
                background: '#0284c7',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: 10,
                display: 'inline-block',
              }}
            >
              ACTIVE
            </div>
          </div>

          {/* CHANNEL LINK & EVE INTERCEPTOR */}
          <div style={{ flex: 1, position: 'relative', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Animated Laser Pulse Line */}
            <div
              style={{
                position: 'absolute',
                left: 20,
                right: 20,
                height: 4,
                background: isAttackActive ? 'linear-gradient(90deg, #38bdf8, #ef4444, #38bdf8)' : 'linear-gradient(90deg, #38bdf8, #10b981, #38bdf8)',
                borderRadius: 2,
                boxShadow: isAttackActive ? '0 0 10px #ef4444' : '0 0 10px #10b981',
              }}
            />

            {/* Qubit Packet Particle */}
            {isRunning && (
              <div
                style={{
                  position: 'absolute',
                  top: 40,
                  left: `${Math.min(90, Math.max(10, stepProgress * 11))}%`,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#facc15',
                  boxShadow: '0 0 12px #facc15',
                  transition: 'left 0.3s ease',
                  zIndex: 3,
                }}
              />
            )}

            {/* Central Bell Pair & EPR indicator */}
            <div
              style={{
                position: 'absolute',
                top: 8,
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 12,
                padding: '2px 10px',
                fontSize: 11,
                color: '#94a3b8',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              |Φ+⟩ = (|00⟩ + |11⟩)/√2
            </div>

            {/* EVE INTERCEPTOR NODE */}
            {isAttackActive ? (
              <div
                style={{
                  position: 'absolute',
                  bottom: -10,
                  background: '#2d0607',
                  border: '2px solid #ef4444',
                  borderRadius: 12,
                  padding: '8px 16px',
                  textAlign: 'center',
                  color: '#fca5a5',
                  zIndex: 4,
                  boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: '#f87171' }}>
                  🕵️‍♀️ EVE ({getAttackLabel(attackType)})
                </div>
                <div style={{ fontSize: 10, color: '#fca5a5' }}>
                  Interceptors Active on Quantum Channel
                </div>
              </div>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  bottom: -5,
                  fontSize: 11,
                  color: '#64748b',
                  fontStyle: 'italic',
                }}
              >
                Eve Status: Inactive (No Attack Detected)
              </div>
            )}
          </div>

          {/* BOB NODE */}
          <div
            style={{
              background: '#1e293b',
              border: '2px solid #10b981',
              borderRadius: 16,
              padding: '16px 20px',
              textAlign: 'center',
              width: 170,
              zIndex: 2,
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 4 }}>👨‍🔬</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#f8fafc' }}>BOB</div>
            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Receiver / Verifier</div>
            <div
              style={{
                marginTop: 8,
                fontSize: 10,
                fontWeight: 700,
                background: '#059669',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: 10,
                display: 'inline-block',
              }}
            >
              ACTIVE
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
