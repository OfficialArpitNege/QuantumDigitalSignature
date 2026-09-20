"""
Phase 9 Deterministic Decision Validation Test Suite.
"""
from app.protocol import evaluate_verification, VerificationResult, QDSProtocolModel
from app.detector import detect

def test_phase9_all_valid_accept():
    print("--- Phase 9 Test 1: All Checks Valid -> ACCEPT ---")
    res = evaluate_verification(
        signature_valid=True,
        identity_valid=True,
        replay_valid=True,
        quantum_valid=True
    )
    assert res.decision == "ACCEPT"
    assert "passed" in res.reason.lower()
    print("All valid ACCEPT test PASSED!\n")

def test_phase9_individual_check_failures_reject():
    print("--- Phase 9 Test 2: Each Individual Check Failure -> REJECT ---")
    
    # 1. Signature failure
    r1 = evaluate_verification(signature_valid=False, identity_valid=True, replay_valid=True, quantum_valid=True)
    assert r1.decision == "REJECT"
    assert "signature_valid=False" in r1.reason
    
    # 2. Identity failure
    r2 = evaluate_verification(signature_valid=True, identity_valid=False, replay_valid=True, quantum_valid=True)
    assert r2.decision == "REJECT"
    assert "identity_valid=False" in r2.reason
    
    # 3. Replay failure
    r3 = evaluate_verification(signature_valid=True, identity_valid=True, replay_valid=False, quantum_valid=True)
    assert r3.decision == "REJECT"
    assert "replay_valid=False" in r3.reason
    
    # 4. Quantum failure
    r4 = evaluate_verification(signature_valid=True, identity_valid=True, replay_valid=True, quantum_valid=False)
    assert r4.decision == "REJECT"
    assert "quantum_valid=False" in r4.reason

    print("Individual check failure REJECT test PASSED!\n")

def test_phase9_multiple_failures_reject():
    print("--- Phase 9 Test 3: Multiple Simultaneous Check Failures -> REJECT ---")
    res = evaluate_verification(
        signature_valid=False,
        identity_valid=True,
        replay_valid=False,
        quantum_valid=False
    )
    assert res.decision == "REJECT"
    assert "signature_valid=False" in res.reason
    assert "replay_valid=False" in res.reason
    assert "quantum_valid=False" in res.reason
    print("Multiple failures REJECT test PASSED!\n")

def test_phase9_threat_score_isolation_from_decision():
    print("--- Phase 9 Test 4: Threat Score Changes Do NOT Alter Deterministic Decision ---")
    # Case A: Low threat score, but protocol check fails -> MUST BE REJECT
    det_low = detect(expected={"X":0,"Y":0,"Z":1}, observed={"X":0,"Y":0,"Z":1}) # score = 0
    res_reject = evaluate_verification(signature_valid=False, identity_valid=True, replay_valid=True, quantum_valid=True)
    assert det_low["threat_score"] == 0.0
    assert res_reject.decision == "REJECT"
    
    # Case B: High threat score (e.g. anomaly detected), but all 4 protocol checks pass -> MUST BE ACCEPT
    det_high = detect(
        expected={"X": 1, "Y": 1, "Z": 0},
        observed={"X": 0, "Y": 0, "Z": 1},
        expected_probs={"+": 1.0, "-": 0.0},
        observed_probs={"+": 0.0, "-": 1.0},
        fidelity=0.1
    ) # high score
    res_accept = evaluate_verification(signature_valid=True, identity_valid=True, replay_valid=True, quantum_valid=True)
    assert det_high["threat_score"] > 20.0
    assert res_accept.decision == "ACCEPT"

    print("Threat score isolation from deterministic decision test PASSED!\n")

if __name__ == "__main__":
    test_phase9_all_valid_accept()
    test_phase9_individual_check_failures_reject()
    test_phase9_multiple_failures_reject()
    test_phase9_threat_score_isolation_from_decision()
    print("ALL PHASE 9 DETERMINISTIC DECISION TESTS PASSED SUCCESSFULLY!")
