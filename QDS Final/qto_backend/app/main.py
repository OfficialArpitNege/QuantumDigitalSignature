import secrets
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import SignRequest, TeleportRequest, MeasurementRequest, AttackRequest, AnalyzeRequest, ExperimentRequest
from .crypto import sha256_bytes, new_nonce, new_session_id, signing_material, bits_from_bytes
from .quantum import state_from_angles, angles_from_bit, measure_xyz, teleportation, apply_attack, fidelity_pure, bloch_expectations
from .stats import confidence_interval_95
from .detector import detect

app = FastAPI(
    title="Quantum Threat Observatory Backend",
    version="0.1.0",
    description="Research prototype for teleportation-based quantum-signature simulation and statistical threat detection."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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
