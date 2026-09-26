import type { ExtendedAttackType } from './ScenarioSelector';
import type { ProtocolVerificationResult } from '../../types/api';

interface Props {
  message: string;
  setMessage: (msg: string) => void;
  impersonatedMessage?: string;
  setImpersonatedMessage?: (msg: string) => void;
  scenarioAttack: ExtendedAttackType;
  attackStrength: number;
  setAttackStrength: (val: number) => void;
  loading: boolean;
  isDone: boolean;
  verdict?: 'ACCEPT' | 'REJECT';
  verification?: ProtocolVerificationResult;
  onRunProtocol: () => void;
  showAdvanced: boolean;
  setShowAdvanced: (cb: (v: boolean) => boolean) => void;
  shots: number;
  setShots: (val: number) => void;
  maxSymbols: number;
  setMaxSymbols: (val: number) => void;
}

export default function AliceBobConsole({
  message,
  setMessage,
  impersonatedMessage = '',
  setImpersonatedMessage,
  scenarioAttack,
  attackStrength,
  setAttackStrength,
  loading,
  isDone,
  verdict,
  verification,
  onRunProtocol,
  showAdvanced,
  setShowAdvanced,
  shots,
  setShots,
  maxSymbols,
  setMaxSymbols,
}: Props) {
  const isAttackConfigured = scenarioAttack !== 'none';

  // Compute Bob's received payload representation based on simulation state & attack scenario
  const getBobReceivedPayload = () => {
    const isImpersonating = scenarioAttack === 'impersonation';
    const effectiveMsg = (isImpersonating && impersonatedMessage?.trim())
      ? impersonatedMessage.trim()
      : message;

    if (!effectiveMsg.trim()) return '(empty message)';
    if (!isDone) return effectiveMsg;

    if (verdict === 'ACCEPT' || scenarioAttack === 'none') {
      return effectiveMsg;
    }

    switch (scenarioAttack) {
      case 'forgery':
        return `${message} [TAMPERED SIGNATURE]`;
      case 'replay':
        return `${message} [REPLAYED NONCE]`;
      case 'impersonation':
        return `${impersonatedMessage?.trim() || message} [UNAUTHORIZED SENDER]`;
      case 'channel_manipulation':
        return (
          message
            .split('')
            .map((ch, idx) => (idx % 3 === 1 ? '░' : idx % 5 === 0 ? '⯁' : ch))
            .join('') + ' [QBER EXCEEDED]'
        );
      default:
        return `${message} [ANOMALY DETECTED]`;
    }
  };

  const bobPayload = getBobReceivedPayload();

  const avgFidelityVal =
    typeof verification?.details?.average_fidelity === 'number'
      ? verification.details.average_fidelity
      : 1.0;

  return (
    <div
      style={{
        background: 'var(--lab-surface-2, #ffffff)',
        border: '1px solid var(--lab-border, #e2e8f0)',
        borderRadius: 12,
        padding: '14px 16px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        marginBottom: 16,
      }}
    >
      {/* Top Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#cc0000',
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          TRANSMISSION & RECEIVER CONSOLE
        </div>

        <button
          onClick={() => setShowAdvanced(v => !v)}
          style={{
            background: 'var(--lab-bg, #f8fafc)',
            border: '1px solid var(--lab-border, #cbd5e1)',
            borderRadius: 6,
            color: 'var(--lab-text, #334155)',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            padding: '4px 10px',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {showAdvanced ? '▲ Config' : '⚙ Config'}
        </button>
      </div>

      {/* Advanced drawer */}
      {showAdvanced && (
        <div
          style={{
            padding: 12,
            marginBottom: 12,
            background: 'var(--lab-bg, #f8fafc)',
            border: '1px solid var(--lab-border, #e2e8f0)',
            borderRadius: 8,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          <div>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--lab-text-sub, #64748b)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 4,
              }}
            >
              Shots: {shots.toLocaleString()}
            </label>
            <input
              type="range"
              min="256"
              max="8192"
              step="256"
              value={shots}
              onChange={e => setShots(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#cc0000' }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--lab-text-sub, #64748b)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 4,
              }}
            >
              Qubit Count: {maxSymbols}
            </label>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={maxSymbols}
              onChange={e => setMaxSymbols(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#cc0000' }}
            />
          </div>
          {isAttackConfigured && (
            <div>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#ef4444',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Attack Intensity: {(attackStrength * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={attackStrength}
                onChange={e => setAttackStrength(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#ef4444' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Impersonation Message Edit & Spoof Box */}
      {scenarioAttack === 'impersonation' && (
        <div
          style={{
            marginBottom: 16,
            padding: '16px 18px',
            background: '#FEF2F2',
            border: '2px solid #DC2626',
            boxShadow: '3px 3px 0px #DC2626',
            borderRadius: 2,
            animation: 'qds-appear 0.2s ease',
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#991B1B', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>
              👤 IMPERSONATION: ENTER ADVERSARY'S MESSAGE (ACT AS SENDER)
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#991B1B', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
              IMPERSONATED / FORGED MESSAGE PAYLOAD:
            </label>
            <textarea
              id="impersonation-message-input"
              value={impersonatedMessage}
              onChange={(e) => setImpersonatedMessage?.(e.target.value)}
              rows={2}
              placeholder="Enter attacker's custom message (e.g. AUTHORIZE PAYMENT TO EVE)..."
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid #0F0F0F',
                borderRadius: 2,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                fontWeight: 700,
                background: '#FFFFFF',
                boxSizing: 'border-box',
                color: '#0F0F0F',
              }}
            />
          </div>
        </div>
      )}

      {/* DUAL PANELS: SENDER | RECEIVER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {/* 👩‍💻 SENDER PANEL */}
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid #3b82f6',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 18 }}>👩‍💻</span>
                <span style={{ fontWeight: 800, fontSize: 13, color: '#1e293b' }}>SENDER</span>
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  background: scenarioAttack === 'impersonation' ? '#fee2e2' : '#dbeafe',
                  color: scenarioAttack === 'impersonation' ? '#b91c1c' : '#1d4ed8',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {scenarioAttack === 'impersonation' ? 'SPOOFED BY EVE' : 'READY'}
              </span>
            </div>

            <input
              id="sender-message-input"
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onRunProtocol();
              }}
              placeholder="Enter message payload..."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                color: '#0f172a',
                background: '#f8fafc',
                outline: 'none',
              }}
            />
            {scenarioAttack === 'impersonation' && (
              <div style={{ fontSize: 10, color: '#dc2626', fontFamily: "'JetBrains Mono', monospace", marginTop: 4, fontWeight: 700 }}>
                ⚠️ Adversary (Eve) is hijacking transmission as sender using the payload configured above.
              </div>
            )}
          </div>

          <button
            id="run-protocol-btn"
            onClick={onRunProtocol}
            disabled={loading || (scenarioAttack === 'impersonation' ? (!impersonatedMessage.trim() && !message.trim()) : !message.trim())}
            className="lab-transmit-btn"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 800,
              color: '#ffffff',
              border: 'none',
              cursor: loading || (scenarioAttack === 'impersonation' ? (!impersonatedMessage.trim() && !message.trim()) : !message.trim()) ? 'not-allowed' : 'pointer',
              background: loading
                ? '#64748b'
                : scenarioAttack === 'none'
                ? 'linear-gradient(135deg, #cc0000 0%, #8a0000 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? (
              <>
                <span style={{ animation: 'qds-spin 0.7s linear infinite', display: 'inline-block' }}>⚙</span>{' '}
                {scenarioAttack === 'impersonation' ? 'Transmitting as Impersonated Sender...' : 'Transmitting...'}
              </>
            ) : (
              <>
                {scenarioAttack === 'impersonation'
                  ? '▶ TRANSMIT AS IMPERSONATED SENDER (+ IMPERSONATION)'
                  : scenarioAttack !== 'none'
                  ? `▶ TRANSMIT TO RECEIVER (+ ${scenarioAttack.toUpperCase()})`
                  : '▶ TRANSMIT TO RECEIVER'}
              </>
            )}
          </button>
        </div>

        {/* 👨‍🔬 RECEIVER PANEL */}
        <div
          style={{
            background: '#ffffff',
            border: `1.5px solid ${
              loading
                ? '#f59e0b'
                : isDone
                ? verdict === 'ACCEPT'
                  ? '#10b981'
                  : '#ef4444'
                : '#10b981'
            }`,
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 8,
            transition: 'all 0.3s ease',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 18 }}>👨‍🔬</span>
                <span style={{ fontWeight: 800, fontSize: 13, color: '#1e293b' }}>RECEIVER</span>
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  background: loading
                    ? '#fef3c7'
                    : isDone
                    ? verdict === 'ACCEPT'
                      ? '#d1fae5'
                      : '#fee2e2'
                    : '#e2e8f0',
                  color: loading
                    ? '#b45309'
                    : isDone
                    ? verdict === 'ACCEPT'
                      ? '#047857'
                      : '#b91c1c'
                    : '#475569',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {loading
                  ? 'DECODING...'
                  : isDone
                  ? verdict === 'ACCEPT'
                    ? 'VERIFIED'
                    : 'REJECTED'
                  : 'AWAITING'}
              </span>
            </div>

            {/* RECEIVED PAYLOAD DISPLAY BOX */}
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                minHeight: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: loading
                  ? '#fffbeb'
                  : isDone
                  ? verdict === 'ACCEPT'
                    ? '#f0fdf4'
                    : '#fef2f2'
                  : '#f8fafc',
                border: `1px solid ${
                  loading
                    ? '#fcd34d'
                    : isDone
                    ? verdict === 'ACCEPT'
                      ? '#86efac'
                      : '#fca5a5'
                    : '#cbd5e1'
                }`,
                color: loading
                  ? '#92400e'
                  : isDone
                  ? verdict === 'ACCEPT'
                    ? '#166534'
                    : '#991b1b'
                  : '#64748b',
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? (
                <span style={{ fontStyle: 'italic', fontSize: 12 }}>
                  Receiving entangled quantum states...
                </span>
              ) : !isDone ? (
                <span style={{ fontStyle: 'italic', fontSize: 12, color: '#94a3b8' }}>
                  {scenarioAttack === 'impersonation' ? 'Waiting for Impersonated Sender...' : 'Waiting for Sender...'}
                </span>
              ) : (
                <span>{bobPayload}</span>
              )}

              {isDone && (
                <span style={{ fontSize: 16, marginLeft: 8 }}>
                  {verdict === 'ACCEPT' ? '✅' : '🚨'}
                </span>
              )}
            </div>
          </div>

          {/* Bob's Received Metadata summary pill */}
          {isDone && verification && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#64748b',
                paddingTop: 4,
              }}
            >
              <span>Fidelity: <strong>{(avgFidelityVal * 100).toFixed(1)}%</strong></span>
              <span>Sig: <strong>{verification.signature_valid ? 'VALID' : 'INVALID'}</strong></span>
              <span>Quantum: <strong>{verification.quantum_valid ? 'VALID' : 'INVALID'}</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
