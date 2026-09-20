"""
Phase 10 Forgery Probability & Performance Evaluation Suite.
"""
import secrets
from app.stats import calculate_performance_metrics
from app.protocol import QDSProtocolModel

def test_phase10_performance_metrics_calculation():
    print("--- Phase 10 Test 1: Performance Metrics Calculation & Zero-Division Safety ---")
    
    # 1. Known confusion matrix: TP=40, FP=0, TN=10, FN=0 (Perfect classifier)
    m1 = calculate_performance_metrics(tp=40, fp=0, tn=10, fn=0)
    assert m1["accuracy"] == 1.0
    assert m1["precision"] == 1.0
    assert m1["recall"] == 1.0
    assert m1["f1_score"] == 1.0
    assert m1["forgery_detection_rate"] == 1.0
    assert m1["far"] == 0.0
    assert m1["frr"] == 0.0
    assert m1["total_samples"] == 50

    # 2. Zero samples safety check
    m0 = calculate_performance_metrics(tp=0, fp=0, tn=0, fn=0)
    assert m0["accuracy"] == 0.0
    assert m0["f1_score"] == 0.0
    assert m0["total_samples"] == 0

    # 3. Known mixed case: TP=10, FP=2, TN=8, FN=2 (Total = 22)
    # Accuracy = (10+8)/22 = 18/22 = 0.8182
    # Precision = 10/12 = 0.8333
    # Recall = 10/12 = 0.8333
    # FAR = 2/12 = 0.1667
    # FRR = 2/10 = 0.2000
    m_mix = calculate_performance_metrics(tp=10, fp=2, tn=8, fn=2)
    assert m_mix["accuracy"] == 0.8182
    assert m_mix["precision"] == 0.8333
    assert m_mix["recall"] == 0.8333
    assert m_mix["far"] == 0.1667
    assert m_mix["frr"] == 0.2000

    print("Performance metrics calculation & edge-case test PASSED!\n")

def test_phase10_experimental_evaluation_trials():
    print("--- Phase 10 Test 2: Multi-Trial Experimental Benchmark ---")
    model = QDSProtocolModel()
    scenarios = ["none", "forgery", "replay", "impersonation", "channel_manipulation"]
    
    tp, fp, tn, fn = 0, 0, 0, 0
    trials_per_scenario = 5

    for attack in scenarios:
        for i in range(trials_per_scenario):
            sess, ver, _ = model.execute_protocol(
                message=f"Experimental trial {i}",
                private_key=secrets.token_hex(32),
                attack_type=attack,
                attack_strength=0.5
            )

            if attack != "none":
                if ver.decision == "REJECT":
                    tp += 1
                else:
                    fn += 1
            else:
                if ver.decision == "ACCEPT":
                    tn += 1
                else:
                    fp += 1

    summary = calculate_performance_metrics(tp, fp, tn, fn)
    print(f"Total Trials = {summary['total_samples']} across {len(scenarios)} scenarios.")
    print(f"Accuracy = {summary['accuracy']*100:.2f}% | Forgery/Attack Detection Rate = {summary['forgery_detection_rate']*100:.2f}%")
    print(f"FAR = {summary['far']*100:.2f}% | FRR = {summary['frr']*100:.2f}%")

    assert summary["total_samples"] == len(scenarios) * trials_per_scenario
    assert summary["forgery_detection_rate"] == 1.0, "All simulated attack trials must be detected and rejected"
    assert summary["far"] == 0.0, "FAR should be 0 in clean simulation"
    assert summary["frr"] == 0.0, "FRR should be 0 in clean simulation"
    assert summary["accuracy"] == 1.0, "System accuracy should be 100% across tested scenarios"

    print("Multi-trial experimental benchmark test PASSED!\n")

if __name__ == "__main__":
    test_phase10_performance_metrics_calculation()
    test_phase10_experimental_evaluation_trials()
    print("ALL PHASE 10 FORGERY PROBABILITY & PERFORMANCE EVALUATION TESTS PASSED SUCCESSFULLY!")
