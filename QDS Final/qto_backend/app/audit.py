"""
Tamper-Evident Audit Prototype — Phase 11.

Implements a simple SHA-256 hash-chain to create an append-only, tamper-evident
audit trail for QDS protocol events.

DISCLAIMER: This is a prototype audit mechanism for research and demonstration
purposes.  It is NOT a production blockchain, distributed ledger, or formally
proven tamper-proof system.  It demonstrates the concept of hash-chaining for
audit integrity within a single process.

Chain invariant:
    record[i].current_hash == SHA256(record[i].previous_hash || record[i].event_data)
    record[i].previous_hash == record[i-1].current_hash   (for i > 0)
    record[0].previous_hash == GENESIS_HASH

Any modification, deletion, or reordering of records breaks one or more of
these invariants and is detected by AuditChain.verify().
"""

import hashlib
import json
import datetime
from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass, field

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
GENESIS_HASH: str = "0" * 64  # The anchor hash for the first record.

# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------

@dataclass
class AuditRecord:
    """
    A single tamper-evident audit record in the hash chain.

    Fields
    ------
    sequence   : Monotonically increasing position in the chain (0-indexed).
    event_data : Canonical dict of the recorded protocol event.
    previous_hash : Hash of the preceding record (GENESIS_HASH for record 0).
    current_hash  : SHA-256 of (previous_hash || serialised event_data).
    """
    sequence: int
    event_data: Dict[str, Any]
    previous_hash: str
    current_hash: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "sequence": self.sequence,
            "event_data": self.event_data,
            "previous_hash": self.previous_hash,
            "current_hash": self.current_hash,
        }


# ---------------------------------------------------------------------------
# Hashing helpers
# ---------------------------------------------------------------------------

def _canonical_json(obj: Any) -> str:
    """
    Deterministic JSON serialisation: sorted keys, no extra whitespace.
    Ensures the same dict always produces the same byte sequence for hashing.
    """
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def _compute_hash(previous_hash: str, event_data: Dict[str, Any]) -> str:
    """
    Computes  SHA256(previous_hash || canonical_json(event_data)).
    Both inputs are UTF-8 encoded before hashing.
    """
    payload = (previous_hash + _canonical_json(event_data)).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


# ---------------------------------------------------------------------------
# AuditChain
# ---------------------------------------------------------------------------

class AuditChain:
    """
    Append-only, tamper-evident hash-chain audit log.

    Usage
    -----
    chain = AuditChain()
    chain.record_event({...})
    ok, errors = chain.verify()
    records = chain.get_records()
    """

    def __init__(self) -> None:
        self._records: List[AuditRecord] = []

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def record_event(self, event_data: Dict[str, Any]) -> AuditRecord:
        """
        Appends a new record to the chain.

        The event_data dict must be JSON-serialisable.
        Returns the newly created AuditRecord.
        """
        previous_hash = self._records[-1].current_hash if self._records else GENESIS_HASH
        sequence = len(self._records)
        current_hash = _compute_hash(previous_hash, event_data)

        record = AuditRecord(
            sequence=sequence,
            event_data=event_data,
            previous_hash=previous_hash,
            current_hash=current_hash,
        )
        self._records.append(record)
        return record

    def verify(self) -> Tuple[bool, List[str]]:
        """
        Verifies the integrity of the entire chain.

        Checks:
        1. Each record's current_hash matches SHA256(previous_hash || event_data).
        2. Each record's previous_hash matches the preceding record's current_hash.
        3. The first record's previous_hash equals GENESIS_HASH.
        4. Sequence numbers are contiguous and correct.

        Returns
        -------
        (is_valid, errors)
            is_valid -- True if the chain is unmodified and internally consistent.
            errors   -- List of human-readable error descriptions (empty if valid).
        """
        errors: List[str] = []

        if not self._records:
            return True, []

        expected_previous = GENESIS_HASH

        for i, rec in enumerate(self._records):
            # Sequence check
            if rec.sequence != i:
                errors.append(
                    f"Record {i}: sequence mismatch -- expected {i}, got {rec.sequence}."
                )

            # previous_hash link check
            if rec.previous_hash != expected_previous:
                errors.append(
                    f"Record {i}: previous_hash mismatch -- chain link broken. "
                    f"Expected {expected_previous[:16]}..., got {rec.previous_hash[:16]}..."
                )

            # current_hash recomputation check
            expected_current = _compute_hash(rec.previous_hash, rec.event_data)
            if rec.current_hash != expected_current:
                errors.append(
                    f"Record {i}: current_hash mismatch -- event data may have been modified. "
                    f"Expected {expected_current[:16]}..., got {rec.current_hash[:16]}..."
                )

            expected_previous = rec.current_hash

        return len(errors) == 0, errors

    def get_records(self) -> List[Dict[str, Any]]:
        """Returns all audit records as serialisable dicts."""
        return [r.to_dict() for r in self._records]

    def get_record(self, sequence: int) -> Optional[AuditRecord]:
        """Returns the AuditRecord at the given sequence index, or None."""
        if 0 <= sequence < len(self._records):
            return self._records[sequence]
        return None

    def chain_length(self) -> int:
        """Returns the total number of records in the chain."""
        return len(self._records)

    def clear(self) -> None:
        """Resets the chain (for testing purposes only)."""
        self._records.clear()


# ---------------------------------------------------------------------------
# Event builder helpers
# ---------------------------------------------------------------------------

def build_protocol_audit_event(
    session_id: str,
    sender: str,
    receiver: str,
    message_hash_hex: str,
    signature_valid: bool,
    identity_valid: bool,
    replay_valid: bool,
    quantum_valid: bool,
    decision: str,
    attack_type: str,
    timestamp: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Constructs a canonical, deterministically serialisable audit event dict
    for a QDS protocol execution.

    All values are primitive types (str / bool) to guarantee stable JSON
    serialisation regardless of execution environment.
    """
    return {
        "audit_schema_version": "1.0",
        "timestamp": timestamp or datetime.datetime.utcnow().isoformat() + "Z",
        "session_id": str(session_id),
        "sender": str(sender),
        "receiver": str(receiver),
        "message_hash_hex": str(message_hash_hex),
        "signature_valid": bool(signature_valid),
        "identity_valid": bool(identity_valid),
        "replay_valid": bool(replay_valid),
        "quantum_valid": bool(quantum_valid),
        "decision": str(decision),
        "attack_type": str(attack_type),
    }
