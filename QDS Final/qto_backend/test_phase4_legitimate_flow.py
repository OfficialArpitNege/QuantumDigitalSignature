"""
Phase 4 Legitimate Alice -> Bob Protocol Flow Validation Tests.
"""
import secrets
from app.protocol import QDSProtocolModel, Alice, Bob, VerificationResult
from app.main import app

def test_phase4_legitimate_alice_bob_flow():
    print("--- Phase 4 Test 1: Legitimate Alice -> Bob Flow ---")
    alice = Alice(name="Alice", identity="alice-valid-key")
    bob = Bob(name="Bob", identity="bob-valid-key")
    
    model = QDSProtocolModel(alice=alice, bob=bob)
    session, verification, logs = model.execute_protocol(
        message="Quantum Digital Signature Verification",
        private_key=secrets.token_hex(32),
        attack_type="none",
        shots=1024,
        max_symbols=8
    )
    
    # 1. Verify final decision is ACCEPT
    print(f"Final Decision: {verification.decision}")
    print(f"Reason: {verification.reason}")
    assert verification.decision == "ACCEPT", f"Expected ACCEPT but got {verification.decision}"
    assert verification.signature_valid, "signature_valid should be True"
    assert verification.identity_valid, "identity_valid should be True"
    assert verification.replay_valid, "replay_valid should be True"
    assert verification.quantum_valid, "quantum_valid should be True"
    
    # 2. Verify all teleportation fidelities
    fidelities = verification.details["fidelities"]
    print(f"Teleportation Fidelities across {len(fidelities)} qubits: {fidelities}")
    assert all(f >= 0.99 for f in fidelities), "All qubit fidelities must be >= 0.99"
    
    # 3. Verify session summary
    summary = session.get_summary()
    assert summary["sender"] == "Alice"
    assert summary["receiver"] == "Bob"
    assert summary["has_attacker"] is False
    assert summary["verification_decision"] == "ACCEPT"
    
    print("Legitimate Alice -> Bob Flow Test PASSED successfully!\n")

def test_backend_import_and_app():
    print("--- Phase 4 Test 2: Backend App Endpoint Integration ---")
    assert app.title == "Quantum Threat Observatory Backend"
    print("Backend FastAPI app loaded successfully!\n")

if __name__ == "__main__":
    test_phase4_legitimate_alice_bob_flow()
    test_backend_import_and_app()
    print("ALL PHASE 4 VALIDATION TESTS COMPLETED SUCCESSFULLY!")
