"""
Phase 11: Tamper-Evident Audit Test Suite.

Tests cover:
1. Valid chain passes integrity verification.
2. Modified event data is detected.
3. Modified hash is detected.
4. Reordered records are detected.
5. Deleted record is detected.
6. Existing protocol decisions (Phases 0-10) remain unchanged.
7. Audit chain grows correctly with successive protocol executions.
8. Empty chain is trivially valid.
9. build_protocol_audit_event produces deterministic canonical output.
10. Audit endpoint does NOT influence ACCEPT/REJECT.
"""
import copy
import secrets
import pytest

from app.audit import (
    AuditChain,
    AuditRecord,
    GENESIS_HASH,
    build_protocol_audit_event,
    _compute_hash,
    _canonical_json,
)
from app.protocol import QDSProtocolModel


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_chain(n: int) -> AuditChain:
    """Returns an AuditChain with n legitimate records."""
    chain = AuditChain()
    for i in range(n):
        chain.record_event({"msg": f"event-{i}", "index": i})
    return chain


def _run_protocol(model: QDSProtocolModel, attack_type: str = "none") -> tuple:
    return model.execute_protocol(
        message="Phase 11 audit test message",
        private_key=secrets.token_hex(32),
        attack_type=attack_type,
        attack_strength=0.5,
        shots=512,
        max_symbols=4,
    )


# ===========================================================================
# 1. Empty chain is trivially valid
# ===========================================================================
def test_phase11_empty_chain_is_valid():
    print("--- Phase 11 Test 1: Empty chain is trivially valid ---")
    chain = AuditChain()
    valid, errors = chain.verify()
    assert valid is True
    assert errors == []
    assert chain.chain_length() == 0
    print("PASSED\n")


# ===========================================================================
# 2. Valid chain passes verification
# ===========================================================================
def test_phase11_valid_chain_passes():
    print("--- Phase 11 Test 2: Valid chain passes integrity verification ---")
    chain = _make_chain(5)
    assert chain.chain_length() == 5
    valid, errors = chain.verify()
    assert valid is True, f"Expected valid chain, got errors: {errors}"
    assert errors == []
    print("PASSED\n")


# ===========================================================================
# 3. First record links to GENESIS_HASH
# ===========================================================================
def test_phase11_first_record_genesis():
    print("--- Phase 11 Test 3: First record links to GENESIS_HASH ---")
    chain = _make_chain(3)
    first = chain.get_record(0)
    assert first is not None
    assert first.previous_hash == GENESIS_HASH
    assert first.sequence == 0
    print("PASSED\n")


# ===========================================================================
# 4. Modified event_data is detected
# ===========================================================================
def test_phase11_modified_event_detected():
    print("--- Phase 11 Test 4: Modified event_data is detected ---")
    chain = _make_chain(4)

    # Tamper with record 2's event_data (simulates data alteration)
    chain._records[2].event_data["msg"] = "TAMPERED"

    valid, errors = chain.verify()
    assert valid is False, "Expected tampered chain to fail verification"
    assert any("2" in e for e in errors), f"Expected error mentioning record 2, got: {errors}"
    print("PASSED\n")


# ===========================================================================
# 5. Modified current_hash is detected
# ===========================================================================
def test_phase11_modified_current_hash_detected():
    print("--- Phase 11 Test 5: Modified current_hash is detected ---")
    chain = _make_chain(4)

    # Tamper with the current_hash of record 1 (simulates hash forgery)
    chain._records[1].current_hash = "a" * 64

    valid, errors = chain.verify()
    assert valid is False
    # Record 1's hash will fail recomputation, AND record 2's previous_hash link will break
    assert len(errors) >= 1
    print("PASSED\n")


# ===========================================================================
# 6. Reordered records are detected
# ===========================================================================
def test_phase11_reordered_records_detected():
    print("--- Phase 11 Test 6: Reordered records are detected ---")
    chain = _make_chain(4)

    # Swap records 1 and 2 (simulates reordering attack)
    chain._records[1], chain._records[2] = chain._records[2], chain._records[1]

    valid, errors = chain.verify()
    assert valid is False, "Expected reordered chain to fail"
    assert len(errors) >= 1
    print("PASSED\n")


# ===========================================================================
# 7. Deleted record is detected
# ===========================================================================
def test_phase11_deleted_record_detected():
    print("--- Phase 11 Test 7: Deleted record is detected ---")
    chain = _make_chain(5)

    # Remove record at index 2 (simulates deletion)
    del chain._records[2]

    valid, errors = chain.verify()
    assert valid is False, "Expected chain with deleted record to fail"
    assert len(errors) >= 1
    print("PASSED\n")


# ===========================================================================
# 8. Canonical JSON is deterministic
# ===========================================================================
def test_phase11_canonical_json_deterministic():
    print("--- Phase 11 Test 8: Canonical JSON is deterministic ---")
    event = {"z": 3, "a": 1, "m": 2, "flag": True, "nested": {"b": 2, "a": 1}}
    # Multiple calls must produce identical output
    assert _canonical_json(event) == _canonical_json(event)
    # Key order must be sorted
    s = _canonical_json(event)
    assert s.index('"a"') < s.index('"m"') < s.index('"z"')
    print("PASSED\n")


# ===========================================================================
# 9. build_protocol_audit_event is deterministic and contains expected fields
# ===========================================================================
def test_phase11_build_protocol_audit_event():
    print("--- Phase 11 Test 9: build_protocol_audit_event produces correct fields ---")
    event = build_protocol_audit_event(
        session_id="sess-001",
        sender="Alice",
        receiver="Bob",
        message_hash_hex="abc123",
        signature_valid=True,
        identity_valid=True,
        replay_valid=True,
        quantum_valid=True,
        decision="ACCEPT",
        attack_type="none",
        timestamp="2026-01-01T00:00:00Z",  # fixed for determinism
    )
    assert event["session_id"] == "sess-001"
    assert event["sender"] == "Alice"
    assert event["receiver"] == "Bob"
    assert event["message_hash_hex"] == "abc123"
    assert event["signature_valid"] is True
    assert event["identity_valid"] is True
    assert event["replay_valid"] is True
    assert event["quantum_valid"] is True
    assert event["decision"] == "ACCEPT"
    assert event["attack_type"] == "none"
    assert event["audit_schema_version"] == "1.0"
    assert event["timestamp"] == "2026-01-01T00:00:00Z"

    # Same inputs must produce identical dict
    event2 = build_protocol_audit_event(
        session_id="sess-001", sender="Alice", receiver="Bob",
        message_hash_hex="abc123", signature_valid=True, identity_valid=True,
        replay_valid=True, quantum_valid=True, decision="ACCEPT",
        attack_type="none", timestamp="2026-01-01T00:00:00Z",
    )
    assert event == event2
    print("PASSED\n")


# ===========================================================================
# 10. Protocol: audit chain grows, decisions are UNAFFECTED
# ===========================================================================
def test_phase11_protocol_audit_integration():
    print("--- Phase 11 Test 10: Protocol audit integration & decision isolation ---")
    model = QDSProtocolModel()

    # Legitimate transmission
    sess, ver, logs = _run_protocol(model, "none")
    assert ver.decision == "ACCEPT"
    assert model.audit_chain.chain_length() == 1

    # Attack — decision must be REJECT regardless of audit
    sess2, ver2, logs2 = _run_protocol(model, "forgery")
    assert ver2.decision == "REJECT"
    assert model.audit_chain.chain_length() == 2

    # Chain must still be valid
    valid, errors = model.audit_chain.verify()
    assert valid is True, f"Chain should be valid after protocol runs: {errors}"

    # Last log step should be the audit record step
    last_log = logs[-1]
    assert "Audit" in last_log.step_name or "audit" in last_log.description.lower()
    print("PASSED\n")


# ===========================================================================
# 11. Audit records capture correct verification data
# ===========================================================================
def test_phase11_audit_records_contain_correct_data():
    print("--- Phase 11 Test 11: Audit records contain correct verification data ---")
    model = QDSProtocolModel()

    # Legitimate
    sess, ver, _ = _run_protocol(model, "none")
    record_legit = model.audit_chain.get_records()[0]
    assert record_legit["event_data"]["decision"] == "ACCEPT"
    assert record_legit["event_data"]["attack_type"] == "none"
    assert record_legit["event_data"]["signature_valid"] is True
    assert record_legit["event_data"]["identity_valid"] is True
    assert record_legit["event_data"]["replay_valid"] is True
    assert record_legit["event_data"]["quantum_valid"] is True

    # Replay attack
    sess2, ver2, _ = _run_protocol(model, "replay")
    record_replay = model.audit_chain.get_records()[1]
    assert record_replay["event_data"]["decision"] == "REJECT"
    assert record_replay["event_data"]["attack_type"] == "replay"
    assert record_replay["event_data"]["replay_valid"] is False
    print("PASSED\n")


# ===========================================================================
# 12. Audit does NOT change prior phase decisions (regression)
# ===========================================================================
def test_phase11_prior_phases_preserved():
    print("--- Phase 11 Test 12: Prior phase decisions are unchanged (regression) ---")
    model = QDSProtocolModel()
    attack_expectations = [
        ("none",                 "ACCEPT"),
        ("forgery",              "REJECT"),
        ("replay",               "REJECT"),
        ("impersonation",        "REJECT"),
        ("channel_manipulation", "REJECT"),
    ]
    for attack, expected_decision in attack_expectations:
        _, ver, _ = _run_protocol(model, attack)
        assert ver.decision == expected_decision, (
            f"Attack '{attack}': expected {expected_decision}, got {ver.decision}"
        )

    # Chain must be valid after all executions
    valid, errors = model.audit_chain.verify()
    assert valid is True, f"Chain invalid after regression suite: {errors}"
    assert model.audit_chain.chain_length() == len(attack_expectations)
    print("PASSED\n")


if __name__ == "__main__":
    test_phase11_empty_chain_is_valid()
    test_phase11_valid_chain_passes()
    test_phase11_first_record_genesis()
    test_phase11_modified_event_detected()
    test_phase11_modified_current_hash_detected()
    test_phase11_reordered_records_detected()
    test_phase11_deleted_record_detected()
    test_phase11_canonical_json_deterministic()
    test_phase11_build_protocol_audit_event()
    test_phase11_protocol_audit_integration()
    test_phase11_audit_records_contain_correct_data()
    test_phase11_prior_phases_preserved()
    print("ALL PHASE 11 TAMPER-EVIDENT AUDIT TESTS PASSED SUCCESSFULLY!")
