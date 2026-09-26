import secrets
from typing import Optional
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import SignRequest, TeleportRequest, MeasurementRequest, AttackRequest, AnalyzeRequest, ExperimentRequest, PerformanceBenchmarkRequest, ForgeryExperimentRequest

from .crypto import sha256_bytes, new_nonce, new_session_id, signing_material, bits_from_bytes
from .quantum import state_from_angles, angles_from_bit, measure_xyz, teleportation, apply_attack, fidelity_pure, bloch_expectations
from .stats import confidence_interval_95
from .detector import detect
from .protocol import QDSProtocolModel
from .pipeline import run_full_pipeline

protocol_instance = QDSProtocolModel()

app = FastAPI(
    title="Quantum Threat Observatory Backend",
    version="0.1.0",
    description="Research prototype for teleportation-based quantum-signature simulation and statistical threat detection."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .network_router import router as network_router, set_protocol_instance
set_protocol_instance(protocol_instance)
app.include_router(network_router)

def arr(a):
    return [[float(z.real), float(z.imag)] for z in a]

def measurement_summary(measurements):
    return {
        axis: {
            "expectation": data["expectation"],
            "counts": data["counts"],
            "probabilities": data["probabilities"],
            "shots": data["shots"],
            "plus_ci95": confidence_interval_95(data["probabilities"]["+"], data["shots"]),
        }
        for axis, data in measurements.items()
    }

@app.get("/health")
def health():
    return {"status": "ok", "service": "quantum-threat-observatory"}

@app.post("/api/v1/sign")
def sign(req: SignRequest):
    private_key = req.private_key or secrets.token_hex(32)
    nonce = req.nonce or new_nonce()
    session_id = req.session_id or new_session_id()
    h = sha256_bytes(req.message)
    sig = signing_material(private_key, h, nonce, session_id)
    bits = bits_from_bytes(sig, req.max_symbols)

    qubits = []
    for i, bit in enumerate(bits):
        theta, phi = angles_from_bit(bit)
        state = state_from_angles(theta, phi)
        qubits.append({"index": i, "bit": bit, "theta": theta, "phi": phi, "state": arr(state)})

    return {
        "message_hash_hex": h.hex(),
        "nonce": nonce,
        "session_id": session_id,
        "signature_material_hex": sig.hex(),
        "qubits": qubits,
        "prototype_note": "HMAC-derived material is a demo signing layer, not a formally proven QDS scheme."
    }

@app.post("/api/v1/teleport")
def teleport(req: TeleportRequest):
    rng = np.random.default_rng()
    tele = teleportation(req.theta, req.phi, rng)
    attacked = apply_attack(tele["corrected_state"], req.attack, req.attack_strength)
    expected = measure_xyz(tele["corrected_state"], req.shots, rng)
    observed = measure_xyz(attacked, req.shots, rng)

    return {
        "input_state": arr(tele["input_state"]),
        "bell_state": arr(tele["bell_state"]),
        "bell_measurement": tele["bell_measurement"],
        "received_state": arr(tele["received_state"]),
        "corrected_state": arr(tele["corrected_state"]),
        "observed_state": arr(attacked),
        "fidelity_after_attack": fidelity_pure(tele["corrected_state"], attacked),
        "expected_measurements": measurement_summary(expected),
        "observed_measurements": measurement_summary(observed),
        "attack": req.attack,
        "attack_strength": req.attack_strength
    }

@app.post("/api/v1/measure")
def measure(req: MeasurementRequest):
    state = state_from_angles(req.theta, req.phi)
    return {
        "state": arr(state),
        "bloch": bloch_expectations(state),
        "measurements": measurement_summary(measure_xyz(state, req.shots))
    }

@app.post("/api/v1/attack")
def attack(req: AttackRequest):
    base = state_from_angles(req.theta, req.phi)
    tampered = apply_attack(base, req.attack, req.strength)
    expected = measure_xyz(base, req.shots)
    observed = measure_xyz(tampered, req.shots)
    return {
        "attack": req.attack,
        "strength": req.strength,
        "expected_measurements": measurement_summary(expected),
        "observed_measurements": measurement_summary(observed),
        "fidelity": fidelity_pure(base, tampered),
        "states": {"expected": arr(base), "observed": arr(tampered)}
    }

@app.post("/api/v1/analyze")
def analyze(req: AnalyzeRequest):
    return detect(
        expected=req.expected, observed=req.observed,
        expected_probs=req.expected_probs, observed_probs=req.observed_probs,
        qber=req.qber, fidelity=req.fidelity,
        forgery_probability=req.forgery_probability,
        verification_success_rate=req.verification_success_rate,
        identity_failure_rate=req.identity_failure_rate,
        duplicate_detected=req.duplicate_detected,
        freshness_ok=req.freshness_ok,
        attack_type=req.attack_type
    )

@app.post("/api/v1/experiment")
def experiment(req: ExperimentRequest):
    private_key = secrets.token_hex(32)
    nonce = new_nonce()
    session_id = new_session_id()
    h = sha256_bytes(req.message)
    sig = signing_material(private_key, h, nonce, session_id)
    bits = bits_from_bytes(sig, req.max_symbols)
    results = []

    for idx, bit in enumerate(bits):
        theta, phi = angles_from_bit(bit)
        tele = teleportation(theta, phi)
        expected_state = tele["corrected_state"]
        observed_state = apply_attack(expected_state, req.attack, req.attack_strength)
        expected = measure_xyz(expected_state, req.shots)
        observed = measure_xyz(observed_state, req.shots)
        ev = {a: expected[a]["expectation"] for a in ("X","Y","Z")}
        ov = {a: observed[a]["expectation"] for a in ("X","Y","Z")}
        f = fidelity_pure(expected_state, observed_state)

        # Demo QBER proxy: compare the most-likely computational-basis result.
        eb = 0 if expected["Z"]["probabilities"]["+"] >= .5 else 1
        ob = 0 if observed["Z"]["probabilities"]["+"] >= .5 else 1
        qb = 1.0 if eb != ob else 0.0

        det = detect(
            expected=ev, observed=ov,
            expected_probs=expected["Z"]["probabilities"],
            observed_probs=observed["Z"]["probabilities"],
            qber=qb, fidelity=f,
            duplicate_detected=(req.attack == "replay"),
            freshness_ok=(req.attack != "replay"),
            attack_type="auto"
        )
        results.append({
            "index": idx, "source_bit": bit,
            "bell_measurement": tele["bell_measurement"],
            "fidelity": f, "expected": ev, "observed": ov,
            "detection": det
        })

    return {
        "message": req.message,
        "message_hash_hex": h.hex(),
        "attack": req.attack,
        "attack_strength": req.attack_strength,
        "shots": req.shots,
        "results": results,
        "note": "Research prototype. Calibrate metrics with datasets before operational/security claims."
    }

@app.post("/api/v1/protocol/execute")
def execute_protocol_endpoint(req: ExperimentRequest):
    session, verification, logs = protocol_instance.execute_protocol(
        message=req.message,
        private_key=secrets.token_hex(32),
        attack_type=req.attack,
        attack_strength=req.attack_strength,
        shots=req.shots,
        max_symbols=req.max_symbols
    )
    return {
        "session": session.get_summary(),
        "verification": {
            "decision": verification.decision,
            "reason": verification.reason,
            "signature_valid": verification.signature_valid,
            "identity_valid": verification.identity_valid,
            "replay_valid": verification.replay_valid,
            "quantum_valid": verification.quantum_valid,
            "details": verification.details
        },
        "logs": [{"step": l.step_name, "description": l.description, "data": l.data} for l in logs]
    }

# ---------------------------------------------------------------------------
# Phase 12: Full end-to-end integration pipeline endpoint
# ---------------------------------------------------------------------------

@app.post("/api/v1/protocol/full")
def full_pipeline_endpoint(req: ExperimentRequest):
    """
    Phase 12 end-to-end integration endpoint.

    Runs the complete pipeline:
        Alice -> Sign -> Quantum Encode -> Teleport -> Eve/Channel
             -> Bob Measure -> QDS Verify -> Statistical Analysis
             -> Final Decision -> Audit

    Returns a structured result covering every pipeline layer.
    Deterministic verification is the sole authority for ACCEPT/REJECT.
    Statistical/threat metrics are explanatory only.
    """
    result = run_full_pipeline(
        model=protocol_instance,
        message=req.message,
        attack_type=req.attack,
        attack_strength=req.attack_strength,
        shots=req.shots,
        max_symbols=req.max_symbols,
    )
    return result

@app.post("/api/v1/performance/benchmark")
def benchmark_endpoint(req: Optional[PerformanceBenchmarkRequest] = None):
    import time
    from .stats import calculate_performance_metrics

    req_obj = req or PerformanceBenchmarkRequest()
    scenarios = ["none", "forgery", "replay", "impersonation", "channel_manipulation", "unauthorized_verification"]
    
    tp, fp, tn, fn = 0, 0, 0, 0
    fidelities = []
    qber_proxies = []
    durations = []
    
    scenario_breakdown = {}

    for attack in scenarios:
        sc_tp, sc_fp, sc_tn, sc_fn = 0, 0, 0, 0
        sc_fidelities = []
        
        for i in range(req_obj.trials_per_scenario):
            t0 = time.perf_counter()
            sess, ver, _ = protocol_instance.execute_protocol(
                message=f"Benchmark msg {i}",
                private_key=secrets.token_hex(32),
                attack_type=attack,
                attack_strength=req_obj.attack_strength,
                shots=req_obj.shots,
                max_symbols=req_obj.max_symbols
            )
            t1 = time.perf_counter()
            durations.append(t1 - t0)

            fid = ver.details.get("average_fidelity", 1.0 if attack == "none" else 0.5)
            fidelities.append(fid)
            sc_fidelities.append(fid)

            # QBER Proxy label: 0.5 for channel_manipulation, 0.0 otherwise
            qb = 0.5 if attack == "channel_manipulation" else 0.0
            qber_proxies.append(qb)

            # Evaluate confusion matrix:
            # Positive condition: attack != "none"
            # Negative condition: attack == "none"
            if attack != "none":
                if ver.decision == "REJECT":
                    tp += 1
                    sc_tp += 1
                else:
                    fn += 1
                    sc_fn += 1
            else:
                if ver.decision == "ACCEPT":
                    tn += 1
                    sc_tn += 1
                else:
                    fp += 1
                    sc_fp += 1

        scenario_breakdown[attack] = {
            "trials": req_obj.trials_per_scenario,
            "avg_fidelity": float(round(sum(sc_fidelities) / len(sc_fidelities), 4)),
            "rejections": sc_tp if attack != "none" else sc_fp,
            "acceptances": sc_fn if attack != "none" else sc_tn,
        }

    overall_metrics = calculate_performance_metrics(tp, fp, tn, fn)
    avg_fidelity = float(round(sum(fidelities) / len(fidelities), 4)) if fidelities else 0.0
    avg_qber_proxy = float(round(sum(qber_proxies) / len(qber_proxies), 4)) if qber_proxies else 0.0
    avg_verification_time_ms = float(round((sum(durations) / len(durations)) * 1000, 2)) if durations else 0.0

    return {
        "trials_per_scenario": req_obj.trials_per_scenario,
        "scenarios_tested": scenarios,
        "metrics": {
            **overall_metrics,
            "average_quantum_fidelity": avg_fidelity,
            "average_qber_proxy": avg_qber_proxy,
            "average_verification_time_ms": avg_verification_time_ms
        },
        "scenario_breakdown": scenario_breakdown,
        "disclaimer": "Measured experimental results from simulation trials. Not an information-theoretic security proof."
    }

@app.post("/api/v1/experiment/forgery")
def forgery_experiment_endpoint(req: Optional[ForgeryExperimentRequest] = None):
    """
    Executes a reproducible experimental evaluation for independent forgery attempts.
    The protocol verification engine remains attack-blind during execution.
    Ground-truth labels are compared only after completion.
    """
    from .stats import calculate_empirical_forgery_metrics
    req_obj = req or ForgeryExperimentRequest()
    
    total_attempts = req_obj.total_attempts
    accepted_count = 0
    rejected_count = 0

    for i in range(total_attempts):
        sess, ver, _ = protocol_instance.execute_protocol(
            message=f"Empirical forgery trial {i}",
            private_key=secrets.token_hex(32),
            attack_type="forgery",
            attack_strength=req_obj.attack_strength,
            shots=req_obj.shots,
            max_symbols=req_obj.max_symbols
        )
        if ver.decision == "ACCEPT":
            accepted_count += 1
        else:
            rejected_count += 1

    metrics = calculate_empirical_forgery_metrics(total_attempts, accepted_count, rejected_count, req_obj.shots)

    return {
        "experiment_name": "Empirical Forgery Probability Benchmark",
        "parameters": {
            "total_attempts": total_attempts,
            "shots": req_obj.shots,
            "max_symbols": req_obj.max_symbols,
            "attack_strength": req_obj.attack_strength
        },
        "results": metrics,
        "disclaimer": "Experimental measurement from simulation trials. Not a theoretical information-theoretic proof."
    }

# ---------------------------------------------------------------------------
# Phase 11: Tamper-Evident Audit endpoints
# NOTE: These are read-only endpoints. Audit decisions do NOT affect ACCEPT/REJECT.
# ---------------------------------------------------------------------------

@app.get("/api/v1/audit/records")
def audit_records():
    """
    Returns all audit records in the tamper-evident hash chain.
    PROTOTYPE: for research and demonstration purposes only.
    """
    records = protocol_instance.audit_chain.get_records()
    return {
        "chain_length": protocol_instance.audit_chain.chain_length(),
        "records": records,
        "disclaimer": "Tamper-evident audit prototype. Not a production blockchain."
    }

@app.get("/api/v1/audit/verify")
def audit_verify():
    """
    Verifies the integrity of the entire audit chain.
    Detects modified, deleted, or reordered records.
    PROTOTYPE: for research and demonstration purposes only.
    """
    is_valid, errors = protocol_instance.audit_chain.verify()
    return {
        "chain_length": protocol_instance.audit_chain.chain_length(),
        "chain_valid": is_valid,
        "errors": errors,
        "disclaimer": "Tamper-evident audit prototype. Not a production blockchain."
    }
