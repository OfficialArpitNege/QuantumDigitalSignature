import type {
  ProtocolExecuteResponse,
  SignResponse,
  ExperimentResponse,
  FullPipelineResponse,
  FullPipelineAuditRecord,
} from '../../types/api';

interface Props {
  // Phase 12 primary source
  fullPipelineData?: FullPipelineResponse | null;
  // Legacy sources (still used for backward compat + diagnostic panels)
  protocolData?: ProtocolExecuteResponse | null;
  signData?: SignResponse | null;
  experimentData?: ExperimentResponse | null;
  isOpen: boolean;
  onToggle: () => void;
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap' }}>
      <span style={{ color: '#64748b', fontSize: 11, minWidth: 160, flexShrink: 0 }}>{k}</span>
      <span style={{ color: '#cbd5e1', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all', flex: 1 }}>{v}</span>
    </div>
  );
}

function SectionHead({ title }: { title: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0ea5e9', marginBottom: 8 }}>
      {title}
    </div>
  );
}

function HashChip({ label, hash, color = '#4ade80' }: { label: string; hash: string; color?: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 9, color: '#64748b', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        color, background: '#0d1728', padding: '4px 8px',
        borderRadius: 4, wordBreak: 'break-all', lineHeight: 1.6,
      }}>
        {hash}
      </div>
    </div>
  );
}

function AuditSection({ record, chainLength }: { record: FullPipelineAuditRecord; chainLength: number }) {
  const ed = record.event_data;
  const isAccept = ed.decision === 'ACCEPT';
  return (
    <section style={{ marginBottom: 16 }}>
      <SectionHead title={`Tamper-Evident Audit Record (Chain length: ${chainLength})`} />
      <div style={{
        background: '#0d1728',
        border: `1px solid ${isAccept ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
        borderRadius: 8, padding: '10px 14px', marginBottom: 8,
      }}>
        <Row k="Sequence"       v={String(record.sequence)} />
        <Row k="Timestamp"      v={ed.timestamp} />
        <Row k="Session ID"     v={ed.session_id} />
        <Row k="Sender"         v={ed.sender} />
        <Row k="Receiver"       v={ed.receiver} />
        <Row k="Attack Type"    v={ed.attack_type} />
        <Row k="Decision"       v={ed.decision} />
        <Row k="Signature ✓"   v={String(ed.signature_valid)} />
        <Row k="Identity ✓"    v={String(ed.identity_valid)} />
        <Row k="Replay ✓"      v={String(ed.replay_valid)} />
        <Row k="Quantum ✓"     v={String(ed.quantum_valid)} />
        <Row k="Msg Hash"       v={ed.message_hash_hex} />
      </div>
      <HashChip label="Previous Audit Hash" hash={record.previous_hash} color="#94a3b8" />
      <HashChip label="Current Audit Hash"  hash={record.current_hash}  color="#4ade80" />
      <div style={{ fontSize: 9, color: '#374151', marginTop: 4, fontStyle: 'italic' }}>
        SHA-256 hash chain prototype — each record's hash covers the previous hash + event data.
        Chain integrity verifiable via GET /api/v1/audit/verify
      </div>
    </section>
  );
}

export default function TechnicalDetailsDrawer({
  fullPipelineData,
  protocolData,
  signData,
  experimentData,
  isOpen,
  onToggle,
}: Props) {
  // Prefer full pipeline data; fall back to legacy
  const session    = fullPipelineData?.session ?? protocolData?.session;
  const verification = fullPipelineData?.verification ?? protocolData?.verification;
  const logs       = fullPipelineData?.logs ?? protocolData?.logs ?? [];
  const qtx        = fullPipelineData?.quantum_transmission;
  const stats      = fullPipelineData?.statistical_analysis;
  const threat     = fullPipelineData?.threat_assessment;
  const audit      = fullPipelineData?.audit;

  return (
    <div>
      <button
        onClick={onToggle}
        style={{
          background: 'none', border: 'none', color: '#475569',
          fontWeight: 700, fontSize: 12, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          padding: 0, textTransform: 'uppercase', letterSpacing: '0.07em',
        }}
      >
        <span style={{ fontSize: 10 }}>{isOpen ? '▾' : '▸'}</span>
        Technical Details &amp; Audit Log
      </button>

      {isOpen && (
        <div style={{
          marginTop: 12,
          background: '#080e1a',
          border: '1px solid rgba(14,165,233,0.15)',
          borderRadius: 10, padding: 18,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          animation: 'qds-appear 0.2s ease',
        }}>

          {/* ── Session ── */}
          {session && (
            <section style={{ marginBottom: 16 }}>
              <SectionHead title="Session" />
              <Row k="Session ID" v={String((session as Record<string, unknown>).session_id ?? '—')} />
              <Row k="Nonce"      v={String((session as Record<string, unknown>).nonce ?? '—')} />
              {'sender' in session && <Row k="Sender"   v={String(session.sender)} />}
              {'receiver' in session && <Row k="Receiver" v={String(session.receiver)} />}
              {'created_at' in session && <Row k="Created At" v={String(session.created_at)} />}
              {fullPipelineData && (
                <>
                  <Row k="Pipeline Version" v={fullPipelineData.pipeline_version} />
                  <Row k="Execution Time"   v={`${fullPipelineData.execution_time_ms} ms`} />
                </>
              )}
            </section>
          )}

          {/* ── Signing layer (from legacy signData if available) ── */}
          {signData && (
            <section style={{ marginBottom: 16 }}>
              <SectionHead title="Classical Signing Layer (Prototype HMAC-SHA256)" />
              <Row k="Message Hash (SHA-256)" v={signData.message_hash_hex} />
              <Row k="Signing Material"       v={`${signData.signature_material_hex.slice(0, 48)}…`} />
              <Row k="Nonce"                  v={signData.nonce} />
              <Row k="Session ID"             v={signData.session_id} />
              <Row k="Qubits Encoded"         v={String(signData.qubits.length)} />
              <div style={{ marginTop: 6, fontSize: 10, color: '#374151', fontStyle: 'italic', fontFamily: 'inherit' }}>
                {signData.prototype_note}
              </div>
            </section>
          )}

          {/* ── Message hash from pipeline if no signData ── */}
          {!signData && fullPipelineData?.signature && (
            <section style={{ marginBottom: 16 }}>
              <SectionHead title="Signature Layer" />
              <Row k="Message Hash (SHA-256)" v={fullPipelineData.signature.message_hash_hex} />
              <Row k="Max Symbols"            v={String(fullPipelineData.signature.max_symbols)} />
              <Row k="Attack Type"            v={fullPipelineData.signature.attack_type} />
              <Row k="Attack Strength"        v={String(fullPipelineData.signature.attack_strength)} />
            </section>
          )}

          {/* ── Quantum Transmission ── */}
          {qtx && (
            <section style={{ marginBottom: 16 }}>
              <SectionHead title="Quantum Transmission" />
              <Row k="Qubits Transmitted"  v={String(qtx.qubits_transmitted)} />
              <Row k="Shots Per Qubit"     v={String(qtx.shots_per_qubit)} />
              <Row k="Average Fidelity"    v={`${(qtx.average_fidelity * 100).toFixed(4)}%`} />
              <Row k="Fidelity Threshold"  v={`${(qtx.fidelity_threshold * 100).toFixed(0)}%`} />
              <Row k="Per-Qubit Fidelities" v={qtx.per_qubit_fidelities.map(f => (f * 100).toFixed(2) + '%').join(', ')} />
            </section>
          )}

          {/* ── Statistical Analysis ── */}
          {stats && (
            <section style={{ marginBottom: 16 }}>
              <SectionHead title="Statistical Analysis (Phase 8 — Evidence Only)" />
              <Row k="QBER Proxy"          v={`${(stats.qber_proxy * 100).toFixed(2)}%`} />
              <Row k="Avg Fidelity"        v={`${(stats.average_fidelity * 100).toFixed(4)}%`} />
              <Row k="Vector Deviation"    v={stats.vector_deviation.toFixed(6)} />
              <Row k="TV Distance"         v={stats.total_variation_distance.toFixed(6)} />
              <Row k="JSD"                 v={stats.jensen_shannon_divergence.toFixed(6)} />
              <Row k="Standard Error"      v={stats.standard_error.toFixed(6)} />
              <Row k="95% CI"              v={`[${stats.confidence_interval_95[0].toFixed(4)}, ${stats.confidence_interval_95[1].toFixed(4)}]`} />
              <div style={{ marginTop: 4, fontSize: 9, color: '#374151', fontStyle: 'italic', fontFamily: 'inherit' }}>
                {stats.label}
              </div>
            </section>
          )}

          {/* ── Threat Assessment ── */}
          {threat && (
            <section style={{ marginBottom: 16 }}>
              <SectionHead title="Heuristic Threat Assessment (Supporting Evidence Only)" />
              <Row k="Classified Attack" v={threat.classified_attack} />
              <Row k="Threat Score"      v={`${threat.threat_score}/100`} />
              <Row k="Threat Level"      v={threat.threat_level} />
              <div style={{ marginTop: 4, fontSize: 9, color: '#ef4444', fontStyle: 'italic', fontFamily: 'inherit' }}>
                ⚠ {threat.label} — does NOT override deterministic verification decision.
              </div>
            </section>
          )}

          {/* ── Verification Result ── */}
          {verification && (
            <section style={{ marginBottom: 16 }}>
              <SectionHead title="Verification Result (Deterministic — Sole Authority)" />
              <pre style={{
                background: '#0d1728', padding: 10, borderRadius: 6,
                overflowX: 'auto', color: '#4ade80', margin: 0,
                fontSize: 11, lineHeight: 1.5,
              }}>
                {JSON.stringify(verification, null, 2)}
              </pre>
            </section>
          )}

          {/* ── Phase 11 Audit Record ── */}
          {audit?.latest_record && (
            <AuditSection record={audit.latest_record} chainLength={audit.chain_length} />
          )}

          {/* ── Qubit-level data from legacy experiment ── */}
          {experimentData && experimentData.results.length > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionHead title={`Qubit-Level Teleportation Data (${experimentData.results.length} symbols)`} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                {experimentData.results.map(r => (
                  <div key={r.index} style={{
                    background: '#0d1728', borderRadius: 6, padding: '8px 10px',
                    border: `1px solid ${r.fidelity >= 0.99 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  }}>
                    <div style={{ color: '#94a3b8', marginBottom: 4 }}>
                      Symbol #{r.index} — bit={r.source_bit} — Bell={r.bell_measurement}
                    </div>
                    <div style={{ color: r.fidelity >= 0.99 ? '#4ade80' : '#f87171' }}>
                      F = {(r.fidelity * 100).toFixed(2)}%
                    </div>
                    <div style={{ color: '#64748b', fontSize: 10 }}>
                      Exp X={r.expected.X.toFixed(3)} Y={r.expected.Y.toFixed(3)} Z={r.expected.Z.toFixed(3)}
                    </div>
                    <div style={{ color: '#64748b', fontSize: 10 }}>
                      Obs X={r.observed.X.toFixed(3)} Y={r.observed.Y.toFixed(3)} Z={r.observed.Z.toFixed(3)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Protocol Step Logs ── */}
          {logs.length > 0 && (
            <section>
              <SectionHead title={`Protocol Execution Log (${logs.length} stages)`} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {logs.map((log, i) => (
                  <div key={i} style={{ background: '#0d1728', padding: '6px 10px', borderRadius: 6 }}>
                    <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: 10 }}>{log.step}</div>
                    <div style={{ color: '#94a3b8', fontSize: 10 }}>{log.description}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
