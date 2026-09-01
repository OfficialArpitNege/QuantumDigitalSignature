from .stats import total_variation, js_divergence, vector_deviation, weighted_score

def detect(expected, observed, expected_probs=None, observed_probs=None,
           qber=None, fidelity=None, forgery_probability=None,
           verification_success_rate=None, identity_failure_rate=None,
           duplicate_detected=False, freshness_ok=True, attack_type="none"):
    vector_dev = vector_deviation(expected, observed)
    tv = total_variation(expected_probs or {}, observed_probs or {}) if expected_probs is not None and observed_probs is not None else 0.0
    jsd = js_divergence(expected_probs or {}, observed_probs or {}) if expected_probs is not None and observed_probs is not None else 0.0

    if attack_type == "forgery":
        evidence = {
            "forgery_probability": forgery_probability if forgery_probability is not None else min(1.0, vector_dev),
            "verification_failure": 1.0 - (verification_success_rate if verification_success_rate is not None else 1.0),
            "statistical_deviation": min(1.0, vector_dev),
            "distribution_tv": tv,
        }
        score = weighted_score(evidence, {"forgery_probability": .40, "verification_failure": .30,
                                          "statistical_deviation": .20, "distribution_tv": .10})

    elif attack_type == "replay":
        evidence = {
            "duplicate_detected": 1.0 if duplicate_detected else 0.0,
            "freshness_failure": 0.0 if freshness_ok else 1.0,
        }
        score = weighted_score(evidence, {"duplicate_detected": .70, "freshness_failure": .30})

    elif attack_type == "channel_manipulation":
        evidence = {
            "qber": qber or 0.0,
            "fidelity_loss": 1.0 - (fidelity if fidelity is not None else 1.0),
            "statistical_deviation": min(1.0, vector_dev),
            "distribution_tv": tv,
            "jsd": min(1.0, jsd),
        }
        score = weighted_score(evidence, {"qber": .25, "fidelity_loss": .30,
                                          "statistical_deviation": .20, "distribution_tv": .15, "jsd": .10})

    elif attack_type == "impersonation":
        evidence = {
            "identity_failure": identity_failure_rate if identity_failure_rate is not None else 0.0,
            "signature_anomaly": min(1.0, vector_dev),
            "distribution_anomaly": tv,
        }
        score = weighted_score(evidence, {"identity_failure": .50, "signature_anomaly": .30,
                                          "distribution_anomaly": .20})
    else:
        evidence = {
            "statistical_deviation": min(1.0, vector_dev),
            "distribution_tv": tv,
            "fidelity_loss": 1.0 - (fidelity if fidelity is not None else 1.0),
        }
        score = weighted_score(evidence, {"statistical_deviation": .40, "distribution_tv": .30,
                                          "fidelity_loss": .30})

    level = "LOW" if score < .25 else "MEDIUM" if score < .60 else "HIGH" if score < .80 else "CRITICAL"

    return {
        "attack_type": attack_type,
        "threat_score": round(score * 100, 2),
        "threat_level": level,
        "evidence": evidence,
        "raw_vector_deviation": vector_dev,
        "distribution_total_variation": tv,
        "jensen_shannon_divergence": jsd,
        "note": "Prototype weights/thresholds. Calibrate against legitimate, noisy and attack datasets before security claims."
    }
