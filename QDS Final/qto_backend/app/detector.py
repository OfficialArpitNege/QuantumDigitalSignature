from .stats import total_variation, js_divergence, vector_deviation, weighted_score

def classify_attack_automatically(expected, observed, vector_dev, tv, qber, duplicate_detected, freshness_ok):
    if duplicate_detected or not freshness_ok:
        return "replay"

    if vector_dev < 0.15 and tv < 0.15:
        return "none"

    dx = abs(float(expected.get("X", 0.0)) - float(observed.get("X", 0.0)))
    dy = abs(float(expected.get("Y", 0.0)) - float(observed.get("Y", 0.0)))

    # Composite rotation affects both X and Y axes
    if dx > 0.1 and dy > 0.1:
        return "impersonation"
    # Rx rotation affects Y-axis and Z-axis (causing QBER)
    elif dy > dx + 0.05 or (qber is not None and qber > 0.2):
        return "channel_manipulation"
    # Ry rotation affects X-axis and Z-axis
    else:
        return "forgery"

def detect(expected, observed, expected_probs=None, observed_probs=None,
           qber=None, fidelity=None, forgery_probability=None,
           verification_success_rate=None, identity_failure_rate=None,
           duplicate_detected=False, freshness_ok=True, attack_type=None):
    vector_dev = vector_deviation(expected, observed)
    norm_dev = min(1.0, vector_dev / 2.0)
    tv = total_variation(expected_probs or {}, observed_probs or {}) if expected_probs is not None and observed_probs is not None else 0.0
    jsd = js_divergence(expected_probs or {}, observed_probs or {}) if expected_probs is not None and observed_probs is not None else 0.0

    # Automate attack classification if not explicitly overridden
    classified_attack = classify_attack_automatically(
        expected, observed, vector_dev, tv, qber, duplicate_detected, freshness_ok
    ) if attack_type is None or attack_type == "auto" else attack_type

    if classified_attack == "forgery":
        evidence = {
            "forgery_probability": forgery_probability if forgery_probability is not None else norm_dev,
            "verification_failure": 1.0 - (fidelity if fidelity is not None else 1.0),
            "statistical_deviation": norm_dev,
            "distribution_tv": tv,
        }
        score = weighted_score(evidence, {"forgery_probability": .40, "verification_failure": .30,
                                          "statistical_deviation": .20, "distribution_tv": .10})

    elif classified_attack == "replay":
        evidence = {
            "duplicate_detected": 1.0 if duplicate_detected else 0.0,
            "freshness_failure": 0.0 if freshness_ok else 1.0,
        }
        score = weighted_score(evidence, {"duplicate_detected": .70, "freshness_failure": .30})

    elif classified_attack == "channel_manipulation":
        evidence = {
            "qber": qber or 0.0,
            "fidelity_loss": 1.0 - (fidelity if fidelity is not None else 1.0),
            "statistical_deviation": norm_dev,
            "distribution_tv": tv,
            "jsd": min(1.0, jsd),
        }
        score = weighted_score(evidence, {"qber": .25, "fidelity_loss": .30,
                                          "statistical_deviation": .20, "distribution_tv": .15, "jsd": .10})

    elif classified_attack == "impersonation":
        evidence = {
            "identity_failure": 1.0 - (fidelity if fidelity is not None else 1.0),
            "signature_anomaly": norm_dev,
            "distribution_anomaly": tv,
        }
        score = weighted_score(evidence, {"identity_failure": .50, "signature_anomaly": .30,
                                          "distribution_anomaly": .20})
    else:
        evidence = {
            "statistical_deviation": norm_dev,
            "distribution_tv": tv,
            "fidelity_loss": 1.0 - (fidelity if fidelity is not None else 1.0),
        }
        score = weighted_score(evidence, {"statistical_deviation": .40, "distribution_tv": .30,
                                          "fidelity_loss": .30})

    level = "LOW" if score < .25 else "MEDIUM" if score < .60 else "HIGH" if score < .80 else "CRITICAL"

    return {
        "attack_type": classified_attack,
        "threat_score": round(score * 100, 2),
        "threat_level": level,
        "evidence": evidence,
        "raw_vector_deviation": vector_dev,
        "distribution_total_variation": tv,
        "jensen_shannon_divergence": jsd,
        "note": "Threat engine automatically classified attack vector from quantum measurement evidence."
    }

