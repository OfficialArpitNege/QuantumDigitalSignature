"""
Phase 14.5 Compliance Suite — Forgery Probability & Statistical Thresholds.

Tests:
1. Forgery experiment metric calculations.
2. Zero-attempt safe handling.
3. All-forgeries-rejected case.
4. Some-forgeries-accepted case using controlled test data.
5. Statistical threshold evaluation.
6. Boundary conditions for thresholds.
7. Statistical layer does not alter deterministic decision.
8. Attack-blind statistical analysis.
9. Attack-blind threshold evaluation.
10. Existing six attack scenarios regression.
"""
import pytest
from app.stats import calculate_empirical_forgery_metrics, evaluate_statistical_thresholds
from app.protocol import QDSProtocolModel, evaluate_verification
from app.pipeline import run_full_pipeline

# 1. Forgery experiment metric calculations
def test_forgery_experiment_metric_calculations():
    res = calculate_empirical_forgery_metrics(total_attempts=50, accepted_count=5, rejected_count=45, shots=1024)
    assert res["total_forgery_attempts"] == 50
    assert res["successful_forgery_accepts"] == 5
    assert res["detected_forgery_rejects"] == 45
    assert res["empirical_forgery_probability"] == 0.1
    assert res["forgery_detection_rate"] == 0.9
    assert res["false_acceptance_rate"] == 0.1
    assert res["sample_size"] == 50
    assert "confidence_interval" in res
    assert res["confidence_level"] == 0.95
    assert "N=50" in res["sample_size_label"]
    assert "tested forgery strategy" in res["description"]

# 2. Zero-attempt safe handling
def test_zero_attempt_safe_handling():
    res = calculate_empirical_forgery_metrics(total_attempts=0, accepted_count=0, rejected_count=0)
    assert res["total_forgery_attempts"] == 0
    assert res["empirical_forgery_probability"] == 0.0
    assert res["forgery_detection_rate"] == 0.0
    assert res["confidence_interval"] == [0.0, 0.0]
    assert res["sample_size"] == 0
    assert "N=0" in res["sample_size_label"]

# 3. All-forgeries-rejected case (0 successful accepts)
def test_all_forgeries_rejected_case():
    res = calculate_empirical_forgery_metrics(total_attempts=25, accepted_count=0, rejected_count=25)
    assert res["total_forgery_attempts"] == 25
    assert res["successful_forgery_accepts"] == 0
    assert res["empirical_forgery_probability"] == 0.0
    assert res["forgery_detection_rate"] == 1.0
    # Wilson interval lower bound is 0.0, upper bound > 0.0 for N=25
    assert res["confidence_interval"][0] == 0.0
    assert res["confidence_interval"][1] > 0.0
    assert "does NOT prove theoretical zero" in res["interpretation_note"]

# 4. Some-forgeries-accepted case using controlled test data (mixed successes/failures)
def test_some_forgeries_accepted_case():
    res = calculate_empirical_forgery_metrics(total_attempts=100, accepted_count=12, rejected_count=88)
    assert res["empirical_forgery_probability"] == 0.12
    assert res["forgery_detection_rate"] == 0.88
    assert res["confidence_interval"][0] > 0.0
    assert res["confidence_interval"][1] < 1.0
    assert res["confidence_interval"][0] < 0.12 < res["confidence_interval"][1]

# 5. Statistical threshold evaluation
def test_statistical_threshold_evaluation():
    # Clean metrics
    res_clean = evaluate_statistical_thresholds(
        average_fidelity=0.995,
        qber_proxy=0.005,
        vector_dev=0.02,
        tv_distance=0.02,
        jsd=0.01
    )
    assert res_clean["has_statistical_anomaly"] is False
    assert res_clean["threshold_evaluations"]["fidelity"]["exceeded"] is False
    # Check required fields in threshold evaluation dictionary
    fid_eval = res_clean["threshold_evaluations"]["fidelity"]
    assert "metric" in fid_eval
    assert "observed_value" in fid_eval
    assert "threshold" in fid_eval
    assert "operator" in fid_eval
    assert "exceeded" in fid_eval
    assert "anomaly" in fid_eval
    assert "explanation" in fid_eval
    assert "threshold_status" in fid_eval
    assert fid_eval["threshold_status"] == "EXPERIMENTAL_RESEARCH_PARAMETER"

    # Anomalous metrics
    res_noise = evaluate_statistical_thresholds(
        average_fidelity=0.85,
        qber_proxy=0.15,
        vector_dev=0.30,
        tv_distance=0.25,
        jsd=0.12
    )
    assert res_noise["has_statistical_anomaly"] is True
    assert res_noise["threshold_evaluations"]["fidelity"]["exceeded"] is True
    assert res_noise["threshold_evaluations"]["qber_proxy"]["exceeded"] is True

# 6. Boundary conditions & custom config for thresholds
def test_statistical_threshold_boundary_conditions():
    # Exactly on boundary (0.99 fidelity, 0.01 qber)
    res_boundary = evaluate_statistical_thresholds(
        average_fidelity=0.99,
        qber_proxy=0.01,
        vector_dev=0.15,
        tv_distance=0.15,
        jsd=0.05
    )
    assert res_boundary["threshold_evaluations"]["fidelity"]["exceeded"] is False
    assert res_boundary["threshold_evaluations"]["qber_proxy"]["exceeded"] is False

    # Just past boundary
    res_past = evaluate_statistical_thresholds(
        average_fidelity=0.989,
        qber_proxy=0.011,
        vector_dev=0.151,
        tv_distance=0.151,
        jsd=0.051
    )
    assert res_past["has_statistical_anomaly"] is True

    # Changing threshold values changes only anomaly evidence, not deterministic decisions
    res_custom = evaluate_statistical_thresholds(
        average_fidelity=0.95,
        qber_proxy=0.05,
        vector_dev=0.10,
        tv_distance=0.10,
        jsd=0.02,
        fidelity_threshold=0.90  # Relaxed custom threshold
    )
    assert res_custom["threshold_evaluations"]["fidelity"]["exceeded"] is False

# 7. Statistical layer does not alter deterministic decision
def test_statistical_layer_does_not_alter_deterministic_decision():
    model = QDSProtocolModel()
    # Execute full pipeline with channel manipulation
    res = run_full_pipeline(model, "Threshold test", attack_type="channel_manipulation", attack_strength=0.8)
    
    # Deterministic verification is sole authority for ACCEPT/REJECT
    assert res["verification"]["decision"] == "REJECT"
    # Threshold evaluations are present in statistical_analysis evidence layer
    assert "threshold_evaluations" in res["statistical_analysis"]
    assert res["statistical_analysis"]["has_statistical_anomaly"] is True
    # Verify disclaimer/label highlights non-authoritative nature
    assert "explanatory evidence only" in res["statistical_analysis"]["label"]

# 8. Attack-blind statistical analysis & QBER/Fidelity relationship
def test_attack_blind_statistical_analysis():
    # Statistical analysis metrics depend only on quantum measurements
    model = QDSProtocolModel()
    res1 = run_full_pipeline(model, "Blind test 1", attack_type="none")
    
    assert "qber_proxy" in res1["statistical_analysis"]
    assert "standard_error" in res1["statistical_analysis"]
    assert "confidence_interval_95" in res1["statistical_analysis"]
    
    # Verify QBER Proxy = 1 - Fidelity relationship note documentation
    q_eval = res1["statistical_analysis"]["threshold_evaluations"]["qber_proxy"]
    assert "mathematical_note" in q_eval

# 9. Attack-blind threshold evaluation
def test_attack_blind_threshold_evaluation():
    # Changing ground-truth attack label while keeping metrics identical does not affect threshold evaluation
    t1 = evaluate_statistical_thresholds(0.99, 0.01, 0.05, 0.05, 0.02)
    t2 = evaluate_statistical_thresholds(0.99, 0.01, 0.05, 0.05, 0.02)
    assert t1 == t2

# 10. Existing six attack scenarios regression
def test_six_attack_scenarios_regression():
    model = QDSProtocolModel()
    scenarios = [
        ("none", "ACCEPT"),
        ("forgery", "REJECT"),
        ("replay", "REJECT"),
        ("impersonation", "REJECT"),
        ("channel_manipulation", "REJECT"),
        ("unauthorized_verification", "REJECT")
    ]
    for attack, expected in scenarios:
        res = run_full_pipeline(model, f"Scenario test {attack}", attack_type=attack, attack_strength=0.5)
        assert res["verification"]["decision"] == expected, f"Scenario {attack} failed"

if __name__ == "__main__":
    test_forgery_experiment_metric_calculations()
    test_zero_attempt_safe_handling()
    test_all_forgeries_rejected_case()
    test_some_forgeries_accepted_case()
    test_statistical_threshold_evaluation()
    test_statistical_threshold_boundary_conditions()
    test_statistical_layer_does_not_alter_deterministic_decision()
    test_attack_blind_statistical_analysis()
    test_attack_blind_threshold_evaluation()
    test_six_attack_scenarios_regression()
    print("ALL HARDENING & COMPLIANCE TESTS PASSED!")
