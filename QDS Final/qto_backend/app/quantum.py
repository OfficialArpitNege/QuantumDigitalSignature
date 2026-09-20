import math
# pyrefly: ignore [missing-import]
import numpy as np

# Pauli matrices & Identity operator
I = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)

# Entangled Bell Pair |Phi+> = (|00> + |11>) / sqrt(2)
BELL_PHI_PLUS = np.array([1, 0, 0, 1], dtype=complex) / math.sqrt(2)

# ---------------------------------------------------------------------------
# Pauli eigenstate ket vectors (analytic definitions)
# ---------------------------------------------------------------------------
# Z-basis eigenstates
KET_0 = np.array([1, 0], dtype=complex)          # |0> : eigenvalue +1 of Z
KET_1 = np.array([0, 1], dtype=complex)          # |1> : eigenvalue -1 of Z

# X-basis eigenstates
KET_PLUS  = np.array([1,  1], dtype=complex) / math.sqrt(2)  # |+> : eigenvalue +1 of X
KET_MINUS = np.array([1, -1], dtype=complex) / math.sqrt(2)  # |-> : eigenvalue -1 of X

# Y-basis eigenstates
KET_PLUS_I  = np.array([1,  1j], dtype=complex) / math.sqrt(2)  # |+i> : eigenvalue +1 of Y
KET_MINUS_I = np.array([1, -1j], dtype=complex) / math.sqrt(2)  # |-i> : eigenvalue -1 of Y

# Convenience registry  {axis -> (positive_eigenstate, negative_eigenstate)}
EIGENSTATES: dict = {
    "Z": (KET_0,      KET_1),
    "X": (KET_PLUS,   KET_MINUS),
    "Y": (KET_PLUS_I, KET_MINUS_I),
}

def state_from_angles(theta: float, phi: float = 0.0) -> np.ndarray:
    """
    Constructs a 1-qubit state vector |psi> = cos(theta/2)|0> + e^(i*phi)*sin(theta/2)|1>.
    """
    state = np.array([
        math.cos(theta / 2),
        np.exp(1j * phi) * math.sin(theta / 2)
    ], dtype=complex)
    norm = np.linalg.norm(state)
    return state / norm if norm else state

def angles_from_bit(bit: int) -> tuple[float, float]:
    """
    Encodes bit 0 -> theta=0 (|0>), bit 1 -> theta=pi (|1>).
    """
    return (0.0, 0.0) if bit == 0 else (math.pi, 0.0)

def density_matrix(state: np.ndarray) -> np.ndarray:
    """
    Constructs density matrix rho = |psi><psi|.
    """
    return np.outer(state, np.conjugate(state))

def bloch_expectations(state: np.ndarray) -> dict:
    """
    Calculates Bloch vector expectation values <X>, <Y>, <Z> for state |psi>.
    """
    rho = density_matrix(state)
    return {
        "X": float(np.real(np.trace(rho @ X))),
        "Y": float(np.real(np.trace(rho @ Y))),
        "Z": float(np.real(np.trace(rho @ Z))),
    }

def basis_projectors(axis: str) -> tuple[np.ndarray, np.ndarray]:
    """
    Returns projective eigenprojectors P+ and P- for axis in {'X', 'Y', 'Z'}.
    P_plus = (I + sigma) / 2
    P_minus = (I - sigma) / 2
    """
    sigma_map = {"X": X, "Y": Y, "Z": Z}
    sigma = sigma_map[axis.upper()]
    p_plus = 0.5 * (I + sigma)
    p_minus = 0.5 * (I - sigma)
    return p_plus, p_minus

def basis_probabilities(state: np.ndarray, axis: str) -> dict:
    """
    Calculates projective measurement probabilities P(+) and P(-) using P(outcome) = <psi|P|psi>.
    """
    rho = density_matrix(state)
    p_plus_proj, p_minus_proj = basis_projectors(axis)
    p_plus = float(np.real(np.trace(rho @ p_plus_proj)))
    p_minus = float(np.real(np.trace(rho @ p_minus_proj)))
    
    # Clip for numerical stability
    p_plus = float(np.clip(p_plus, 0.0, 1.0))
    p_minus = float(np.clip(p_minus, 0.0, 1.0))
    
    # Normalize
    total = p_plus + p_minus
    if total > 0:
        p_plus /= total
        p_minus /= total
        
    return {"+": p_plus, "-": p_minus}

def sample_measurement(state: np.ndarray, axis: str, shots: int, rng=None) -> dict:
    """
    Simulates projective measurements over N shots.
    """
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
    """
    Measures quantum state across X, Y, and Z bases.
    """
    return {axis: sample_measurement(state, axis, shots, rng) for axis in ("X", "Y", "Z")}

def fidelity_pure(a: np.ndarray, b: np.ndarray) -> float:
    """
    Calculates pure state fidelity F(a, b) = |<a|b>|^2.
    """
    return float(np.clip(abs(np.vdot(a, b)) ** 2, 0.0, 1.0))

def teleportation(theta: float, phi: float, rng=None) -> dict:
    """
    Standard Quantum Teleportation Protocol.
    Mathematical derivation:
    Input qubit |psi>_1 = alpha|0> + beta|1>
    Shared Bell pair |Phi+>_23 = (|00> + |11>) / sqrt(2)
    Total 3-qubit state |psi>_1 |Phi+>_23 expanded in the Bell basis of qubits 1 & 2:
      1/2 [ |Phi+>_12 |psi>_3 + |Psi+>_12 (X|psi>_3) + |Phi->_12 (Z|psi>_3) + |Psi->_12 (XZ|psi>_3) ]
    For any normalized state |psi>, the Born-rule measurement probability for each outcome m in {00, 01, 10, 11}
    is P(m) = |1/2|^2 * <psi|psi> = 1/4 = 0.25.
    
    Pauli Correction Mapping at Bob:
       '00' (|Phi+>) -> I  => I|psi> = |psi>
       '01' (|Psi+>) -> X  => X(X|psi>) = |psi>
       '10' (|Phi->) -> Z  => Z(Z|psi>) = |psi>
       '11' (|Psi->) -> ZX => ZX(XZ|psi>) = Z(XX)Z|psi> = Z(I)Z|psi> = Z^2|psi> = |psi>
    Bob's corrected state matches |psi> with fidelity = 1.0 (no noise).
    """
    rng = rng or np.random.default_rng()
    psi = state_from_angles(theta, phi)
    
    # Bell measurement outcome (each outcome 00, 01, 10, 11 has exact 0.25 probability)
    outcomes = ["00", "01", "10", "11"]
    outcome = outcomes[int(rng.integers(0, 4))]
    
    # Bob's received state prior to Pauli correction
    if outcome == "00":
        received = psi.copy()
    elif outcome == "01":
        received = X @ psi
    elif outcome == "10":
        received = Z @ psi
    elif outcome == "11":
        received = X @ (Z @ psi)
        
    # Bob applies Pauli correction mapping:
    # 00 -> I, 01 -> X, 10 -> Z, 11 -> ZX
    if outcome == "00":
        corrected = I @ received
    elif outcome == "01":
        corrected = X @ received
    elif outcome == "10":
        corrected = Z @ received
    elif outcome == "11":
        corrected = Z @ (X @ received)

    # Normalize to prevent accumulated floating point errors
    corrected = corrected / np.linalg.norm(corrected)

    return {
        "input_state": psi,
        "bell_state": BELL_PHI_PLUS,
        "bell_measurement": outcome,
        "received_state": received,
        "corrected_state": corrected,
        "fidelity": fidelity_pure(psi, corrected),
    }

def apply_attack(state: np.ndarray, attack: str, strength: float) -> np.ndarray:
    """
    Applies physically consistent attack operations to a quantum state vector.
    """
    strength = float(np.clip(strength, 0.0, 1.0))
    if attack in ("none", "replay") or strength == 0.0:
        return state.copy()

    if attack == "forgery":
        # Forgery attack rotates state around Y axis by angle = strength * pi
        angle = strength * math.pi
        ry = np.array([
            [math.cos(angle / 2), -math.sin(angle / 2)],
            [math.sin(angle / 2), math.cos(angle / 2)]
        ], dtype=complex)
        out = ry @ state

    elif attack == "channel_manipulation":
        # Bit-flip and phase-flip perturbation on channel (X and Z rotations)
        angle = strength * math.pi
        rz = math.cos(angle / 2) * I - 1j * math.sin(angle / 2) * Z
        rx = math.cos(angle / 2) * I - 1j * math.sin(angle / 2) * X
        out = rz @ rx @ state

    elif attack == "impersonation":
        # Impersonation introduces unitary rotation along both X and Y axes
        angle = strength * math.pi
        rx = math.cos(angle / 2) * I - 1j * math.sin(angle / 2) * X
        ry = np.array([
            [math.cos(angle / 2), -math.sin(angle / 2)],
            [math.sin(angle / 2), math.cos(angle / 2)]
        ], dtype=complex)
        out = rx @ ry @ state

    else:
        raise ValueError(f"Unknown attack type: {attack}")

    norm = np.linalg.norm(out)
    return out / norm if norm else state.copy()
