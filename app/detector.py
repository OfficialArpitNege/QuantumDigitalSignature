from .stats import total_variation, js_divergence, vector_deviation, weighted_score

def classify_attack_automatically(
    expected,
    observed,
    vector_dev,
    tv,
    qber,
    duplicate_detected,
    freshness_ok,
    signature_valid=True,
    identity_valid=True,
    quantum_valid=True,
    unauthorized_attempt=False,
):
    # 1. Replay attack: session nonce replayed or duplicate detected
    if duplicate_detected or not freshness_ok:
        return "replay"

    # 2. Forgery attack: HMAC classical signature fails
    if not signature_valid:
        return "forgery"

    # 3. Impersonation attack: Alice identity verification fails
    if not identity_valid:
        return "impersonation"

    # 4. Unauthorized verification attack
    if unauthorized_attempt:
        return "unauthorized_verification"

    # 5. Quantum Channel Manipulation / Noise: Quantum state perturbed / fidelity loss / high QBER
    if not quantum_valid or vector_dev > 0.15 or tv > 0.15 or (qber is not None and qber > 0.01):
        dx = abs(float(expected.get("X", 0.0)) - float(observed.get("X", 0.0)))
        dy = abs(float(expected.get("Y", 0.0)) - float(observed.get("Y", 0.0)))

        if dx > 0.1 and dy > 0.1:
            return "impersonation"
        elif dy > dx + 0.05 or (qber is not None and qber > 0.05):
            return "channel_manipulation"
        else:
            return "forgery"

    # 6. Clean transmission: All verification gates passed, no statistical anomalies
    return "none"

def detect(expected, observed, expected_probs=None, observed_probs=None,
           qber=None, fidelity=None, forgery_probability=None,
           verification_success_rate=None, identity_failure_rate=None,
           duplicate_detected=False, freshness_ok=True, attack_type=None,
           signature_valid=True, identity_valid=True, quantum_valid=True,
           unauthorized_attempt=False, vector_dev=None, tv=None):
    if vector_dev is None:
        vector_dev = vector_deviation(expected, observed)
    norm_dev = min(1.0, vector_dev / 2.0)

    if tv is None:
        tv = total_variation(expected_probs or {}, observed_probs or {}) if expected_probs is not None and observed_probs is not None else 0.0
    jsd = js_divergence(expected_probs or {}, observed_probs or {}) if expected_probs is not None and observed_probs is not None else 0.0

    # Always classify attack automatically from evidence (attack-blind detection)
    classified_attack = classify_attack_automatically(
        expected, observed, vector_dev, tv, qber, duplicate_detected, freshness_ok,
        signature_valid=signature_valid, identity_valid=identity_valid,
        quantum_valid=quantum_valid, unauthorized_attempt=unauthorized_attempt
    )

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
        "note": "Threat engine automatically classified attack vector from quantum & gate evidence."
    }

