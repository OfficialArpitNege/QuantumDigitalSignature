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
      "The sender's HMAC signature was cryptographically valid, the sender identity matched the authorised key, " +
      "the session nonce was fresh (replay protection passed), and the quantum state received by the receiver matched " +
      "the sender's expected state with fidelity ≥ threshold. The protocol accepted the message."
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
      "Identity verification failed — the sender identity did not match the authorised sender key. " +
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
      "Quantum state verification failed — the quantum state received by the receiver did not match the sender's expected state. " +
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
  const bg     = '#FAF9F5';
  const border = isAccept ? '2px solid #0F0F0F' : '2px solid #DC2626';

  const failedChecks = [
    !verification.signature_valid && 'Signature',
    !verification.identity_valid  && 'Identity',
    !verification.replay_valid    && 'Replay',
    !verification.quantum_valid   && 'Quantum State',
  ].filter(Boolean) as string[];

  return (
    <div style={{ background: bg, border, borderRadius: 4, padding: '16px 20px', marginBottom: 12, boxShadow: '2px 2px 0px #0F0F0F' }}>
      <div style={{
        fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: '#0F0F0F', marginBottom: 6,
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        WHY DID THE SYSTEM MAKE THIS DECISION?
      </div>

      <div style={{ fontSize: 13, color: '#0F0F0F', lineHeight: 1.65, maxWidth: 800, fontFamily: "'JetBrains Mono', monospace" }}>
        {buildExplanation(verification)}
      </div>

      {/* Failed check badges — shown only on REJECT with actual failures */}
      {!isAccept && failedChecks.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {failedChecks.map(c => (
            <span key={c} style={{
              fontSize: 11, fontWeight: 800, padding: '3px 10px',
              borderRadius: 2,
              background: '#FAF9F5',
              border: '1.5px solid #0F0F0F',
              color: '#0F0F0F',
              fontFamily: "'JetBrains Mono', monospace",
              boxShadow: '2px 2px 0px #0F0F0F',
            }}>
              <span style={{ color: '#DC2626', marginRight: 4 }}>X</span> {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
