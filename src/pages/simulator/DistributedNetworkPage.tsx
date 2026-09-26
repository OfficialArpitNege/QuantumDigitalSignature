import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';

type Role = 'sender' | 'attacker' | 'receiver';

interface NetworkState {
  session_id: string;
  status: 'IDLE' | 'TRANSMITTED' | 'INTERCEPTED' | 'VERIFIED';
  message: string;
  message_hash: string;
  shots: number;
  max_symbols: number;
  sender: any;
  attacker: any;
  receiver: any;
  timestamp: number;
}

export default function DistributedNetworkPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as Role) || 'sender';
  const [role, setRole] = useState<Role>(initialRole);

  const [state, setState] = useState<NetworkState | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sender inputs
  const [sendMsg, setSendMsg] = useState('AUTHORIZE PAYMENT OF 500,000 CREDITS TO NODE B');
  const [symbols, setSymbols] = useState(4);

  // Attacker inputs
  const [selectedAttack, setSelectedAttack] = useState('forgery');
  const [attackStrength, setAttackStrength] = useState(0.65);
  const [impersonatedMsg, setImpersonatedMsg] = useState('');

  const pollIntervalRef = useRef<any>(null);

  const fetchState = async () => {
    try {
      const data = await api.getNetworkState();
      setState(data);
    } catch (err) {
      console.error('Failed to fetch network state:', err);
    }
  };

  useEffect(() => {
    fetchState();
    pollIntervalRef.current = setInterval(fetchState, 1200);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setSearchParams({ role: newRole });
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Actions
  const handleTransmit = async () => {
    setActionLoading(true);
    try {
      const res = await api.transmitNetworkSession({
        message: sendMsg,
        shots: 2048,
        max_symbols: symbols,
      });
      setState(res);
    } catch (e: any) {
      alert('Transmit error: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleIntercept = async (typeOverride?: string) => {
    setActionLoading(true);
    try {
      const targetAttack = typeOverride || selectedAttack;
      const isImpersonating = targetAttack === 'impersonation';
      const modified = isImpersonating ? (impersonatedMsg.trim() || undefined) : undefined;

      const res = await api.interceptNetworkSession({
        attack_type: targetAttack,
        attack_strength: attackStrength,
        modified_message: modified,
      });
      setState(res);
    } catch (e: any) {
      alert('Attack injection error: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async () => {
    setActionLoading(true);
    try {
      const res = await api.verifyNetworkSession();
      setState(res);
    } catch (e: any) {
      alert('Verification error: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset current distributed session across all devices?')) return;
    setActionLoading(true);
    try {
      const res = await api.resetNetworkSession();
      setState(res);
      setImpersonatedMsg('');
    } catch (e: any) {
      alert('Reset error: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const currentStatus = state?.status || 'IDLE';

  return (
    <div style={{ animation: 'qds-appear 0.3s ease', maxWidth: 1100, margin: '0 auto' }}>
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. Header & Live Session Banner                            */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#FAF9F5',
        border: '2px solid #0F0F0F',
        boxShadow: '3px 3px 0px #0F0F0F',
        borderRadius: 2,
        padding: '18px 24px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: currentStatus === 'IDLE' ? '#3B82F6' : currentStatus === 'VERIFIED' ? '#10B981' : '#F59E0B',
              boxShadow: '0 0 8px rgba(0,0,0,0.2)',
            }} />
            <h1 style={{
              fontSize: 'clamp(18px, 2.2vw, 24px)',
              fontWeight: 900,
              fontFamily: "'Space Grotesk', sans-serif",
              margin: 0,
              color: '#0F0F0F',
            }}>
              Distributed Multi-Node QDS Protocol
            </h1>
            <span style={{
              background: '#0F0F0F',
              color: '#FAF9F5',
              padding: '2px 8px',
              fontSize: 10,
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              borderRadius: 2,
            }}>
              ID: #{state?.session_id || '---'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handleCopyLink}
            style={{
              background: copied ? '#10B981' : '#FAF9F5',
              color: copied ? '#FFFFFF' : '#0F0F0F',
              border: '1.5px solid #0F0F0F',
              boxShadow: '2px 2px 0px #0F0F0F',
              borderRadius: 2,
              padding: '6px 14px',
              fontSize: 11,
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {copied ? 'COPIED LINK' : 'SHARE ENDPOINT URL'}
          </button>

          <button
            onClick={handleReset}
            disabled={actionLoading}
            style={{
              background: '#FAF9F5',
              color: '#DC2626',
              border: '1.5px solid #0F0F0F',
              boxShadow: '2px 2px 0px #0F0F0F',
              borderRadius: 2,
              padding: '6px 14px',
              fontSize: 11,
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'pointer',
            }}
          >
            RESET PROTOCOL ↺
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. Interactive Role Selection Bar                          */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 20,
      }}>
        {/* Role 1: Sender */}
        <button
          onClick={() => handleRoleChange('sender')}
          style={{
            background: role === 'sender' ? '#1D4ED8' : '#FAF9F5',
            color: role === 'sender' ? '#FFFFFF' : '#0F0F0F',
            border: '2px solid #0F0F0F',
            boxShadow: role === 'sender' ? '4px 4px 0px #0F0F0F' : '2px 2px 0px #0F0F0F',
            transform: role === 'sender' ? 'translate(-2px, -2px)' : 'none',
            borderRadius: 2,
            padding: '14px 16px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', opacity: 0.8, textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
            NODE 01
          </div>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>
            SENDER (Alice)
          </div>
        </button>

        {/* Role 2: Attacker */}
        <button
          onClick={() => handleRoleChange('attacker')}
          style={{
            background: role === 'attacker' ? '#EA580C' : '#FAF9F5',
            color: role === 'attacker' ? '#FFFFFF' : '#0F0F0F',
            border: '2px solid #0F0F0F',
            boxShadow: role === 'attacker' ? '4px 4px 0px #0F0F0F' : '2px 2px 0px #0F0F0F',
            transform: role === 'attacker' ? 'translate(-2px, -2px)' : 'none',
            borderRadius: 2,
            padding: '14px 16px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', opacity: 0.8, textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
            NODE 02
          </div>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>
            ADVERSARY (Eve)
          </div>
        </button>

        {/* Role 3: Receiver */}
        <button
          onClick={() => handleRoleChange('receiver')}
          style={{
            background: role === 'receiver' ? '#7C3AED' : '#FAF9F5',
            color: role === 'receiver' ? '#FFFFFF' : '#0F0F0F',
            border: '2px solid #0F0F0F',
            boxShadow: role === 'receiver' ? '4px 4px 0px #0F0F0F' : '2px 2px 0px #0F0F0F',
            transform: role === 'receiver' ? 'translate(-2px, -2px)' : 'none',
            borderRadius: 2,
            padding: '14px 16px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', opacity: 0.8, textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
            NODE 03
          </div>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>
            RECEIVER (Bob)
          </div>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. Live Pipeline Timeline Status Bar                       */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#FAF9F5',
        border: '1.5px solid #0F0F0F',
        boxShadow: '2px 2px 0px #0F0F0F',
        borderRadius: 2,
        padding: '12px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 800 }}>PIPELINE STAGE:</span>
          <span style={{
            background: '#0F0F0F',
            color: '#FFFFFF',
            padding: '2px 8px',
            borderRadius: 2,
            fontWeight: 800,
          }}>
            {currentStatus}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: currentStatus !== 'IDLE' ? '#1D4ED8' : '#888', fontWeight: 800 }}>
            ① SENDER {state?.sender?.status ? '✓' : '...'}
          </span>
          <span>→</span>
          <span style={{ color: state?.attacker?.status === 'intercepted' ? '#EA580C' : state?.attacker?.status === 'passed' ? '#10B981' : '#888', fontWeight: 800 }}>
            ② ADVERSARY {state?.attacker?.status !== 'idle' && state?.attacker?.status ? '✓' : '...'}
          </span>
          <span>→</span>
          <span style={{ color: state?.receiver?.status === 'verified' ? '#7C3AED' : '#888', fontWeight: 800 }}>
            ③ RECEIVER {state?.receiver?.status === 'verified' ? '✓' : '...'}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 4. ACTIVE ROLE PANEL                                        */}
      {/* ─────────────────────────────────────────────────────────── */}

      {/* ========================================================= */}
      {/* ROLE 1: SENDER (Alice)                                    */}
      {/* ========================================================= */}
      {role === 'sender' && (
        <div style={{
          background: '#FAF9F5',
          border: '2px solid #0F0F0F',
          boxShadow: '3px 3px 0px #0F0F0F',
          borderRadius: 2,
          padding: '28px 32px',
        }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>
              [NODE 01] Sender Terminal (Alice)
            </h2>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
              PLAINTEXT MESSAGE TO SIGN &amp; TELEPORT:
            </label>
            <textarea
              value={sendMsg}
              onChange={(e) => setSendMsg(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid #0F0F0F',
                borderRadius: 2,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                fontWeight: 600,
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", alignSelf: 'center' }}>
              PRESETS:
            </span>
            {[
              'BANK TX: ₹10,00,000 TRANSFER TO NODE B',
              'DEFENSE COMMAND: ORBITAL DEFENSE AUTHORIZED',
              'HEALTH RECORD: PATIENT #81924 DATA DISPATCH',
            ].map((preset) => (
              <button
                key={preset}
                onClick={() => setSendMsg(preset)}
                style={{
                  background: '#F5F4EE',
                  border: '1px solid #0F0F0F',
                  borderRadius: 2,
                  padding: '4px 10px',
                  fontSize: 10.5,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  cursor: 'pointer',
                }}
              >
                {preset.split(':')[0]}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                QUANTUM SYMBOLS:
              </span>
              <select
                value={symbols}
                onChange={(e) => setSymbols(Number(e.target.value))}
                style={{
                  padding: '4px 10px',
                  border: '1.5px solid #0F0F0F',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 800,
                  fontSize: 11,
                  background: '#FFFFFF',
                }}
              >
                <option value={2}>2 Qubits</option>
                <option value={4}>4 Qubits (Standard)</option>
                <option value={8}>8 Qubits (High Security)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={handleTransmit}
              disabled={actionLoading}
              style={{
                background: '#1D4ED8',
                color: '#FFFFFF',
                border: '2px solid #0F0F0F',
                boxShadow: '3px 3px 0px #0F0F0F',
                borderRadius: 2,
                padding: '12px 28px',
                fontSize: 13,
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {actionLoading ? 'TRANSMITTING...' : 'TRANSMIT QUANTUM SIGNATURE'}
            </button>
          </div>

          {state?.sender?.status && (
            <div style={{
              marginTop: 24,
              padding: '16px 20px',
              background: '#F0FDF4',
              border: '1.5px solid #10B981',
              borderRadius: 2,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
            }}>
              <div style={{ fontWeight: 800, color: '#047857', marginBottom: 6 }}>
                ✓ QUANTUM PAYLOAD DISPATCHED INTO CHANNEL
              </div>
              <div><b>Message:</b> {state.message}</div>
              <div style={{ wordBreak: 'break-all', fontSize: 11, color: '#555', marginTop: 4 }}>
                <b>HMAC/SHA256 Hash:</b> {state.message_hash}
              </div>
              <div style={{ fontSize: 11, color: '#047857', marginTop: 8 }}>
                Current Status: <b>{currentStatus}</b>. Adversary Node (Eve) and Receiver Node (Bob) can now process the quantum transmission.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* ROLE 2: ATTACKER (Eve)                                    */}
      {/* ========================================================= */}
      {role === 'attacker' && (
        <div style={{
          background: '#FAF9F5',
          border: '2px solid #0F0F0F',
          boxShadow: '3px 3px 0px #0F0F0F',
          borderRadius: 2,
          padding: '28px 32px',
        }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>
              [NODE 02] Adversary Terminal (Eve)
            </h2>
          </div>

          {currentStatus === 'IDLE' ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              border: '1.5px dashed #0F0F0F',
              borderRadius: 2,
              color: '#666',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <div style={{ fontWeight: 800 }}>WAITING FOR SENDER TRANSMISSION...</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>
                Once Node 01 (Sender) transmits a quantum signature, the channel adversary node can intercept or pass the state.
              </div>
            </div>
          ) : (
            <div>
              <div style={{
                padding: '14px 18px',
                background: '#FFFBEB',
                border: '1.5px solid #F59E0B',
                borderRadius: 2,
                marginBottom: 20,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
              }}>
                <div style={{ fontWeight: 800, color: '#B45309', marginBottom: 4 }}>
                  [CHANNEL STATUS] {selectedAttack === 'impersonation' ? 'ATTACKER TRANSMISSION MODE ACTIVE' : 'QUANTUM PAYLOAD DETECTED IN TRANSIT'}
                </div>
                {selectedAttack === 'impersonation' ? (
                  <div><b>Adversary Strategy:</b> Attacker (Eve) bypasses original sender payload and injects arbitrary spoofed message as the sender.</div>
                ) : (
                  <div><b>Intercepted Payload from Sender:</b> "{state?.sender?.message || state?.attacker?.original_message || state?.message}"</div>
                )}
                <div style={{ fontSize: 11, color: '#78350F', marginTop: 4 }}>
                  Session #{state?.session_id} · {state?.max_symbols} Quantum Symbols in Transit
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                  SELECT ATTACK STRATEGY:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                  {[
                    { id: 'forgery', name: 'Forgery' },
                    { id: 'replay', name: 'Replay' },
                    { id: 'channel_manipulation', name: 'Channel Noise' },
                    { id: 'impersonation', name: 'Impersonation' },
                  ].map((atk) => (
                    <div
                      key={atk.id}
                      onClick={() => setSelectedAttack(atk.id)}
                      style={{
                        padding: '14px 16px',
                        background: selectedAttack === atk.id ? '#FEE2E2' : '#FFFFFF',
                        border: selectedAttack === atk.id ? '2px solid #DC2626' : '1.5px solid #0F0F0F',
                        boxShadow: selectedAttack === atk.id ? '2px 2px 0px #DC2626' : 'none',
                        borderRadius: 2,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: selectedAttack === atk.id ? '#DC2626' : '#0F0F0F',
                        fontFamily: "'Space Grotesk', sans-serif",
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>
                        {atk.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impersonation Message Edit & Spoof Box */}
              {selectedAttack === 'impersonation' && (
                <div style={{
                  marginBottom: 20,
                  padding: '16px 18px',
                  background: '#FEF2F2',
                  border: '2px solid #DC2626',
                  boxShadow: '3px 3px 0px #DC2626',
                  borderRadius: 2,
                  animation: 'qds-appear 0.2s ease',
                }}>
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
                      value={impersonatedMsg}
                      onChange={(e) => setImpersonatedMsg(e.target.value)}
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

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>ATTACK INTENSITY / NOISE (STRENGTH):</span>
                  <span>{(attackStrength * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={attackStrength}
                  onChange={(e) => setAttackStrength(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleIntercept()}
                  disabled={actionLoading}
                  style={{
                    background: '#DC2626',
                    color: '#FFFFFF',
                    border: '2px solid #0F0F0F',
                    boxShadow: '3px 3px 0px #0F0F0F',
                    borderRadius: 2,
                    padding: '12px 24px',
                    fontSize: 12,
                    fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: 'pointer',
                  }}
                >
                  {actionLoading
                    ? 'INJECTING...'
                    : selectedAttack === 'impersonation'
                    ? 'EXECUTE IMPERSONATION & FORWARD SPOOFED MSG'
                    : 'EXECUTE CHANNEL PERTURBATION'}
                </button>

                <button
                  onClick={() => handleIntercept('none')}
                  disabled={actionLoading}
                  style={{
                    background: '#10B981',
                    color: '#FFFFFF',
                    border: '2px solid #0F0F0F',
                    boxShadow: '3px 3px 0px #0F0F0F',
                    borderRadius: 2,
                    padding: '12px 24px',
                    fontSize: 12,
                    fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: 'pointer',
                  }}
                >
                  PASS UNTOUCHED (LEGITIMATE CHANNEL)
                </button>
              </div>

              {state?.attacker?.status === 'intercepted' && (
                <div style={{
                  marginTop: 20,
                  padding: '12px 16px',
                  background: '#FEF2F2',
                  border: '1.5px solid #EF4444',
                  borderRadius: 2,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11.5,
                  color: '#991B1B',
                }}>
                  {state.attacker.attack_type === 'impersonation' ? (
                    <div>
                      <div style={{ fontWeight: 800, marginBottom: 4 }}>
                        [IMPERSONATION INJECTED — IDENTITY SPOOFED]:
                      </div>
                      <div>
                        Eve is pretending to be <b>Node 01 (Alice)</b>. Forwarded forged payload: <b>"{state.message}"</b> to Node 03 (Receiver).
                      </div>
                    </div>
                  ) : (
                    <div>
                      <b>[CHANNEL PERTURBED]:</b> Applied <b>{state.attacker.attack_type}</b> ({((state.attacker.attack_strength || 0) * 100).toFixed(0)}% strength). Forwarded to Node 03 (Receiver).
                    </div>
                  )}
                </div>
              )}

              {state?.attacker?.status === 'passed' && (
                <div style={{
                  marginTop: 20,
                  padding: '12px 16px',
                  background: '#ECFDF5',
                  border: '1.5px solid #10B981',
                  borderRadius: 2,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11.5,
                  color: '#065F46',
                }}>
                  <b>[PASSED INTACT]:</b> State forwarded to Node 03 without interference.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* ROLE 3: RECEIVER (Bob & Judges)                           */}
      {/* ========================================================= */}
      {role === 'receiver' && (
        <div style={{
          background: '#FAF9F5',
          border: '2px solid #0F0F0F',
          boxShadow: '3px 3px 0px #0F0F0F',
          borderRadius: 2,
          padding: '28px 32px',
        }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>
              [NODE 03] Receiver Observatory (Bob)
            </h2>
          </div>

          {currentStatus === 'IDLE' ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              border: '1.5px dashed #0F0F0F',
              borderRadius: 2,
              color: '#666',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <div style={{ fontWeight: 800 }}>WAITING FOR INCOMING TRANSMISSION...</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>
                Node 01 (Sender) must transmit a quantum signature payload first.
              </div>
            </div>
          ) : (
            <div>
              {/* Transmission summary */}
              <div style={{
                padding: '14px 18px',
                background: '#F5F4EE',
                border: '1.5px solid #0F0F0F',
                borderRadius: 2,
                marginBottom: 20,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><b>Incoming Payload:</b> "{state?.message}"</span>
                  <span style={{ color: '#555' }}>Session #{state?.session_id}</span>
                </div>
              </div>

              {/* Verify Button */}
              {currentStatus !== 'VERIFIED' && (
                <button
                  onClick={handleVerify}
                  disabled={actionLoading}
                  style={{
                    background: '#7C3AED',
                    color: '#FFFFFF',
                    border: '2px solid #0F0F0F',
                    boxShadow: '3px 3px 0px #0F0F0F',
                    borderRadius: 2,
                    padding: '14px 30px',
                    fontSize: 13,
                    fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: 'pointer',
                    width: '100%',
                    marginBottom: 20,
                  }}
                >
                  {actionLoading ? 'EXECUTING PAULI MEASUREMENTS...' : 'MEASURE PAULI EIGENSTATES & VERIFY'}
                </button>
              )}

              {/* Verification Results Panel */}
              {state?.receiver?.status === 'verified' && (
                <div style={{ animation: 'qds-appear 0.3s ease' }}>
                  {/* Verdict Banner */}
                  <div style={{
                    padding: '18px 22px',
                    background: state.receiver.decision === 'ACCEPT' ? '#ECFDF5' : '#FEF2F2',
                    border: `2px solid ${state.receiver.decision === 'ACCEPT' ? '#10B981' : '#DC2626'}`,
                    boxShadow: `3px 3px 0px ${state.receiver.decision === 'ACCEPT' ? '#10B981' : '#DC2626'}`,
                    borderRadius: 2,
                    marginBottom: 20,
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: state.receiver.decision === 'ACCEPT' ? '#047857' : '#991B1B',
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}>
                      {state.receiver.decision === 'ACCEPT' ? '✓ SIGNATURE ACCEPTED — LEGITIMATE' : '✕ SIGNATURE REJECTED — THREAT DETECTED'}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: state.receiver.decision === 'ACCEPT' ? '#065F46' : '#7F1D1D',
                      fontFamily: "'JetBrains Mono', monospace",
                      marginTop: 6,
                    }}>
                      Reason: {state.receiver.reason || 'Verification check outcome'}
                    </div>
                  </div>

                  {/* Physics & Threat Metrics Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 12,
                    marginBottom: 20,
                  }}>
                    <div style={{
                      background: '#FAF9F5',
                      border: '1.5px solid #0F0F0F',
                      padding: '14px',
                      borderRadius: 2,
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#666', fontFamily: "'JetBrains Mono', monospace" }}>
                        QUANTUM BIT ERROR RATE (QBER)
                      </div>
                      <div style={{
                        fontSize: 22,
                        fontWeight: 900,
                        color: (state.receiver.qber ?? 0) > 0.11 ? '#DC2626' : '#10B981',
                        fontFamily: "'Space Grotesk', sans-serif",
                        marginTop: 4,
                      }}>
                        {((state.receiver.qber ?? 0) * 100).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: 10, color: '#666', fontFamily: "'JetBrains Mono', monospace" }}>
                        Threshold: ≤ 11.0%
                      </div>
                    </div>

                    <div style={{
                      background: '#FAF9F5',
                      border: '1.5px solid #0F0F0F',
                      padding: '14px',
                      borderRadius: 2,
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#666', fontFamily: "'JetBrains Mono', monospace" }}>
                        QUANTUM STATE FIDELITY (F)
                      </div>
                      <div style={{
                        fontSize: 22,
                        fontWeight: 900,
                        color: (state.receiver.fidelity ?? 1) >= 0.95 ? '#10B981' : '#DC2626',
                        fontFamily: "'Space Grotesk', sans-serif",
                        marginTop: 4,
                      }}>
                        {((state.receiver.fidelity ?? 1) * 100).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: 10, color: '#666', fontFamily: "'JetBrains Mono', monospace" }}>
                        Threshold: ≥ 95.0%
                      </div>
                    </div>

                    <div style={{
                      background: '#FAF9F5',
                      border: '1.5px solid #0F0F0F',
                      padding: '14px',
                      borderRadius: 2,
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#666', fontFamily: "'JetBrains Mono', monospace" }}>
                        4-GATE VERIFICATION
                      </div>
                      <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                        <div>Sig: {state.receiver.signature_valid ? '✓ PASS' : '✕ FAIL'}</div>
                        <div>Id: {state.receiver.identity_valid ? '✓ PASS' : '✕ FAIL'}</div>
                        <div>Fresh: {state.receiver.replay_valid ? '✓ PASS' : '✕ FAIL'}</div>
                        <div>Q-State: {state.receiver.quantum_valid ? '✓ PASS' : '✕ FAIL'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Audit Trail Snippet */}
                  {state.receiver.audit_entry && (
                    <div style={{
                      background: '#F5F4EE',
                      border: '1.5px solid #0F0F0F',
                      padding: '12px 16px',
                      borderRadius: 2,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10.5,
                      color: '#444',
                    }}>
                      <div style={{ fontWeight: 800, color: '#0F0F0F', marginBottom: 4 }}>
                        CRYPTOGRAPHIC TAMPER-EVIDENT AUDIT TRAIL LOGGED:
                      </div>
                      <div><b>Block Hash:</b> {state.receiver.audit_entry.entry_hash || 'SHA-256 SEALED'}</div>
                      <div><b>Timestamp:</b> {state.receiver.audit_entry.timestamp || new Date().toISOString()}</div>
                      <div><b>Decision Authority:</b> Deterministic physics threshold evaluation (Non-AI)</div>
                    </div>
                  )}

                  <div style={{ marginTop: 16 }}>
                    <button
                      onClick={handleReset}
                      style={{
                        background: '#FAF9F5',
                        border: '1.5px solid #0F0F0F',
                        padding: '8px 16px',
                        fontSize: 11,
                        fontWeight: 800,
                        fontFamily: "'JetBrains Mono', monospace",
                        cursor: 'pointer',
                      }}
                    >
                      ← RUN ANOTHER EXPERIMENT (RESET SESSION)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
