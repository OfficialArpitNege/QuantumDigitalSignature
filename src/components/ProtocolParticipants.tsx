import type { AttackType } from '../types/api';

interface Props {
  attackType: AttackType;
  isThreatDetected?: boolean;
}

export default function ProtocolParticipants({ attackType, isThreatDetected = false }: Props) {
  const isAttackConfigured = attackType !== 'none';
  const formatAttackName = (a: string) =>
    a === 'none' ? 'None' : a.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="section">
      <div style={{ marginBottom: 12 }}>
        <div className="section-label">Actors & Communication Channels</div>
        <div className="section-title">Protocol Participants</div>
      </div>

      {/* Topology Diagram Card */}
      <div
        className="card"
        style={{
          marginBottom: 16,
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '1px solid var(--border-light, #e2e8f0)',
          padding: '20px',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 16 }}>
          Live Channel Topology
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          {/* Sender Node */}
          <div
            style={{
              background: '#ffffff',
              border: '2px solid #3b82f6',
              borderRadius: 12,
              padding: '14px 20px',
              textAlign: 'center',
              minWidth: 160,
              boxShadow: '0 2px 8px rgba(59,130,246,0.15)',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>👩‍💻</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#1e293b' }}>Sender</div>
            <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600 }}>Legitimate Sender</div>
          </div>

          {/* Channel Arrow + Interceptor */}
          <div style={{ flex: 1, textAlign: 'center', position: 'relative', padding: '0 12px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              {isThreatDetected ? `⚠ Anomaly Intercepted (${formatAttackName(attackType)})` : isAttackConfigured ? `Quantum Channel (Scenario: ${formatAttackName(attackType)})` : 'Secure Quantum & Classical Channel'}
            </div>
            
            <div style={{ height: 4, background: isThreatDetected ? '#ef4444' : '#10b981', borderRadius: 2, position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  right: -6,
                  top: -5,
                  width: 0,
                  height: 0,
                  borderTop: '7px solid transparent',
                  borderBottom: '7px solid transparent',
                  borderLeft: `10px solid ${isThreatDetected ? '#ef4444' : '#10b981'}`,
                }}
              />
            </div>

            {/* Attacker interceptor indicator if threat detected */}
            {isAttackConfigured && (
              <div
                style={{
                  marginTop: 8,
                  display: 'inline-block',
                  background: isThreatDetected ? '#fef2f2' : '#f1f5f9',
                  border: `1px solid ${isThreatDetected ? '#fecaca' : '#cbd5e1'}`,
                  borderRadius: 16,
                  padding: '4px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: isThreatDetected ? '#dc2626' : '#475569',
                }}
              >
                🕵️‍♀️ Attacker ({formatAttackName(attackType)}) {isThreatDetected ? 'Threat Intercepted' : 'Channel Tapped'}
              </div>
            )}
          </div>

          {/* Receiver Node */}
          <div
            style={{
              background: '#ffffff',
              border: '2px solid #10b981',
              borderRadius: 12,
              padding: '14px 20px',
              textAlign: 'center',
              minWidth: 160,
              boxShadow: '0 2px 8px rgba(16,185,129,0.15)',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>👨‍🔬</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#1e293b' }}>Receiver</div>
            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Legitimate Receiver</div>
          </div>
        </div>
      </div>

      {/* Participants Detail Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {/* Sender Card */}
        <div className="card" style={{ borderTop: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 16 }}>Sender</span>
            <span style={{ fontSize: 11, fontWeight: 700, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 12 }}>
              ACTIVE
            </span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>
            Legitimate Sender
          </div>
          <ul style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 16, margin: 0, lineHeight: 1.5 }}>
            <li>Creates and prepares original message</li>
            <li>Generates prototype HMAC signature material</li>
            <li>Encodes signature bits into quantum states</li>
          </ul>
        </div>

        {/* Receiver Card */}
        <div className="card" style={{ borderTop: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 16 }}>Receiver</span>
            <span style={{ fontSize: 11, fontWeight: 700, background: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: 12 }}>
              ACTIVE
            </span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', marginBottom: 8 }}>
            Legitimate Receiver / Verifier
          </div>
          <ul style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 16, margin: 0, lineHeight: 1.5 }}>
            <li>Receives teleported states &amp; applies Pauli correction</li>
            <li>Performs X, Y, Z projective measurements</li>
            <li>Executes formal deterministic protocol verification</li>
          </ul>
        </div>

        {/* Attacker Card */}
        <div className="card" style={{ borderTop: `4px solid ${isThreatDetected ? '#ef4444' : '#94a3b8'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 16 }}>Attacker</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: isThreatDetected ? '#fee2e2' : '#f1f5f9',
                color: isThreatDetected ? '#b91c1c' : '#64748b',
                padding: '2px 8px',
                borderRadius: 12,
              }}
            >
              {isThreatDetected ? 'THREAT DETECTED' : isAttackConfigured ? 'CONFIGURED' : 'INACTIVE'}
            </span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: isThreatDetected ? '#dc2626' : '#64748b', marginBottom: 8 }}>
            Attacker / Interceptor
          </div>
          <ul style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 16, margin: 0, lineHeight: 1.5 }}>
            <li>Attempts forgery, impersonation, or replay attacks</li>
            <li>Injects quantum channel state perturbations</li>
            <li>Status: {isThreatDetected ? `⚠ Anomaly Detected (${formatAttackName(attackType)})` : isAttackConfigured ? `Configured Scenario (${formatAttackName(attackType)})` : 'Inactive (No Attack Selected)'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
