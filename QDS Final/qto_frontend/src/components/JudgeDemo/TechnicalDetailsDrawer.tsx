import { useState, type ReactNode } from 'react';
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
  isOpen?: boolean;
  onToggle?: () => void;
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '5px 0', borderBottom: '1px solid #E5E3DA', flexWrap: 'wrap' }}>
      <span style={{ color: '#555555', fontSize: 11, minWidth: 160, flexShrink: 0, fontWeight: 700 }}>{k}</span>
      <span style={{ color: '#0F0F0F', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all', fontWeight: 700, flex: 1 }}>{v}</span>
    </div>
  );
}

function HashChip({ label, hash, color = '#1D4ED8' }: { label: string; hash: string; color?: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 9, color: '#555555', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{label}</div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        color, background: '#FAF9F5', padding: '6px 10px',
        border: '1.5px solid #0F0F0F', boxShadow: '2px 2px 0px #0F0F0F',
        borderRadius: 2, wordBreak: 'break-all', lineHeight: 1.6, fontWeight: 800
      }}>
        {hash}
      </div>
    </div>
  );
}

function AccordionSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{
      background: '#FAF9F5',
      border: '1.5px solid #0F0F0F',
      boxShadow: '2px 2px 0px #0F0F0F',
      borderRadius: 2,
      marginBottom: 12,
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#FAF9F5',
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 800,
          color: '#0F0F0F',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: 12, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div style={{ padding: '4px 16px 16px 16px', borderTop: '1.5px solid #0F0F0F' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function AuditSection({ record, chainLength }: { record: FullPipelineAuditRecord; chainLength: number }) {
  const ed = record.event_data;
  return (
    <AccordionSection title={`Tamper-Evident Audit Record (Chain length: ${chainLength})`}>
      <div style={{ marginTop: 10, marginBottom: 10 }}>
        <Row k="Sequence"       v={String(record.sequence)} />
        <Row k="Timestamp"      v={ed.timestamp} />
        <Row k="Session ID"     v={ed.session_id} />
        <Row k="Sender"         v={ed.sender} />
        <Row k="Receiver"       v={ed.receiver} />
        <Row k="Attack Type"    v={ed.attack_type} />
        <Row k="Decision"       v={ed.decision} />
        <Row k="Signature Check" v={String(ed.signature_valid)} />
        <Row k="Identity Check"  v={String(ed.identity_valid)} />
        <Row k="Replay Check"    v={String(ed.replay_valid)} />
        <Row k="Quantum Check"   v={String(ed.quantum_valid)} />
        <Row k="Msg Hash"       v={ed.message_hash_hex} />
      </div>
      <HashChip label="Previous Audit Hash" hash={record.previous_hash} color="#555555" />
      <HashChip label="Current Audit Hash"  hash={record.current_hash}  color="#1D4ED8" />
    </AccordionSection>
  );
}

export default function TechnicalDetailsDrawer({
  fullPipelineData,
  protocolData,
  signData,
  experimentData,
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
    <div style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      color: '#0F0F0F',
    }}>
      {/* ── Session ── */}
      {session && (
        <AccordionSection title="Session" defaultOpen={false}>
          <div style={{ paddingTop: 6 }}>
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
          </div>
        </AccordionSection>
      )}

      {/* ── Signing layer ── */}
      {signData && (
        <AccordionSection title="Classical Signing Layer (HMAC-SHA256)">
          <div style={{ paddingTop: 6 }}>
            <Row k="Message Hash (SHA-256)" v={signData.message_hash_hex} />
            <Row k="Signing Material"       v={`${signData.signature_material_hex.slice(0, 48)}…`} />
            <Row k="Nonce"                  v={signData.nonce} />
            <Row k="Session ID"             v={signData.session_id} />
            <Row k="Qubits Encoded"         v={String(signData.qubits.length)} />
          </div>
        </AccordionSection>
      )}

      {/* ── Message hash from pipeline if no signData ── */}
      {!signData && fullPipelineData?.signature && (
        <AccordionSection title="Signature Layer">
          <div style={{ paddingTop: 6 }}>
            <Row k="Message Hash (SHA-256)" v={fullPipelineData.signature.message_hash_hex} />
            <Row k="Max Symbols"            v={String(fullPipelineData.signature.max_symbols)} />
            <Row k="Attack Type"            v={fullPipelineData.signature.attack_type} />
            <Row k="Attack Strength"        v={String(fullPipelineData.signature.attack_strength)} />
          </div>
        </AccordionSection>
      )}

      {/* ── Quantum Transmission ── */}
      {qtx && (
        <AccordionSection title="Quantum Transmission">
          <div style={{ paddingTop: 6 }}>
            <Row k="Qubits Transmitted"  v={String(qtx.qubits_transmitted)} />
            <Row k="Shots Per Qubit"     v={String(qtx.shots_per_qubit)} />
            <Row k="Average Fidelity"    v={`${(qtx.average_fidelity * 100).toFixed(4)}%`} />
            <Row k="Fidelity Threshold"  v={`${(qtx.fidelity_threshold * 100).toFixed(0)}%`} />
            <Row k="Per-Qubit Fidelities" v={qtx.per_qubit_fidelities.map(f => (f * 100).toFixed(2) + '%').join(', ')} />
          </div>
        </AccordionSection>
      )}

      {/* ── Statistical Analysis ── */}
      {stats && (
        <AccordionSection title="Statistical Analysis">
          <div style={{ paddingTop: 6 }}>
            <Row k="QBER Proxy"          v={`${(stats.qber_proxy * 100).toFixed(2)}%`} />
            <Row k="Avg Fidelity"        v={`${(stats.average_fidelity * 100).toFixed(4)}%`} />
            <Row k="Vector Deviation"    v={stats.vector_deviation.toFixed(6)} />
            <Row k="TV Distance"         v={stats.total_variation_distance.toFixed(6)} />
            <Row k="JSD"                 v={stats.jensen_shannon_divergence.toFixed(6)} />
            <Row k="Standard Error"      v={stats.standard_error.toFixed(6)} />
            <Row k="95% CI"              v={`[${stats.confidence_interval_95[0].toFixed(4)}, ${stats.confidence_interval_95[1].toFixed(4)}]`} />
          </div>
        </AccordionSection>
      )}

      {/* ── Threat Assessment ── */}
      {threat && (
        <AccordionSection title="Threat Assessment">
          <div style={{ paddingTop: 6 }}>
            <Row k="Classified Attack" v={threat.classified_attack} />
            <Row k="Threat Score"      v={`${threat.threat_score}/100`} />
            <Row k="Threat Level"      v={threat.threat_level} />
          </div>
        </AccordionSection>
      )}

      {/* ── Verification Result JSON ── */}
      {verification && (
        <AccordionSection title="Verification Result">
          <pre style={{
            background: '#FAF9F5',
            border: '1.5px solid #0F0F0F',
            boxShadow: '2px 2px 0px #0F0F0F',
            padding: 14,
            borderRadius: 2,
            overflowX: 'auto',
            color: '#1D4ED8',
            marginTop: 10,
            marginBottom: 0,
            fontSize: 11,
            fontWeight: 700,
            lineHeight: 1.5,
          }}>
            {JSON.stringify(verification, null, 2)}
          </pre>
        </AccordionSection>
      )}

      {/* ── Phase 11 Audit Record ── */}
      {audit?.latest_record && (
        <AuditSection record={audit.latest_record} chainLength={audit.chain_length} />
      )}

      {/* ── Qubit-level data from legacy experiment ── */}
      {experimentData && experimentData.results.length > 0 && (
        <AccordionSection title={`Qubit-Level Teleportation Data (${experimentData.results.length} symbols)`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10, paddingTop: 10 }}>
            {experimentData.results.map(r => (
              <div key={r.index} style={{
                background: '#FAF9F5', borderRadius: 2, padding: '10px 12px',
                border: '1.5px solid #0F0F0F', boxShadow: '2px 2px 0px #0F0F0F',
              }}>
                <div style={{ color: '#0F0F0F', marginBottom: 4, fontWeight: 700 }}>
                  Symbol #{r.index} — bit={r.source_bit} — Bell={r.bell_measurement}
                </div>
                <div style={{ color: r.fidelity >= 0.99 ? '#1D4ED8' : '#DC2626', fontWeight: 800 }}>
                  F = {(r.fidelity * 100).toFixed(2)}%
                </div>
                <div style={{ color: '#555555', fontSize: 10, fontWeight: 600 }}>
                  Exp X={r.expected.X.toFixed(3)} Y={r.expected.Y.toFixed(3)} Z={r.expected.Z.toFixed(3)}
                </div>
                <div style={{ color: '#555555', fontSize: 10, fontWeight: 600 }}>
                  Obs X={r.observed.X.toFixed(3)} Y={r.observed.Y.toFixed(3)} Z={r.observed.Z.toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        </AccordionSection>
      )}

      {/* ── Protocol Step Logs ── */}
      {logs.length > 0 && (
        <AccordionSection title={`Protocol Execution Logs (${logs.length} stages)`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 10 }}>
            {logs.map((log, i) => (
              <div key={i} style={{ background: '#FAF9F5', border: '1.5px solid #0F0F0F', boxShadow: '2px 2px 0px #0F0F0F', padding: '8px 12px', borderRadius: 2 }}>
                <div style={{ color: '#0F0F0F', fontWeight: 800, fontSize: 11 }}>{log.step}</div>
                <div style={{ color: '#555555', fontSize: 10, fontWeight: 600 }}>{log.description}</div>
              </div>
            ))}
          </div>
        </AccordionSection>
      )}
    </div>
  );
}
