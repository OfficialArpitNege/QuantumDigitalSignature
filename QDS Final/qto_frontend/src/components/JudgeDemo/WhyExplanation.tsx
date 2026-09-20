import type { ProtocolVerificationResult } from '../../types/api';

interface Props {
  verification: ProtocolVerificationResult;
  // attackType is kept for UI label but the actual explanation
  // derives entirely from the backend's verification flags and reason.
  attackType?: string;
}

/**
 * Builds a human-readable explanation driven entirely by the backend's
 * deterministic verification result. The backend reason and individual check
 * flags are the sole source of truth — no attack-type guessing in the frontend.
 */
function buildExplanation(v: ProtocolVerificationResult): string {
  if (v.decision === 'ACCEPT') {
    return (
      "All four deterministic verification checks passed: " +
      "Alice's HMAC signature was cryptographically valid, the sender identity matched the authorised key, " +
      "the session nonce was fresh (replay protection passed), and the quantum state received by Bob matched " +
      "Alice's expected state with fidelity ≥ threshold. The protocol accepted the message."
    );
  }

  // Build a list of failed checks from the actual backend flags.
  const failed: string[] = [];
  if (!v.signature_valid) {
    failed.push(
      "Signature verification failed — the HMAC signing material received did not match the expected value. " +
      "The message may have been forged or the signature material tampered with."
    );
  }
  if (!v.identity_valid) {
    failed.push(
      "Identity verification failed — the sender identity did not match Alice's authorised key. " +
      "An unauthorised entity may have attempted to participate in this protocol session."
    );
  }
  if (!v.replay_valid) {
    failed.push(
      "Replay protection failed — the session nonce had already been processed or was flagged as a replay attempt. " +
      "The protocol rejected the request to prevent replay attacks."
    );
  }
  if (!v.quantum_valid) {
    failed.push(
      "Quantum state verification failed — the quantum state received by Bob did not match Alice's expected state. " +
      "The fidelity fell below the protocol threshold, indicating channel noise or active quantum manipulation."
    );
  }

  if (failed.length === 0) {
    // Fallback: use the backend reason string directly
    return v.reason || "One or more deterministic verification checks failed — the protocol rejected the message.";
  }

  if (failed.length === 1) {
    return `The protocol rejected this message because: ${failed[0]}`;
  }

  const list = failed.map((f, i) => `${i + 1}. ${f}`).join(' ');
  return `The protocol rejected this message because multiple checks failed: ${list}`;
}

export default function WhyExplanation({ verification }: Props) {
  const isAccept = verification.decision === 'ACCEPT';
  const color  = isAccept ? '#10b981' : '#ef4444';
  const bg     = isAccept ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)';
  const border = isAccept ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)';

  const failedChecks = [
    !verification.signature_valid && 'Signature',
    !verification.identity_valid  && 'Identity',
    !verification.replay_valid    && 'Replay',
    !verification.quantum_valid   && 'Quantum State',
  ].filter(Boolean) as string[];

  return (
    <div style={{ background: bg, border, borderRadius: 10, padding: '14px 18px', marginBottom: 12 }}>
      <div style={{
        fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
        letterSpacing: '0.1em', color, marginBottom: 6,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        💡 Why did the system make this decision?
      </div>

      <div style={{ fontSize: 13, color: 'var(--lab-text)', lineHeight: 1.65, maxWidth: 800 }}>
        {buildExplanation(verification)}
      </div>

      {/* Failed check badges — shown only on REJECT with actual failures */}
      {!isAccept && failedChecks.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {failedChecks.map(c => (
            <span key={c} style={{
              fontSize: 10, fontWeight: 800, padding: '2px 9px',
              borderRadius: 20,
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444',
            }}>
              ✗ {c}
            </span>
          ))}
        </div>
      )}

      {/* Backend reason (secondary detail) */}
      {verification.reason && (
        <div style={{
          marginTop: 10, paddingTop: 8,
          borderTop: `1px solid ${isAccept ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'}`,
          fontSize: 11, color: 'var(--lab-text-muted, #64748b)',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Backend reason: {verification.reason}
        </div>
      )}
    </div>
  );
}
