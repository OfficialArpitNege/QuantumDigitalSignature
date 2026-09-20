"""
Phase 3 Quantum Layer Validation Tests.
"""
import math
import numpy as np
from app.quantum import (
    state_from_angles,
    teleportation,
    bloch_expectations,
    basis_probabilities,
    apply_attack,
    fidelity_pure
)

def test_1_no_attack_teleportation():
    print("--- Test 1: No-Attack Teleportation Fidelity ---")
    test_cases = [
        ("|0>", 0.0, 0.0),
        ("|1>", math.pi, 0.0),
        ("|+>", math.pi / 2, 0.0),
        ("|->", math.pi / 2, math.pi),
        ("Arbitrary", 1.23, 0.45)
    ]
    
    all_passed = True
    fidelities = []
    for name, theta, phi in test_cases:
        tele = teleportation(theta, phi)
        fid = tele["fidelity"]
        fidelities.append((name, fid))
        passed = math.isclose(fid, 1.0, abs_tol=1e-6)
        if not passed:
            all_passed = False
        print(f"State {name:10s} | Bell outcome: {tele['bell_measurement']} | Fidelity: {fid:.6f} | Passed: {passed}")
    
    assert all_passed, "No-attack teleportation fidelity test failed!"
    print("Test 1 PASSED successfully!\n")
    return fidelities

def test_2_measurement_bloch_agreement():
    print("--- Test 2: Projective Measurement vs Bloch Expectation Agreement ---")
    state = state_from_angles(1.23, 0.45)
    bloch = bloch_expectations(state)
    
    all_passed = True
    for axis in ("X", "Y", "Z"):
        probs = basis_probabilities(state, axis)
        exp_from_probs = probs["+"] - probs["-"]
        bloch_exp = bloch[axis]
        passed = math.isclose(exp_from_probs, bloch_exp, abs_tol=1e-6)
        if not passed:
            all_passed = False
        print(f"Axis {axis} | Bloch Exp: {bloch_exp:+.6f} | Probs Exp: {exp_from_probs:+.6f} | Passed: {passed}")
        
    assert all_passed, "Measurement Bloch agreement test failed!"
    print("Test 2 PASSED successfully!\n")

def test_3_attack_impact():
    print("--- Test 3: Quantum Attack State Perturbation ---")
    base_state = state_from_angles(math.pi / 2, 0.0) # |+> state
    
    attacks = ["forgery", "channel_manipulation", "impersonation"]
    all_passed = True
    for attack in attacks:
        attacked = apply_attack(base_state, attack, strength=0.5)
        fid = fidelity_pure(base_state, attacked)
        diff_detected = fid < 0.99
        if not diff_detected:
            all_passed = False
        print(f"Attack {attack:20s} (strength=0.5) | Fidelity: {fid:.6f} | State Perturbed: {diff_detected}")
        
    assert all_passed, "Attack impact test failed!"
    print("Test 3 PASSED successfully!\n")

if __name__ == "__main__":
    test_1_no_attack_teleportation()
    test_2_measurement_bloch_agreement()
    test_3_attack_impact()
    print("ALL PHASE 3 VALIDATION TESTS COMPLETED SUCCESSFULLY!")
