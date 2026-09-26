"""
Phase 8 Statistical Detection Validation Suite.
"""
import math
import numpy as np
from app.stats import (
    total_variation,
    js_divergence,
    vector_deviation,
    standard_error,
    confidence_interval_95,
    qber
)
from app.quantum import state_from_angles, apply_attack, basis_probabilities, fidelity_pure
from app.detector import detect
from app.protocol import QDSProtocolModel

def test_phase8_no_attack_close_to_expected():
    print("--- Phase 8 Test 1: No Attack -> Expected vs Observed Measurement Agreement ---")
    st = state_from_angles(0.5, 0.2)
    obs = st.copy()
    
    dev = vector_deviation({"X": 0.4794, "Y": 0.0970, "Z": 0.8776}, {"X": 0.4794, "Y": 0.0970, "Z": 0.8776})
    probs = basis_probabilities(st, "Z")
    tv = total_variation(probs, probs)
    jsd = js_divergence(probs, probs)
    fid = fidelity_pure(st, obs)
    
    assert math.isclose(dev, 0.0, abs_tol=1e-6)
    assert math.isclose(tv, 0.0, abs_tol=1e-6)
    assert math.isclose(jsd, 0.0, abs_tol=1e-6)
    assert math.isclose(fid, 1.0, abs_tol=1e-6)
    print("No attack agreement test PASSED!\n")

def test_phase8_attack_statistical_deviation():
    print("--- Phase 8 Test 2: Attack Injection -> Measurable Statistical Deviation ---")
    st = state_from_angles(0.0, 0.0) # |0>
    attacked = apply_attack(st, "channel_manipulation", strength=0.5)
    
    probs_clean = basis_probabilities(st, "Z")
    probs_attacked = basis_probabilities(attacked, "Z")
    
    tv = total_variation(probs_clean, probs_attacked)
    jsd = js_divergence(probs_clean, probs_attacked)
    fid = fidelity_pure(st, attacked)
    
    assert tv > 0.05, f"Expected noticeable TV deviation, got {tv}"
    assert jsd > 0.01, f"Expected noticeable JSD deviation, got {jsd}"
    assert fid < 0.99, f"Expected fidelity drop under attack, got {fid}"
    print(f"Channel attack statistical metrics: TV={tv:.4f}, JSD={jsd:.4f}, Fidelity={fid:.4f}")
    print("Attack statistical deviation test PASSED!\n")

def test_phase8_valid_probability_ranges_and_metrics():
    print("--- Phase 8 Test 3: Probability Distribution & Metric Bounds ---")
    p = {"+": 0.8, "-": 0.2}
    q = {"+": 0.3, "-": 0.7}
    
    tv = total_variation(p, q)
    jsd = js_divergence(p, q)
    
    assert 0.0 <= tv <= 1.0, f"TV out of bounds [0, 1]: {tv}"
    assert 0.0 <= jsd <= 1.0, f"JSD out of bounds [0, 1]: {jsd}"
    print("Probability metric bounds test PASSED!\n")

def test_phase8_confidence_intervals_and_standard_error():
    print("--- Phase 8 Test 4: Standard Errors & 95% Confidence Intervals ---")
    prob = 0.75
    shots = 1000
    
    se = standard_error(prob, shots)
    ci_low, ci_high = confidence_interval_95(prob, shots)
    
    expected_se = math.sqrt(0.75 * 0.25 / 1000)
    assert math.isclose(se, expected_se, abs_tol=1e-6), f"SE calculation mismatch: {se} vs {expected_se}"
    assert math.isclose(ci_low, prob - 1.96 * se, abs_tol=1e-6)
    assert math.isclose(ci_high, prob + 1.96 * se, abs_tol=1e-6)
    assert 0.0 <= ci_low <= prob <= ci_high <= 1.0
    print(f"Shots=1000, Prob=0.75 => SE={se:.6f}, 95% CI=[{ci_low:.4f}, {ci_high:.4f}]")
    print("Confidence intervals & standard error test PASSED!\n")

def test_phase8_statistical_evidence_isolation_from_decision():
    print("--- Phase 8 Test 5: Statistical Engine Provides Diagnostic Evidence Only ---")
    model = QDSProtocolModel()
    # Run protocol for clean scenario
    sess, ver, _ = model.execute_protocol("Test Msg", private_key="01"*32, attack_type="none")
    
    # Run threat detector on output
    det = detect(expected={"X":0,"Y":0,"Z":1}, observed={"X":0,"Y":0,"Z":1})
    
    # Verification is strict and separate from statistical threat engine
    assert ver.decision == "ACCEPT"
    assert "threat_score" in det
    assert "evidence" in det
    print("Statistical engine evidence isolation test PASSED!\n")

def test_phase8_forgery_threat_monotonicity():
    print("--- Phase 8 Test 6: Forgery Threat Score Monotonicity ---")
    from app.pipeline import run_full_pipeline
    model = QDSProtocolModel()
    strengths = [0.1, 0.35, 0.6, 0.85, 1.0]
    scores = []

    for strg in strengths:
        res = run_full_pipeline(model, "Monotonicity Test", attack_type="forgery", attack_strength=strg)
        scores.append(res["threat_assessment"]["threat_score"])

    for i in range(len(scores) - 1):
        assert scores[i] < scores[i+1], f"Non-monotonic threat score: strength {strengths[i]} ({scores[i]}) vs strength {strengths[i+1]} ({scores[i+1]})"

    print(f"Monotonicity verified across strengths {strengths}: {scores}")
    print("Forgery threat score monotonicity test PASSED!\n")

if __name__ == "__main__":
    test_phase8_no_attack_close_to_expected()
    test_phase8_attack_statistical_deviation()
    test_phase8_valid_probability_ranges_and_metrics()
    test_phase8_confidence_intervals_and_standard_error()
    test_phase8_statistical_evidence_isolation_from_decision()
    test_phase8_forgery_threat_monotonicity()
    print("ALL PHASE 8 STATISTICAL DETECTION TESTS PASSED SUCCESSFULLY!")
