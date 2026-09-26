"""
Protocol entities (Alice, Bob, Eve) for QDS Architecture.
"""
from typing import Optional, Dict, Any, List, Tuple
from dataclasses import dataclass, field
import numpy as np

try:
    from app.crypto import sha256_bytes, signing_material, bits_from_bytes
    from app.quantum import state_from_angles, angles_from_bit, measure_xyz, fidelity_pure
except (ImportError, ValueError):
    # pyrefly: ignore [missing-import]
    from ..crypto import sha256_bytes, signing_material, bits_from_bytes
    # pyrefly: ignore [missing-import]
    from ..quantum import state_from_angles, angles_from_bit, measure_xyz, fidelity_pure

# A numerical verification tolerance used by the prototype (not an information-theoretic security claim)
QUANTUM_VERIFICATION_FIDELITY_THRESHOLD = 0.99

@dataclass
class Alice:
    """Legitimate Sender in the QDS Protocol."""
    name: str = "Alice"
    identity: str = "alice-identity-key"

    def __post_init__(self):
        if not self.identity:
            self.identity = "alice-identity-key"

    def prepare_signature(self, message: str, private_key: str, nonce: str, session_id: str, max_symbols: int = 4) -> Dict[str, Any]:
        """
        Hashes message with SHA-256 and generates HMAC signature bits.
        """
        msg_hash = sha256_bytes(message)
        sig_material = signing_material(private_key, msg_hash, nonce, session_id)
        sig_bits = bits_from_bytes(sig_material, max_symbols)
        return {
            "message_hash": msg_hash,
            "signature_material": sig_material,
            "bits": sig_bits
        }

    def encode_quantum_states(self, bits: List[int]) -> List[np.ndarray]:
        """
        Encodes each classical signature bit into a quantum state vector.
        """
        states = []
        for bit in bits:
            theta, phi = angles_from_bit(bit)
            state = state_from_angles(theta, phi)
            states.append(state)
        return states

@dataclass
class Bob:
    """Legitimate Receiver in the QDS Protocol."""
    name: str = "Bob"
    identity: str = "bob-identity-key"

    def __post_init__(self):
        if not self.identity:
            self.identity = "bob-identity-key"

    def measure_states(self, states: List[np.ndarray], shots: int = 1024) -> List[Dict[str, Any]]:
        """
        Performs X, Y, Z projective measurements on received quantum states.
        """
        return [measure_xyz(st, shots) for st in states]

    def verify_quantum_states(
        self, 
        expected_states: List[np.ndarray], 
        received_states: List[np.ndarray], 
        threshold: float = QUANTUM_VERIFICATION_FIDELITY_THRESHOLD
    ) -> Tuple[bool, List[float], float]:
        """
        Verifies received quantum states against Alice's expected states using state fidelity.
        Does not use raw floating-point amplitude equality.
        Returns (is_valid, individual_fidelities, average_fidelity).
        """
        if len(expected_states) != len(received_states) or not expected_states:
            return False, [], 0.0

        fidelities = [
            fidelity_pure(exp, rec) 
            for exp, rec in zip(expected_states, received_states)
        ]
        avg_fidelity = sum(fidelities) / len(fidelities)
        is_valid = all(f >= threshold for f in fidelities)
        
        return is_valid, fidelities, avg_fidelity

@dataclass
class Eve:
    """Optional Attacker/Eavesdropper in the QDS Protocol."""
    name: str = "Eve"
    active: bool = False
    attack_type: str = "none"
    attack_strength: float = 0.0
