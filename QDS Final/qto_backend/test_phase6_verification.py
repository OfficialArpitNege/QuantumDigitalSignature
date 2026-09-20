"""
Phase 6 QDS Verification Suite.
"""
import secrets
from app.protocol import QDSProtocolModel

def test_phase6_legitimate_message_accept():
    print("--- Phase 6 Test 1: Legitimate Message -> ACCEPT ---")
    model = QDSProtocolModel()
    sess, ver, logs = model.execute_protocol(
        message="Valid QDS Message",
        private_key=secrets.token_hex(32),
        attack_type="none"
    )
    assert ver.decision == "ACCEPT"
    assert ver.signature_valid is True
    assert ver.identity_valid is True
    assert ver.replay_valid is True
    assert ver.quantum_valid is True
    assert "passed" in ver.reason.lower()
    print("Legitimate message ACCEPT test PASSED!\n")

def test_phase6_forged_signature_reject():
    print("--- Phase 6 Test 2: Forged Signature -> REJECT ---")
    model = QDSProtocolModel()
    sess, ver, logs = model.execute_protocol(
        message="Forged Message",
        private_key=secrets.token_hex(32),
        attack_type="forgery",
        attack_strength=0.5
    )
    assert ver.decision == "REJECT"
    assert ver.signature_valid is False
    assert "signature_valid=False" in ver.reason
    print("Forged signature REJECT test PASSED!\n")

def test_phase6_wrong_identity_reject():
    print("--- Phase 6 Test 3: Wrong Identity -> REJECT ---")
    model = QDSProtocolModel()
    sess, ver, logs = model.execute_protocol(
        message="Impersonated Message",
        private_key=secrets.token_hex(32),
        attack_type="impersonation",
        attack_strength=0.5
    )
    assert ver.decision == "REJECT"
    assert ver.identity_valid is False
    assert "identity_valid=False" in ver.reason
    print("Wrong identity REJECT test PASSED!\n")

def test_phase6_replay_reject():
    print("--- Phase 6 Test 4: Replay -> REJECT ---")
    model = QDSProtocolModel()
    nonce = "replay-nonce-9999"
    key = secrets.token_hex(32)
    # First valid run
    model.execute_protocol(message="Msg", private_key=key, nonce=nonce, attack_type="none")
    # Replayed run
    sess, ver, logs = model.execute_protocol(message="Msg", private_key=key, nonce=nonce, attack_type="none")
    assert ver.decision == "REJECT"
    assert ver.replay_valid is False
    assert "replay_valid=False" in ver.reason
    print("Replay REJECT test PASSED!\n")

def test_phase6_quantum_manipulation_reject():
    print("--- Phase 6 Test 5: Quantum Manipulation -> REJECT ---")
    model = QDSProtocolModel()
    sess, ver, logs = model.execute_protocol(
        message="Noise Message",
        private_key=secrets.token_hex(32),
        attack_type="channel_manipulation",
        attack_strength=0.5
    )
    assert ver.decision == "REJECT"
    assert ver.quantum_valid is False
    assert "quantum_valid=False" in ver.reason
    print("Quantum manipulation REJECT test PASSED!\n")

def test_phase6_multiple_failures_reject():
    print("--- Phase 6 Test 6: Multiple Failures -> REJECT ---")
    model = QDSProtocolModel()
    fixed_nonce = "fixed-nonce-multi-fail"
    key = secrets.token_hex(32)
    # First execution to register nonce
    model.execute_protocol(message="First", private_key=key, nonce=fixed_nonce, attack_type="none")
    # Second execution combining replay + forgery
    sess, ver, logs = model.execute_protocol(
        message="First",
        private_key=key,
        nonce=fixed_nonce,
        attack_type="forgery",
        attack_strength=0.5
    )
    assert ver.decision == "REJECT"
    assert ver.signature_valid is False
    assert ver.replay_valid is False
    assert "signature_valid=False" in ver.reason
    assert "replay_valid=False" in ver.reason
    print("Multiple failures REJECT test PASSED!\n")

if __name__ == "__main__":
    test_phase6_legitimate_message_accept()
    test_phase6_forged_signature_reject()
    test_phase6_wrong_identity_reject()
    test_phase6_replay_reject()
    test_phase6_quantum_manipulation_reject()
    test_phase6_multiple_failures_reject()
    print("ALL PHASE 6 VERIFICATION TESTS PASSED SUCCESSFULLY!")
