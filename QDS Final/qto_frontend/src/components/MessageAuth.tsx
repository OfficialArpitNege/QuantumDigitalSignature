import type { SignResponse } from '../types/api';
import FormulaAccordion from './FormulaAccordion';

interface Props {
  data: SignResponse;
}

function truncate(s: string, n = 32) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

export default function MessageAuth({ data }: Props) {
  return (
    <div className="card section">
      <div style={{ marginBottom: 16 }}>
        <div className="section-label">Cryptographic Layer</div>
        <div className="section-title">Message Authentication</div>
        <div className="section-sub">HMAC-SHA256 signing material derived from message hash</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Hash */}
        <div className="card-inset">
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
            Message Hash (SHA-256)
          </div>
          <div className="mono" style={{ fontSize: 11, wordBreak: 'break-all', color: 'var(--blue-900)', lineHeight: 1.7 }}>
            {data.message_hash_hex}
          </div>
        </div>

        {/* Signing material */}
        <div className="card-inset">
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
            Signing Material (HMAC)
          </div>
          <div className="mono" style={{ fontSize: 11, wordBreak: 'break-all', color: 'var(--blue-900)', lineHeight: 1.7 }}>
            {data.signature_material_hex}
          </div>
        </div>
      </div>

      {/* Session info */}
      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Nonce',      value: truncate(data.nonce, 28) },
          { label: 'Session ID', value: truncate(data.session_id, 24) },
          { label: 'Qubits Prepared', value: String(data.qubits.length) },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'var(--blue-50)', border: 'var(--border-light)',
            borderRadius: 8, padding: '10px 14px',
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Status badge */}
      <div style={{ marginTop: 14 }}>
        <span className="pill pill-green">✓ Signing Complete</span>
        {data.prototype_note && (
          <span style={{ marginLeft: 10, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {data.prototype_note}
          </span>
        )}
      </div>

      {/* Formula accordion */}
      <FormulaAccordion title="Show Signing Formula">
        <div className="formula-block">
          <div>h = SHA256(M)</div>
          <div style={{ marginTop: 8 }}>s = HMAC-SHA256(K<sub>priv</sub>, h ‖ nonce ‖ session_id)</div>
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          The private key is session-ephemeral. The signing material <em>s</em> is then converted to bits,
          each bit encoding a qubit on the Bloch sphere via angle mapping.
        </div>
      </FormulaAccordion>
    </div>
  );
}
