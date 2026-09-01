import math
import numpy as np

I = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)

def state_from_angles(theta: float, phi: float = 0.0) -> np.ndarray:
    return np.array([
        math.cos(theta / 2),
        np.exp(1j * phi) * math.sin(theta / 2)
    ], dtype=complex)

def angles_from_bit(bit: int) -> tuple[float, float]:
    return (0.0, 0.0) if bit == 0 else (math.pi, 0.0)

def bloch_expectations(state: np.ndarray) -> dict:
    rho = np.outer(state, np.conjugate(state))
    return {
        "X": float(np.real(np.trace(rho @ X))),
        "Y": float(np.real(np.trace(rho @ Y))),
        "Z": float(np.real(np.trace(rho @ Z))),
    }

def basis_probabilities(state: np.ndarray, axis: str) -> dict:
    e = bloch_expectations(state)[axis]
    p_plus  = float(np.clip((1 + e) / 2, 0.0, 1.0))
    p_minus = float(np.clip((1 - e) / 2, 0.0, 1.0))
    return {"+": p_plus, "-": p_minus}

def sample_measurement(state: np.ndarray, axis: str, shots: int, rng=None) -> dict:
    rng = rng or np.random.default_rng()
    p = basis_probabilities(state, axis)
    plus = int(rng.binomial(shots, p["+"]))
    minus = shots - plus
    expectation = (plus - minus) / shots
    return {
        "axis": axis,
        "shots": shots,
        "counts": {"+": plus, "-": minus},
        "probabilities": {"+": plus / shots, "-": minus / shots},
        "expectation": float(expectation),
    }

def measure_xyz(state: np.ndarray, shots: int, rng=None) -> dict:
    return {axis: sample_measurement(state, axis, shots, rng) for axis in ("X", "Y", "Z")}

def fidelity_pure(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.clip(abs(np.vdot(a, b)) ** 2, 0.0, 1.0))

def teleportation(theta: float, phi: float, rng=None) -> dict:
    rng = rng or np.random.default_rng()
    psi = state_from_angles(theta, phi)
    outcome = ["00", "01", "10", "11"][int(rng.integers(0, 4))]
    m1, m2 = int(outcome[0]), int(outcome[1])

    received = psi.copy()
    if m1:
        received = Z @ received
    if m2:
        received = X @ received

    corrected = X @ received if m2 else received
    corrected = Z @ corrected if m1 else corrected

    bell = np.array([1, 0, 0, 1], dtype=complex) / math.sqrt(2)
    return {
        "input_state": psi,
        "bell_state": bell,
        "bell_measurement": outcome,
        "received_state": received,
        "corrected_state": corrected,
        "fidelity": fidelity_pure(psi, corrected),
    }

def apply_attack(state: np.ndarray, attack: str, strength: float) -> np.ndarray:
    strength = float(np.clip(strength, 0, 1))
    if attack == "none" or attack == "replay":
        return state.copy()

    if attack == "forgery":
        angle = strength * math.pi
        ry = np.array([
            [math.cos(angle / 2), -math.sin(angle / 2)],
            [math.sin(angle / 2), math.cos(angle / 2)]
        ], dtype=complex)
        out = ry @ state

    elif attack == "channel_manipulation":
        angle = strength * math.pi
        rx = math.cos(angle / 2) * I - 1j * math.sin(angle / 2) * X
        out = rx @ state

    elif attack == "impersonation":
        angle = strength * math.pi
        rx = math.cos(angle / 2) * I - 1j * math.sin(angle / 2) * X
        ry = np.array([
            [math.cos(angle / 2), -math.sin(angle / 2)],
            [math.sin(angle / 2), math.cos(angle / 2)]
        ], dtype=complex)
        out = rx @ ry @ state

    else:
        raise ValueError(f"Unknown attack: {attack}")

    norm = np.linalg.norm(out)
    return out / norm if norm else state.copy()
