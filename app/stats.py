"""
Statistical metrics and probability functions used for threat detection diagnostics.
"""
from typing import Optional
import math
import numpy as np

def safe_probs(p: dict, keys: list[str]) -> np.ndarray:
    x = np.array([max(float(p.get(k, 0.0)), 0.0) for k in keys], dtype=float)
    s = x.sum()
    return x / s if s else np.ones(len(keys)) / len(keys)

def total_variation(p: dict, q: dict) -> float:
    """Total Variation Distance - mathematically defined probability metric."""
    keys = sorted(set(p) | set(q))
    return float(0.5 * np.sum(np.abs(safe_probs(p, keys) - safe_probs(q, keys))))

def kl_divergence(p: np.ndarray, q: np.ndarray, eps: float = 1e-12) -> float:
    """Kullback-Leibler Divergence - mathematically defined information metric."""
    p = np.clip(p, eps, None); p = p / p.sum()
    q = np.clip(q, eps, None); q = q / q.sum()
    return float(np.sum(p * np.log2(p / q)))

def js_divergence(p: dict, q: dict) -> float:
    """Jensen-Shannon Divergence - symmetric mathematically defined metric."""
    keys = sorted(set(p) | set(q))
    pp = safe_probs(p, keys)
    qq = safe_probs(q, keys)
    m = 0.5 * (pp + qq)
    return 0.5 * kl_divergence(pp, m) + 0.5 * kl_divergence(qq, m)

def vector_deviation(expected: dict, observed: dict) -> float:
    """Euclidean vector deviation between Bloch expectation values."""
    keys = ["X", "Y", "Z"]
    e = np.array([expected[k] for k in keys], dtype=float)
    o = np.array([observed[k] for k in keys], dtype=float)
    return float(np.linalg.norm(e - o))

def standard_error(probability: float, shots: int) -> float:
    """Binomial standard-error model."""
    p = float(np.clip(probability, 0, 1))
    return math.sqrt(p * (1 - p) / max(shots, 1))

def confidence_interval_95(probability: float, shots: int) -> tuple[float, float]:
    """95% confidence-interval approximation for measurement probabilities."""
    p = float(np.clip(probability, 0, 1))
    se = standard_error(p, shots)
    return (max(0.0, p - 1.96 * se), min(1.0, p + 1.96 * se))

def qber(expected_bits: list[int], observed_bits: list[int]) -> float:
    """Prototype classical bit mismatch ratio (bit error rate metric used by prototype)."""
    if len(expected_bits) != len(observed_bits) or not expected_bits:
        return 0.0
    return sum(a != b for a, b in zip(expected_bits, observed_bits)) / len(expected_bits)

def weighted_score(values: dict, weights: dict) -> float:
    """Calculates weighted diagnostic anomaly score normalized to [0, 1]."""
    total_w = sum(weights.values())
    if total_w <= 0:
        return 0.0
    return float(np.clip(sum(values.get(k, 0.0) * w for k, w in weights.items()) / total_w, 0, 1))

def calculate_performance_metrics(tp: int, fp: int, tn: int, fn: int) -> dict:
    """
    Calculates confusion matrix performance evaluation metrics with zero-division protection.
    
    Definitions in system context:
    - Positive condition (P): Attack / Anomaly present (forgery, replay, noise, impersonation, unauth)
    - Negative condition (N): Legitimate transmission (no attack)
    - True Positive (TP): Attack correctly REJECTED by protocol
    - False Positive (FP): Legitimate transmission incorrectly REJECTED (False Rejection)
    - True Negative (TN): Legitimate transmission correctly ACCEPTED
    - False Negative (FN): Attack incorrectly ACCEPTED (False Acceptance / Forgery undetected)
    """
    total = tp + fp + tn + fn
    if total == 0:
        return {
            "accuracy": 0.0, "precision": 0.0, "recall": 0.0, "f1_score": 0.0,
            "detection_rate": 0.0, "forgery_detection_rate": 0.0,
            "far": 0.0, "frr": 0.0,
            "tp": 0, "fp": 0, "tn": 0, "fn": 0, "total_samples": 0
        }

    accuracy = (tp + tn) / total
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    
    detection_rate = recall  # TP / (TP + FN)
    far = fn / (tp + fn) if (tp + fn) > 0 else 0.0  # False Acceptance Rate: Attacks ACCEPTED
    frr = fp / (fp + tn) if (fp + tn) > 0 else 0.0  # False Rejection Rate: Legitimate REJECTED

    return {
        "accuracy": float(round(accuracy, 4)),
        "precision": float(round(precision, 4)),
        "recall": float(round(recall, 4)),
        "f1_score": float(round(f1, 4)),
        "detection_rate": float(round(detection_rate, 4)),
        "forgery_detection_rate": float(round(recall, 4)),
        "far": float(round(far, 4)),
        "frr": float(round(frr, 4)),
        "tp": tp, "fp": fp, "tn": tn, "fn": fn,
        "total_samples": total
    }


def wilson_score_interval(successes: int, total: int, confidence: float = 0.95) -> tuple[float, float]:
    """
    Computes Wilson score binomial confidence interval.
    Provides accurate finite-sample coverage even for 0 successes (k=0) or small sample sizes (N < 30),
    avoiding the degeneracies of the standard Wald interval.
    """
    if total <= 0:
        return (0.0, 0.0)

    # z = 1.959964 for 95% confidence
    z = 1.959964 if math.isclose(confidence, 0.95, abs_tol=1e-3) else 1.96
    p_hat = successes / total
    
    denominator = 1 + (z**2 / total)
    centre = p_hat + (z**2 / (2 * total))
    adjusted_centre = centre / denominator
    
    spread = z * math.sqrt((p_hat * (1 - p_hat) / total) + (z**2 / (4 * (total**2))))
    adjusted_spread = spread / denominator

    lower = max(0.0, adjusted_centre - adjusted_spread)
    upper = min(1.0, adjusted_centre + adjusted_spread)
    return (float(round(lower, 6)), float(round(upper, 6)))


def calculate_empirical_forgery_metrics(total_attempts: int, accepted_count: int, rejected_count: int, shots: int = 1024, confidence_level: float = 0.95) -> dict:
    """
    Calculates empirical forgery probability and detection rate with zero-division safety and Wilson score 95% confidence interval.
    
    Formula:
      empirical_forgery_probability = successful_forgery_accepts / total_forgery_attempts
    
    STATISTICAL INTERPRETATION NOTE:
      Describes the observed empirical false-acceptance rate under the tested forgery strategy and finite sample size.
      An empirical result of 0.0 (0 accepted forgeries) reflects high empirical detection efficacy in the tested trials,
      but does NOT constitute a mathematical or theoretical proof that the underlying forgery probability is identically 0.
    """
    if total_attempts <= 0:
        return {
            "total_forgery_attempts": 0,
            "successful_forgery_accepts": 0,
            "detected_forgery_rejects": 0,
            "empirical_forgery_probability": 0.0,
            "forgery_detection_rate": 0.0,
            "false_acceptance_rate": 0.0,
            "confidence_interval": [0.0, 0.0],
            "confidence_level": confidence_level,
            "sample_size": 0,
            "sample_size_label": "N=0 attempts (No trials conducted)",
            "description": "Observed empirical false-acceptance rate under tested forgery strategy and finite sample size.",
            "interpretation_note": "N=0 attempts. No empirical measurement available."
        }

    empirical_prob = accepted_count / total_attempts
    detection_rate = rejected_count / total_attempts
    far = empirical_prob

    ci_lo, ci_hi = wilson_score_interval(accepted_count, total_attempts, confidence_level)

    if accepted_count == 0:
        note = (
            f"Observed 0 accepted forgeries out of N={total_attempts} trials. "
            f"Wilson 95% confidence interval is [0.0, {ci_hi}]. "
            "This reflects 100% empirical detection in tested trials, but does NOT prove theoretical zero forgery probability."
        )
    else:
        note = (
            f"Observed {accepted_count} accepted forgeries out of N={total_attempts} trials. "
            f"Wilson 95% confidence interval is [{ci_lo}, {ci_hi}]."
        )

    return {
        "total_forgery_attempts": total_attempts,
        "successful_forgery_accepts": accepted_count,
        "detected_forgery_rejects": rejected_count,
        "empirical_forgery_probability": float(round(empirical_prob, 6)),
        "forgery_detection_rate": float(round(detection_rate, 6)),
        "false_acceptance_rate": float(round(far, 6)),
        "confidence_interval": [ci_lo, ci_hi],
        "confidence_level": confidence_level,
        "sample_size": total_attempts,
        "sample_size_label": f"N={total_attempts} independent experimental trials",
        "description": "Observed empirical false-acceptance rate under the tested forgery strategy and finite sample size.",
        "interpretation_note": note
    }


from dataclasses import dataclass, asdict

@dataclass
class StatisticalThresholdConfig:
    """
    Structured configuration for experimental research thresholds.
    These are configurable prototype parameters for diagnostic anomaly flagging,
    NOT proven or calibrated information-theoretic security boundaries.
    """
    fidelity_threshold: float = 0.99
    qber_threshold: float = 0.01
    vector_dev_threshold: float = 0.15
    tv_threshold: float = 0.15
    jsd_threshold: float = 0.05
    methodology: str = (
        "Configurable experimental research parameters for prototype evidence flagging. "
        "Not proven or empirical hardware-calibrated security boundaries."
    )


def evaluate_statistical_thresholds(
    average_fidelity: float,
    qber_proxy: float,
    vector_dev: float,
    tv_distance: float,
    jsd: float,
    config: Optional[StatisticalThresholdConfig] = None,
    fidelity_threshold: Optional[float] = None,
    qber_threshold: Optional[float] = None,
    vector_dev_threshold: Optional[float] = None,
    tv_threshold: Optional[float] = None,
    jsd_threshold: Optional[float] = None
) -> dict:
    """
    Evaluates structured statistical anomaly thresholds on evidence metrics.
    
    IMPORTANT ARCHITECTURE:
    Statistical thresholds provide ANOMALY/EVIDENCE diagnostics only and MUST NOT
    override the formal deterministic verification decision (ACCEPT iff sig & id & replay & quantum valid).
    
    ATTACK-BLIND REQUIREMENT:
    Does NOT inspect ground-truth attack labels (attack_type, scenario, etc.).
    
    MATHEMATICAL RELATIONSHIP NOTE:
    In this prototype simulator, QBER Proxy is defined as (1 - average_fidelity).
    Therefore, Average State Fidelity and QBER Proxy are complementary mathematical representations
    of state distortion rather than statistically independent evidence channels.
    """
    cfg = config or StatisticalThresholdConfig()
    
    # Allow parameter overrides if passed explicitly
    f_thresh = fidelity_threshold if fidelity_threshold is not None else cfg.fidelity_threshold
    q_thresh = qber_threshold if qber_threshold is not None else cfg.qber_threshold
    v_thresh = vector_dev_threshold if vector_dev_threshold is not None else cfg.vector_dev_threshold
    tv_thresh = tv_threshold if tv_threshold is not None else cfg.tv_threshold
    jsd_thresh = jsd_threshold if jsd_threshold is not None else cfg.jsd_threshold

    methodology_note = cfg.methodology

    evaluations = {
        "fidelity": {
            "metric": "Average State Fidelity",
            "observed_value": float(round(average_fidelity, 6)),
            "threshold": float(f_thresh),
            "operator": "<",
            "exceeded": bool(average_fidelity < f_thresh),
            "anomaly": bool(average_fidelity < f_thresh),
            "explanation": f"Average state fidelity ({round(average_fidelity, 4)}) is below the experimental threshold ({f_thresh}).",
            "threshold_status": "EXPERIMENTAL_RESEARCH_PARAMETER",
            "methodology": methodology_note
        },
        "qber_proxy": {
            "metric": "QBER Proxy (Channel Error Rate)",
            "observed_value": float(round(qber_proxy, 6)),
            "threshold": float(q_thresh),
            "operator": ">",
            "exceeded": bool(qber_proxy > q_thresh),
            "anomaly": bool(qber_proxy > q_thresh),
            "explanation": f"QBER Proxy error rate ({round(qber_proxy, 4)}) exceeds the experimental threshold ({q_thresh}). Note: QBER Proxy = 1 - Fidelity in this prototype.",
            "threshold_status": "EXPERIMENTAL_RESEARCH_PARAMETER",
            "methodology": methodology_note,
            "mathematical_note": "Complementary metric to Average State Fidelity (QBER Proxy = 1 - Fidelity)."
        },
        "vector_deviation": {
            "metric": "Bloch Vector Deviation",
            "observed_value": float(round(vector_dev, 6)),
            "threshold": float(v_thresh),
            "operator": ">",
            "exceeded": bool(vector_dev > v_thresh),
            "anomaly": bool(vector_dev > v_thresh),
            "explanation": f"Bloch vector Euclidean deviation ({round(vector_dev, 4)}) exceeds the experimental threshold ({v_thresh}).",
            "threshold_status": "EXPERIMENTAL_RESEARCH_PARAMETER",
            "methodology": methodology_note
        },
        "total_variation": {
            "metric": "Total Variation Distance",
            "observed_value": float(round(tv_distance, 6)),
            "threshold": float(tv_thresh),
            "operator": ">",
            "exceeded": bool(tv_distance > tv_thresh),
            "anomaly": bool(tv_distance > tv_thresh),
            "explanation": f"Total Variation distance ({round(tv_distance, 4)}) exceeds the experimental threshold ({tv_thresh}).",
            "threshold_status": "EXPERIMENTAL_RESEARCH_PARAMETER",
            "methodology": methodology_note
        },
        "jensen_shannon_divergence": {
            "metric": "Jensen-Shannon Divergence",
            "observed_value": float(round(jsd, 6)),
            "threshold": float(jsd_thresh),
            "operator": ">",
            "exceeded": bool(jsd > jsd_thresh),
            "anomaly": bool(jsd > jsd_thresh),
            "explanation": f"Jensen-Shannon Divergence ({round(jsd, 4)}) exceeds the experimental threshold ({jsd_thresh}).",
            "threshold_status": "EXPERIMENTAL_RESEARCH_PARAMETER",
            "methodology": methodology_note
        }
    }

    any_anomaly = any(v["anomaly"] for v in evaluations.values())

    return {
        "threshold_evaluations": evaluations,
        "has_statistical_anomaly": any_anomaly,
        "config": {
            "fidelity_threshold": f_thresh,
            "qber_threshold": q_thresh,
            "vector_dev_threshold": v_thresh,
            "tv_threshold": tv_thresh,
            "jsd_threshold": jsd_thresh,
        },
        "label": "Statistical Threshold Layer — Evidence diagnostics only; does NOT dictate ACCEPT/REJECT decision.",
        "disclaimer": (
            "Thresholds are configurable experimental parameters for prototype anomaly flagging. "
            "They do not represent proven hardware-calibrated security boundaries. "
            "QBER Proxy and Fidelity are complementary mathematical representations (QBER Proxy = 1 - Fidelity)."
        )
    }



