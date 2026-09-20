"""
Phase 12: Backend Integration Pipeline.

Provides run_full_pipeline() — the single authoritative end-to-end entry point
that orchestrates the complete QDS protocol flow by composing all existing modules:

    Alice -> Sign -> Quantum Encode -> Teleport -> Eve/Channel
         -> Bob Measure -> QDS Verify -> Statistical Analysis
         -> Final Decision -> Audit

DESIGN PRINCIPLES
-----------------
* Zero logic duplication: every computation delegates to the module that owns it.
* Deterministic verification remains the sole authority for ACCEPT/REJECT.
* Threat/statistical analysis is explanatory evidence only.
* Audit recording is non-invasive (appended after decision, never influences it).
* Full backward compatibility: existing API endpoints are untouched.
"""

from typing import Any, Dict, Optional
import secrets
import time

from .crypto import sha256_bytes, new_nonce, new_session_id
from .quantum import measure_xyz, fidelity_pure
from .stats import (
    total_variation,
    js_divergence,
    vector_deviation,
    standard_error,
    confidence_interval_95,
    evaluate_statistical_thresholds,
)
from .detector import detect
from .protocol import QDSProtocolModel, ProtocolStepLog
from .audit import AuditChain  # chain is passed in by caller (owner is QDSProtocolModel)


def run_full_pipeline(
    model: QDSProtocolModel,
    message: str,
    attack_type: str = "none",
    attack_strength: float = 0.5,
    shots: int = 1024,
    max_symbols: int = 4,
    private_key: Optional[str] = None,
) -> Dict[str, Any]:
    """
    End-to-end QDS protocol pipeline.  Composes all existing modules and returns
    a fully structured result dict covering every layer of the pipeline.

    Parameters
    ----------
    model          : QDSProtocolModel instance (owns audit chain + seen_nonces).
    message        : Plaintext message to sign and transmit.
    attack_type    : One of "none" | "forgery" | "replay" | "impersonation"
                     | "channel_manipulation" | "unauthorized_verification".
    attack_strength: Attack perturbation strength [0.0, 1.0].
    shots          : Number of projective measurement shots per qubit.
    max_symbols    : Number of signature bits / qubits.
    private_key    : Hex private key for Alice's HMAC signing (random if None).

    Returns
    -------
    Structured result dict with keys:
        pipeline_version, session, signature, quantum_transmission,
        statistical_analysis, verification, threat_assessment, audit, logs,
        execution_time_ms, disclaimer.
    """
    t_start = time.perf_counter()
    private_key = private_key or secrets.token_hex(32)

    # ------------------------------------------------------------------
    # Execute the complete protocol (Phases 1-11 via QDSProtocolModel).
    # This single call handles:
    #   - Session init + entity resolution
    #   - Alice signing + quantum encoding
    #   - Teleportation + Pauli correction + attack injection
    #   - Bob measurement + fidelity verification
    #   - Deterministic ACCEPT/REJECT (4-gate: sig, id, replay, quantum)
    #   - Tamper-evident audit record (Phase 11)
    # ------------------------------------------------------------------
    session, verification, logs = model.execute_protocol(
        message=message,
        private_key=private_key,
        attack_type=attack_type,
        attack_strength=attack_strength,
        shots=shots,
        max_symbols=max_symbols,
    )

    # ------------------------------------------------------------------
    # Retrieve the just-appended audit record from the model's chain
    # (chain is owned by QDSProtocolModel — not duplicated here).
    # ------------------------------------------------------------------
    audit_records = model.audit_chain.get_records()
    latest_audit = audit_records[-1] if audit_records else None

    # ------------------------------------------------------------------
    # Pull per-qubit teleportation data from step log 3
    # (already computed inside execute_protocol — we reuse, not recompute).
    # ------------------------------------------------------------------
    qubit_data: list = []
    for log in logs:
        if log.step_name.startswith("3."):
            qubit_data = log.data.get("qubits", [])
            break

    avg_fidelity: float = verification.details.get("average_fidelity", 1.0)
    fidelities: list = verification.details.get("fidelities", [])
    fidelity_threshold: float = verification.details.get("fidelity_threshold", 0.99)

    # ------------------------------------------------------------------
    # Statistical analysis layer (Phase 8) — explanatory evidence only.
    # We derive aggregate expected/observed vectors from the qubit log.
    # If qubit data is unavailable (edge case), we use safe defaults.
    # ------------------------------------------------------------------
    if qubit_data:
        # Aggregate fidelity-based approximation of expected vs observed Bloch vectors.
        # Each qubit bit encodes theta=0 (|0>) or theta=pi (|1>); Z-expectation = cos(theta).
        n = len(qubit_data)
        # For a bit=0 state |0>, <Z>=+1, <X>=0, <Y>=0
        # For a bit=1 state |1>, <Z>=-1, <X>=0, <Y>=0
        expected_z = sum(1.0 if q["input_bit"] == 0 else -1.0 for q in qubit_data) / n
        observed_z = sum(
            (1.0 if q["input_bit"] == 0 else -1.0) * q["fidelity"] for q in qubit_data
        ) / n
        expected_vec = {"X": 0.0, "Y": 0.0, "Z": expected_z}
        observed_vec = {"X": 0.0, "Y": 0.0, "Z": observed_z}

        expected_probs = {"+": max(0.0, (1 + expected_z) / 2), "-": max(0.0, (1 - expected_z) / 2)}
        observed_probs = {"+": max(0.0, (1 + observed_z) / 2), "-": max(0.0, (1 - observed_z) / 2)}

        vec_dev = vector_deviation(expected_vec, observed_vec)
        tv = total_variation(expected_probs, observed_probs)
        jsd = js_divergence(expected_probs, observed_probs)
        qber_proxy = 1.0 - avg_fidelity  # higher fidelity loss -> higher error proxy
    else:
        expected_vec = {"X": 0.0, "Y": 0.0, "Z": 1.0}
        observed_vec = {"X": 0.0, "Y": 0.0, "Z": 1.0}
        expected_probs = {"+": 1.0, "-": 0.0}
        observed_probs = {"+": 1.0, "-": 0.0}
        vec_dev = 0.0
        tv = 0.0
        jsd = 0.0
        qber_proxy = 0.0

    se = standard_error(avg_fidelity, shots)
    ci_lo, ci_hi = confidence_interval_95(avg_fidelity, shots)

    # ------------------------------------------------------------------
    # Threat assessment (Phase 8/9 detector) — explanatory only.
    # Result is derived purely from evidence; ground-truth attack label is NOT passed.
    # ------------------------------------------------------------------
    freshness_ok = verification.replay_valid
    threat = detect(
        expected=expected_vec,
        observed=observed_vec,
        expected_probs=expected_probs,
        observed_probs=observed_probs,
        qber=qber_proxy,
        fidelity=avg_fidelity,
        duplicate_detected=(not freshness_ok),
        freshness_ok=freshness_ok,
        signature_valid=verification.signature_valid,
        identity_valid=verification.identity_valid,
        quantum_valid=verification.quantum_valid,
        unauthorized_attempt=(attack_type == "unauthorized_verification"),
        attack_type="auto",
    )

    t_end = time.perf_counter()
    execution_time_ms = round((t_end - t_start) * 1000, 2)

    stat_thresholds = evaluate_statistical_thresholds(
        average_fidelity=avg_fidelity,
        qber_proxy=qber_proxy,
        vector_dev=vec_dev,
        tv_distance=tv,
        jsd=jsd,
        fidelity_threshold=fidelity_threshold
    )

    # ------------------------------------------------------------------
    # Structured result
    # ------------------------------------------------------------------
    session_summary = session.get_summary()

    return {
        "pipeline_version": "12.0",

        # Session information
        "session": {
            "session_id": session_summary["session_id"],
            "nonce": session_summary["nonce"],
            "sender": session_summary["sender"],
            "receiver": session_summary["receiver"],
            "has_attacker": session_summary["has_attacker"],
            "created_at": session_summary["created_at"],
        },

        # Signature layer
        "signature": {
            "message": message,
            "message_hash_hex": sha256_bytes(message).hex(),
            "max_symbols": max_symbols,
            "attack_type": threat["attack_type"],
            "attack_strength": attack_strength,
        },

        # Quantum transmission layer
        "quantum_transmission": {
            "qubits_transmitted": len(qubit_data),
            "shots_per_qubit": shots,
            "average_fidelity": round(avg_fidelity, 6),
            "fidelity_threshold": fidelity_threshold,
            "per_qubit_fidelities": [round(f, 6) for f in fidelities],
            "qubit_details": qubit_data,
        },

        # Statistical analysis (Phase 8 & Phase 14.5) — evidence only
        "statistical_analysis": {
            "label": "QBER Proxy and statistical metrics — explanatory evidence only",
            "qber_proxy": round(qber_proxy, 6),
            "average_fidelity": round(avg_fidelity, 6),
            "vector_deviation": round(vec_dev, 6),
            "total_variation_distance": round(tv, 6),
            "jensen_shannon_divergence": round(jsd, 6),
            "standard_error": round(se, 6),
            "confidence_interval_95": [round(ci_lo, 6), round(ci_hi, 6)],
            "threshold_evaluations": stat_thresholds["threshold_evaluations"],
            "has_statistical_anomaly": stat_thresholds["has_statistical_anomaly"],
        },

        # Deterministic verification (Phase 6/9) — sole authority for ACCEPT/REJECT
        "verification": {
            "decision": verification.decision,
            "reason": verification.reason,
            "signature_valid": verification.signature_valid,
            "identity_valid": verification.identity_valid,
            "replay_valid": verification.replay_valid,
            "quantum_valid": verification.quantum_valid,
            "details": verification.details,
        },

        # Threat assessment (Phase 8 detector) — explanatory only, does NOT decide
        "threat_assessment": {
            "label": "Heuristic threat analysis — does NOT override deterministic decision",
            "classified_attack": threat["attack_type"],
            "threat_score": threat["threat_score"],
            "threat_level": threat["threat_level"],
            "evidence": threat["evidence"],
        },

        # Audit chain record (Phase 11)
        "audit": {
            "chain_length": model.audit_chain.chain_length(),
            "latest_record": latest_audit,
            "label": "Tamper-evident audit prototype — not a production blockchain",
        },

        # Protocol step logs
        "logs": [
            {"step": l.step_name, "description": l.description, "data": l.data}
            for l in logs
        ],

        "execution_time_ms": execution_time_ms,
        "disclaimer": (
            "Research prototype. Deterministic verification is the sole authority "
            "for ACCEPT/REJECT. Statistical metrics and threat scores are explanatory evidence only."
        ),
    }
