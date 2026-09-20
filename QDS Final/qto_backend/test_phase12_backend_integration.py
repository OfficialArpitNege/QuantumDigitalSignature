"""
Phase 12: Backend Integration Test Suite.

Tests the complete end-to-end pipeline for all attack scenarios:
    Alice -> Sign -> Quantum Encode -> Teleport -> Eve/Channel
         -> Bob Measure -> QDS Verify -> Statistical Analysis
         -> Final Decision -> Audit

Tests cover:
1.  No attack         -> ACCEPT
2.  Forgery attack    -> REJECT (signature_valid=False)
3.  Replay attack     -> REJECT (replay_valid=False)
4.  Impersonation     -> REJECT (identity_valid=False)
5.  Channel manipulation -> REJECT (quantum_valid=False)
6.  Unauthorized verification -> REJECT (identity_valid=False)
7.  Result structure completeness for all required fields.
8.  Statistical analysis fields present and numerically sane.
9.  Threat assessment is explanatory and does NOT decide outcome.
10. Audit record is correct and chain integrity is preserved.
11. Existing /api/v1/protocol/execute decisions are backward-compatible.
12. Pipeline version tag is present.
"""
import math
import secrets
import pytest

from app.pipeline import run_full_pipeline
from app.protocol import QDSProtocolModel


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _fresh_model() -> QDSProtocolModel:
    """Returns a pristine QDSProtocolModel (isolated seen_nonces + audit chain)."""
    return QDSProtocolModel()


def _run(model: QDSProtocolModel, attack: str, strength: float = 0.5) -> dict:
    return run_full_pipeline(
        model=model,
        message="Phase 12 integration test message",
        attack_type=attack,
        attack_strength=strength,
        shots=512,
        max_symbols=4,
    )


# ===========================================================================
# 1. No attack -> ACCEPT
# ===========================================================================
def test_phase12_no_attack_accept():
    print("--- Phase 12 Test 1: No attack -> ACCEPT ---")
    result = _run(_fresh_model(), "none", 0.0)
    assert result["verification"]["decision"] == "ACCEPT"
    assert result["verification"]["signature_valid"] is True
    assert result["verification"]["identity_valid"] is True
    assert result["verification"]["replay_valid"] is True
    assert result["verification"]["quantum_valid"] is True
    print("PASSED\n")


# ===========================================================================
# 2. Forgery attack -> REJECT
# ===========================================================================
def test_phase12_forgery_reject():
    print("--- Phase 12 Test 2: Forgery attack -> REJECT ---")
    result = _run(_fresh_model(), "forgery")
    assert result["verification"]["decision"] == "REJECT"
    assert result["verification"]["signature_valid"] is False
    print("PASSED\n")


# ===========================================================================
# 3. Replay attack -> REJECT
# ===========================================================================
def test_phase12_replay_reject():
    print("--- Phase 12 Test 3: Replay attack -> REJECT ---")
    result = _run(_fresh_model(), "replay")
    assert result["verification"]["decision"] == "REJECT"
    assert result["verification"]["replay_valid"] is False
    print("PASSED\n")


# ===========================================================================
# 4. Impersonation attack -> REJECT (identity or quantum fails)
# ===========================================================================
def test_phase12_impersonation_reject():
    print("--- Phase 12 Test 4: Impersonation attack -> REJECT ---")
    result = _run(_fresh_model(), "impersonation")
    assert result["verification"]["decision"] == "REJECT"
    # Either identity or quantum must be invalid
    assert (
        result["verification"]["identity_valid"] is False
        or result["verification"]["quantum_valid"] is False
    )
    print("PASSED\n")


# ===========================================================================
# 5. Channel manipulation -> REJECT (quantum_valid=False)
# ===========================================================================
def test_phase12_channel_manipulation_reject():
    print("--- Phase 12 Test 5: Channel manipulation -> REJECT ---")
    result = _run(_fresh_model(), "channel_manipulation")
    assert result["verification"]["decision"] == "REJECT"
    assert result["verification"]["quantum_valid"] is False
    print("PASSED\n")


# ===========================================================================
# 6. Unauthorized verification -> REJECT
# ===========================================================================
def test_phase12_unauthorized_verification_reject():
    print("--- Phase 12 Test 6: Unauthorized verification -> REJECT ---")
    result = _run(_fresh_model(), "unauthorized_verification")
    assert result["verification"]["decision"] == "REJECT"
    print("PASSED\n")


# ===========================================================================
# 7. Result structure completeness
# ===========================================================================
def test_phase12_result_structure_completeness():
    print("--- Phase 12 Test 7: Result structure completeness ---")
    result = _run(_fresh_model(), "none", 0.0)

    # Top-level keys
    required_top = {
        "pipeline_version", "session", "signature",
        "quantum_transmission", "statistical_analysis", "verification",
        "threat_assessment", "audit", "logs", "execution_time_ms", "disclaimer"
    }
    assert required_top.issubset(result.keys()), (
        f"Missing top-level keys: {required_top - result.keys()}"
    )

    # Session sub-keys
    sess = result["session"]
    for k in ("session_id", "nonce", "sender", "receiver", "has_attacker", "created_at"):
        assert k in sess, f"Missing session key: {k}"

    # Signature sub-keys
    sig = result["signature"]
    for k in ("message", "message_hash_hex", "max_symbols", "attack_type", "attack_strength"):
        assert k in sig, f"Missing signature key: {k}"

    # Quantum transmission sub-keys
    qt = result["quantum_transmission"]
    for k in ("qubits_transmitted", "shots_per_qubit", "average_fidelity",
              "fidelity_threshold", "per_qubit_fidelities"):
        assert k in qt, f"Missing quantum_transmission key: {k}"

    # Statistical analysis sub-keys
    sa = result["statistical_analysis"]
    for k in ("qber_proxy", "average_fidelity", "vector_deviation",
              "total_variation_distance", "jensen_shannon_divergence",
              "standard_error", "confidence_interval_95"):
        assert k in sa, f"Missing statistical_analysis key: {k}"

    # Verification sub-keys
    ver = result["verification"]
    for k in ("decision", "reason", "signature_valid", "identity_valid",
              "replay_valid", "quantum_valid", "details"):
        assert k in ver, f"Missing verification key: {k}"

    # Threat assessment sub-keys
    ta = result["threat_assessment"]
    for k in ("classified_attack", "threat_score", "threat_level", "evidence"):
        assert k in ta, f"Missing threat_assessment key: {k}"

    # Audit sub-keys
    au = result["audit"]
    for k in ("chain_length", "latest_record"):
        assert k in au, f"Missing audit key: {k}"

    print("PASSED\n")


# ===========================================================================
# 8. Statistical metrics are numerically sane
# ===========================================================================
def test_phase12_statistical_metrics_sane():
    print("--- Phase 12 Test 8: Statistical metrics are numerically sane ---")
    result = _run(_fresh_model(), "none", 0.0)
    sa = result["statistical_analysis"]

    assert 0.0 <= sa["qber_proxy"] <= 1.0
    assert 0.0 <= sa["average_fidelity"] <= 1.0
    assert sa["vector_deviation"] >= 0.0
    assert 0.0 <= sa["total_variation_distance"] <= 1.0
    assert 0.0 <= sa["jensen_shannon_divergence"] <= 1.0
    assert sa["standard_error"] >= 0.0
    ci = sa["confidence_interval_95"]
    assert len(ci) == 2
    assert ci[0] <= ci[1]
    assert 0.0 <= ci[0] <= 1.0
    assert 0.0 <= ci[1] <= 1.0

    # Under no attack, fidelity should be high
    assert sa["average_fidelity"] > 0.9, (
        f"Expected high fidelity with no attack, got {sa['average_fidelity']}"
    )
    print("PASSED\n")


# ===========================================================================
# 9. Threat assessment does NOT override the deterministic decision
# ===========================================================================
def test_phase12_threat_assessment_explanatory_only():
    print("--- Phase 12 Test 9: Threat assessment is explanatory only ---")
    model = _fresh_model()
    # Run a legitimate scenario
    result_legit = run_full_pipeline(model, "Legitimate message", "none", 0.0, 512, 4)
    assert result_legit["verification"]["decision"] == "ACCEPT"
    # Threat score may be anything — it does NOT govern the decision
    # (test that decision field is always from verification, not threat)
    assert "decision" not in result_legit["threat_assessment"]

    # Run a forgery scenario
    result_forged = run_full_pipeline(model, "Forged message", "forgery", 0.5, 512, 4)
    assert result_forged["verification"]["decision"] == "REJECT"
    assert "decision" not in result_forged["threat_assessment"]
    print("PASSED\n")


# ===========================================================================
# 10. Audit record is correct and chain remains valid
# ===========================================================================
def test_phase12_audit_integrity():
    print("--- Phase 12 Test 10: Audit record correctness and chain integrity ---")
    model = _fresh_model()
    attacks = ["none", "forgery", "replay", "impersonation", "channel_manipulation"]

    for i, attack in enumerate(attacks):
        run_full_pipeline(model, f"Audit test message {i}", attack, 0.5, 512, 4)

    assert model.audit_chain.chain_length() == len(attacks)

    # Every record should have all required fields
    for rec in model.audit_chain.get_records():
        ed = rec["event_data"]
        for field in ("session_id", "sender", "receiver", "message_hash_hex",
                       "signature_valid", "identity_valid", "replay_valid",
                       "quantum_valid", "decision", "attack_type"):
            assert field in ed, f"Audit event missing field: {field}"

    # Chain integrity must pass
    valid, errors = model.audit_chain.verify()
    assert valid is True, f"Audit chain invalid: {errors}"
    print("PASSED\n")


# ===========================================================================
# 11. Audit record decision matches verification decision
# ===========================================================================
def test_phase12_audit_matches_verification():
    print("--- Phase 12 Test 11: Audit decision matches verification decision ---")
    model = _fresh_model()
    scenarios = [
        ("none",                 "ACCEPT"),
        ("forgery",              "REJECT"),
        ("replay",               "REJECT"),
        ("channel_manipulation", "REJECT"),
    ]
    for i, (attack, expected) in enumerate(scenarios):
        result = run_full_pipeline(model, f"msg-{i}", attack, 0.5, 512, 4)
        ver_decision = result["verification"]["decision"]
        audit_decision = result["audit"]["latest_record"]["event_data"]["decision"]
        assert ver_decision == expected, f"{attack}: verification decision mismatch"
        assert audit_decision == ver_decision, (
            f"{attack}: audit decision ({audit_decision}) != verification decision ({ver_decision})"
        )
    print("PASSED\n")


# ===========================================================================
# 12. Pipeline version tag is present
# ===========================================================================
def test_phase12_pipeline_version():
    print("--- Phase 12 Test 12: Pipeline version tag is present ---")
    result = _run(_fresh_model(), "none", 0.0)
    assert "pipeline_version" in result
    assert result["pipeline_version"] == "12.0"
    print("PASSED\n")


# ===========================================================================
# 13. Session metadata is correctly populated
# ===========================================================================
def test_phase12_session_metadata():
    print("--- Phase 12 Test 13: Session metadata is correctly populated ---")
    result = _run(_fresh_model(), "none", 0.0)
    sess = result["session"]
    assert sess["sender"] == "Alice"
    assert sess["receiver"] == "Bob"
    assert sess["has_attacker"] is False  # No attacker in legitimate transmission
    assert len(sess["session_id"]) > 0
    assert len(sess["nonce"]) > 0

    # For impersonation, Eve is the effective sender and active=True
    result_impersonation = _run(_fresh_model(), "impersonation", 0.5)
    assert result_impersonation["session"]["sender"] == "Eve"

    print("PASSED\n")


# ===========================================================================
# 14. Execution time is measured and reported
# ===========================================================================
def test_phase12_execution_time():
    print("--- Phase 12 Test 14: Execution time is measured ---")
    result = _run(_fresh_model(), "none", 0.0)
    assert "execution_time_ms" in result
    assert isinstance(result["execution_time_ms"], float)
    assert result["execution_time_ms"] >= 0.0
    print("PASSED\n")


# ===========================================================================
# 15. Phase 0-11 decisions preserved (full regression)
# ===========================================================================
def test_phase12_full_regression():
    print("--- Phase 12 Test 15: Full regression (Phases 0-11 decisions preserved) ---")
    model = _fresh_model()
    expectations = [
        ("none",                 "ACCEPT"),
        ("forgery",              "REJECT"),
        ("replay",               "REJECT"),
        ("impersonation",        "REJECT"),
        ("channel_manipulation", "REJECT"),
    ]
    for attack, expected in expectations:
        result = run_full_pipeline(model, "Regression test msg", attack, 0.5, 512, 4)
        assert result["verification"]["decision"] == expected, (
            f"Regression failed: attack={attack}, expected={expected}, "
            f"got={result['verification']['decision']}"
        )

    # Final audit chain integrity check
    valid, errors = model.audit_chain.verify()
    assert valid is True, f"Audit chain invalid after full regression: {errors}"
    print("PASSED\n")


if __name__ == "__main__":
    test_phase12_no_attack_accept()
    test_phase12_forgery_reject()
    test_phase12_replay_reject()
    test_phase12_impersonation_reject()
    test_phase12_channel_manipulation_reject()
    test_phase12_unauthorized_verification_reject()
    test_phase12_result_structure_completeness()
    test_phase12_statistical_metrics_sane()
    test_phase12_threat_assessment_explanatory_only()
    test_phase12_audit_integrity()
    test_phase12_audit_matches_verification()
    test_phase12_pipeline_version()
    test_phase12_session_metadata()
    test_phase12_execution_time()
    test_phase12_full_regression()
    print("ALL PHASE 12 BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY!")
