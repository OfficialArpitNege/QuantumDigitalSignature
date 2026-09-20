"""
Phase 5 Attack Models Validation Tests.
"""
import secrets
from app.protocol import QDSProtocolModel, Alice, Bob, VerificationResult

def test_legitimate_flow():
    print("--- 1. Legitimate Flow Test ---")
    model = QDSProtocolModel()
    sess, ver, logs = model.execute_protocol(
        message="Legitimate message",
        private_key=secrets.token_hex(32),
        attack_type="none"
    )
    print(f"Decision: {ver.decision} | Reason: {ver.reason}")
    assert ver.decision == "ACCEPT", f"Expected ACCEPT, got {ver.decision}"
    assert ver.signature_valid and ver.identity_valid and ver.replay_valid and ver.quantum_valid
    print("Legitimate flow test PASSED!\n")

def test_forgery_attack():
    print("--- 2. Forgery Attack Test ---")
    model = QDSProtocolModel()
    sess, ver, logs = model.execute_protocol(
        message="Legitimate message",
        private_key=secrets.token_hex(32),
        attack_type="forgery",
        attack_strength=0.5
    )
    print(f"Decision: {ver.decision} | signature_valid: {ver.signature_valid} | Reason: {ver.reason}")
    assert ver.decision == "REJECT", f"Expected REJECT, got {ver.decision}"
    assert ver.signature_valid is False, "signature_valid should be False for forgery attack"
    print("Forgery attack test PASSED!\n")

def test_impersonation_attack():
    print("--- 3. Impersonation Attack Test ---")
    model = QDSProtocolModel()
    sess, ver, logs = model.execute_protocol(
        message="Impersonated message",
        private_key=secrets.token_hex(32),
        attack_type="impersonation",
        attack_strength=0.5
    )
    print(f"Decision: {ver.decision} | identity_valid: {ver.identity_valid} | Reason: {ver.reason}")
    assert ver.decision == "REJECT", f"Expected REJECT, got {ver.decision}"
    assert ver.identity_valid is False, "identity_valid should be False for impersonation attack"
    print("Impersonation attack test PASSED!\n")

def test_replay_attack():
    print("--- 4. Replay Attack Test ---")
    model = QDSProtocolModel()
    fixed_nonce = "fixed-session-nonce-12345"
    priv_key = secrets.token_hex(32)
    
    # First execution (Legitimate)
    sess1, ver1, logs1 = model.execute_protocol(
        message="First transmission",
        private_key=priv_key,
        nonce=fixed_nonce,
        attack_type="none"
    )
    print(f"First Execution Decision: {ver1.decision}")
    assert ver1.decision == "ACCEPT", f"First execution expected ACCEPT, got {ver1.decision}"
    
    # Replayed execution (Replay Attack)
    sess2, ver2, logs2 = model.execute_protocol(
        message="First transmission",
        private_key=priv_key,
        nonce=fixed_nonce,
        attack_type="none"
    )
    print(f"Replayed Execution Decision: {ver2.decision} | replay_valid: {ver2.replay_valid} | Reason: {ver2.reason}")
    assert ver2.decision == "REJECT", f"Replayed execution expected REJECT, got {ver2.decision}"
    assert ver2.replay_valid is False, "replay_valid should be False on replayed nonce"
    print("Replay attack test PASSED!\n")

def test_channel_manipulation_attack():
    print("--- 5. Channel Manipulation Attack Test ---")
    model = QDSProtocolModel()
    sess, ver, logs = model.execute_protocol(
        message="Channel noise test",
        private_key=secrets.token_hex(32),
        attack_type="channel_manipulation",
        attack_strength=0.5
    )
    print(f"Decision: {ver.decision} | quantum_valid: {ver.quantum_valid} | Avg Fidelity: {ver.details['average_fidelity']:.4f} | Reason: {ver.reason}")
    assert ver.decision == "REJECT", f"Expected REJECT, got {ver.decision}"
    assert ver.quantum_valid is False, "quantum_valid should be False for channel_manipulation attack"
    print("Channel manipulation attack test PASSED!\n")

def test_unauthorized_verification():
    print("--- 6. Unauthorized Verification Test ---")
    model = QDSProtocolModel()
    sess, ver, logs = model.execute_protocol(
        message="Secret message",
        private_key=secrets.token_hex(32),
        attack_type="unauthorized_verification"
    )
    print(f"Decision: {ver.decision} | identity_valid: {ver.identity_valid} | Reason: {ver.reason}")
    assert ver.decision == "REJECT", f"Expected REJECT, got {ver.decision}"
    assert ver.identity_valid is False, "identity_valid should be False for unauthorized verification"
    print("Unauthorized verification test PASSED!\n")

if __name__ == "__main__":
    test_legitimate_flow()
    test_forgery_attack()
    test_impersonation_attack()
    test_replay_attack()
    test_channel_manipulation_attack()
    test_unauthorized_verification()
    print("ALL PHASE 5 ATTACK TESTS COMPLETED SUCCESSFULLY!")
