"""
Phase 7 Pauli Eigenstates + Projective Measurement Test Suite.
"""
import math
import numpy as np
from app.quantum import (
    KET_0, KET_1, KET_PLUS, KET_MINUS, KET_PLUS_I, KET_MINUS_I,
    EIGENSTATES, basis_projectors, basis_probabilities, measure_xyz,
    bloch_expectations, state_from_angles, teleportation, apply_attack, fidelity_pure
)
from app.protocol import QDSProtocolModel

def test_pauli_eigenstates_and_projectors():
    print("--- Phase 7 Test 1: Pauli Eigenstates and Projectors P+ / P- ---")
    for axis, Pauli_matrix in [("Z", np.array([[1,0],[0,-1]])), ("X", np.array([[0,1],[1,0]])), ("Y", np.array([[0,-1j],[1j,0]]))]:
        p_plus, p_minus = basis_projectors(axis)
        
        # 1. Verify P+ + P- = I
        np.testing.assert_allclose(p_plus + p_minus, np.eye(2), atol=1e-12)
        
        # 2. Verify P+ and P- are idempotent (P^2 = P) and Hermitian (P^dag = P)
        np.testing.assert_allclose(p_plus @ p_plus, p_plus, atol=1e-12)
        np.testing.assert_allclose(p_minus @ p_minus, p_minus, atol=1e-12)
        np.testing.assert_allclose(p_plus.conj().T, p_plus, atol=1e-12)
        np.testing.assert_allclose(p_minus.conj().T, p_minus, atol=1e-12)
        
        # 3. Verify P+ - P- = sigma
        np.testing.assert_allclose(p_plus - p_minus, Pauli_matrix, atol=1e-12)

    print("Pauli eigenstates & projector properties test PASSED!\n")

def test_born_rule_probabilities_and_sum_to_one():
    print("--- Phase 7 Test 2: Born Rule Probabilities & Normalization ---")
    states_to_test = [
        ("KET_0", KET_0),
        ("KET_1", KET_1),
        ("KET_PLUS", KET_PLUS),
        ("KET_MINUS", KET_MINUS),
        ("KET_PLUS_I", KET_PLUS_I),
        ("KET_MINUS_I", KET_MINUS_I),
        ("Arbitrary State", state_from_angles(1.23, 0.45)),
    ]
    
    for name, st in states_to_test:
        for axis in ("Z", "X", "Y"):
            probs = basis_probabilities(st, axis)
            # Born rule check: P(+) + P(-) == 1.0
            prob_sum = probs["+"] + probs["-"]
            assert math.isclose(prob_sum, 1.0, abs_tol=1e-12), f"Probabilities for {name} on axis {axis} do not sum to 1! Got {prob_sum}"
            assert 0.0 <= probs["+"] <= 1.0, f"P(+) out of bounds: {probs['+']}"
            assert 0.0 <= probs["-"] <= 1.0, f"P(-) out of bounds: {probs['-']}"

    print("Born rule probabilities & normalization test PASSED!\n")

def test_orthogonal_eigenstates_outcomes():
    print("--- Phase 7 Test 3: Orthogonal Eigenstates Produce Opposite Outcomes ---")
    bases = [
        ("Z", KET_0, KET_1),
        ("X", KET_PLUS, KET_MINUS),
        ("Y", KET_PLUS_I, KET_MINUS_I)
    ]
    
    for axis, state_pos, state_neg in bases:
        probs_pos = basis_probabilities(state_pos, axis)
        probs_neg = basis_probabilities(state_neg, axis)
        
        # Positive eigenstate should give 100% P(+) and 0% P(-)
        assert math.isclose(probs_pos["+"], 1.0, abs_tol=1e-12)
        assert math.isclose(probs_pos["-"], 0.0, abs_tol=1e-12)
        
        # Negative eigenstate should give 0% P(+) and 100% P(-)
        assert math.isclose(probs_neg["+"], 0.0, abs_tol=1e-12)
        assert math.isclose(probs_neg["-"], 1.0, abs_tol=1e-12)

    print("Orthogonal eigenstates opposite outcomes test PASSED!\n")

def test_projective_measurements_agree_with_bloch():
    print("--- Phase 7 Test 4: Projective Measurements Agree with Bloch Expectations ---")
    st = state_from_angles(0.785, 1.256)
    bloch = bloch_expectations(st)
    
    for axis in ("X", "Y", "Z"):
        probs = basis_probabilities(st, axis)
        # Quantum expectation <sigma> = P(+) - P(-)
        exp_from_projectors = probs["+"] - probs["-"]
        bloch_exp = bloch[axis]
        assert math.isclose(exp_from_projectors, bloch_exp, abs_tol=1e-10), \
            f"Axis {axis}: Projector exp ({exp_from_projectors}) does not match Bloch exp ({bloch_exp})"

    print("Projective measurements Bloch agreement test PASSED!\n")

def test_legitimate_transmission_and_attack_preservation():
    print("--- Phase 7 Test 5: Legitimate Transmission & Attack Scenario Preservation ---")
    model = QDSProtocolModel()
    
    # 1. Legitimate transmission
    sess, ver, _ = model.execute_protocol("Phase 7 test message", private_key="01"*32, attack_type="none")
    assert ver.decision == "ACCEPT"
    assert ver.signature_valid and ver.identity_valid and ver.replay_valid and ver.quantum_valid
    
    # 2. Channel manipulation attack
    sess, ver, _ = model.execute_protocol("Phase 7 test message", private_key="02"*32, attack_type="channel_manipulation", attack_strength=0.5)
    assert ver.decision == "REJECT"
    assert ver.quantum_valid is False
    
    # 3. Forgery attack
    sess, ver, _ = model.execute_protocol("Phase 7 test message", private_key="03"*32, attack_type="forgery", attack_strength=0.5)
    assert ver.decision == "REJECT"
    assert ver.signature_valid is False

    print("Legitimate transmission & attack scenario preservation test PASSED!\n")

if __name__ == "__main__":
    test_pauli_eigenstates_and_projectors()
    test_born_rule_probabilities_and_sum_to_one()
    test_orthogonal_eigenstates_outcomes()
    test_projective_measurements_agree_with_bloch()
    test_legitimate_transmission_and_attack_preservation()
    print("ALL PHASE 7 PAULI EIGENSTATES & MEASUREMENT TESTS PASSED SUCCESSFULLY!")
