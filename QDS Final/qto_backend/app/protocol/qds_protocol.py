"""
Formal QDS Protocol Pipeline (Phase 5 Attack Models Integration).

Sequence of formal steps:
1. Session Initialization & Identity Resolution (Alice, Bob, Eve, or Unauthorized Entities).
2. Alice Signature Generation & Quantum Encoding.
3. Quantum State Transmission over QuantumChannel with optional Attack Injection (Eve / Channel Noise).
4. Receiver Reception & X, Y, Z Projective Measurements.
5. Deterministic Verification: ACCEPT iff (signature_valid AND identity_valid AND replay_valid AND quantum_valid), else REJECT.
6. (Phase 11) Tamper-Evident Audit: Append one AuditRecord per execution to the hash chain.
"""
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field

from .entities import Alice, Bob, Eve, QUANTUM_VERIFICATION_FIDELITY_THRESHOLD
from .channels import QuantumChannel, ClassicalChannel
from .session import Session
from .verification import VerificationResult, evaluate_verification

try:
    from app.crypto import new_nonce, new_session_id, sha256_bytes, signing_material, bits_from_bytes
    from app.quantum import angles_from_bit, teleportation, apply_attack, fidelity_pure
    from app.audit import AuditChain, build_protocol_audit_event
except (ImportError, ValueError):
    from ..crypto import new_nonce, new_session_id, sha256_bytes, signing_material, bits_from_bytes
    from ..quantum import angles_from_bit, teleportation, apply_attack, fidelity_pure
    from ..audit import AuditChain, build_protocol_audit_event

@dataclass
class ProtocolStepLog:
    step_name: str
    description: str
    data: Dict[str, Any] = field(default_factory=dict)

class QDSProtocolModel:
    """
    Formal implementation of the teleportation-based QDS protocol workflow supporting controlled attack simulations.
    """
    def __init__(self, alice: Optional[Alice] = None, bob: Optional[Bob] = None, eve: Optional[Eve] = None):
        self.alice = alice or Alice()
        self.bob = bob or Bob()
        self.eve = eve or Eve()
        self.seen_nonces: set = set()
        # Phase 11: tamper-evident audit chain (separate from verification logic)
        self._audit_chain: AuditChain = AuditChain()

    @property
    def audit_chain(self) -> AuditChain:
        """Read-only access to the protocol's tamper-evident audit chain."""
        return self._audit_chain

    def execute_protocol(
        self,
        message: str,
        private_key: str,
        nonce: Optional[str] = None,
        session_id: Optional[str] = None,
        sender: Optional[Any] = None,
        receiver: Optional[Any] = None,
        attack_type: str = "none",
        attack_strength: float = 0.5,
        shots: int = 1024,
        max_symbols: int = 4
    ) -> Tuple[Session, VerificationResult, List[ProtocolStepLog]]:
        """
        Executes the QDS protocol flow with controlled attack injection and evaluates deterministic verification.
        """
        logs: List[ProtocolStepLog] = []

        # 1. Session Setup & Entity Resolution
        # In replay attack scenario, the attack simulator re-injects a previously seen nonce
        if attack_type == "replay":
            if not hasattr(self, "_last_replay_nonce") or self._last_replay_nonce not in self.seen_nonces:
                # Store a dummy nonce into seen_nonces so this call will re-use a known duplicate
                dup_nonce = "replay-nonce-" + new_nonce(8)
                self.seen_nonces.add(dup_nonce)
                self._last_replay_nonce = dup_nonce
            current_nonce = self._last_replay_nonce
        else:
            current_nonce = nonce or new_nonce()

        current_session_id = session_id or new_session_id()

        # Resolve effective sender & receiver based on input or attack mode
        if attack_type == "impersonation":
            # Eve attempts to act as sender
            effective_sender = Eve(name="Eve", active=True, attack_type="impersonation", attack_strength=attack_strength)
        else:
            effective_sender = sender or self.alice

        if attack_type == "unauthorized_verification":
            # Unauthorized entity attempts to receive and verify
            effective_receiver = Bob(name="UnauthorizedEntity", identity="unauthorized-key")
        else:
            effective_receiver = receiver or self.bob

        effective_attacker = self.eve if (attack_type != "none" or isinstance(effective_sender, Eve)) else None

        session = Session(
            session_id=current_session_id,
            nonce=current_nonce,
            sender=effective_sender,
            receiver=effective_receiver,
            attacker=effective_attacker,
            message=message,
            attack_info={"attack_type": attack_type, "attack_strength": attack_strength} if attack_type != "none" else None
        )
        logs.append(ProtocolStepLog(
            "1. Session Setup",
            f"Initialized session (Sender: {effective_sender.name}, Receiver: {effective_receiver.name}, Attack: {attack_type})",
            {"session_id": current_session_id, "nonce": current_nonce, "attack_type": attack_type}
        ))

        # 2. Alice Signature Generation & Quantum Encoding
        sig_data = self.alice.prepare_signature(
            message=message,
            private_key=private_key,
            nonce=current_nonce,
            session_id=current_session_id,
            max_symbols=max_symbols
        )
        sig_bits = sig_data["bits"]
        
        # In case of Forgery attack, Eve tampers with signature material
        if attack_type == "forgery":
            tampered_bits = [(b ^ 1) for b in sig_bits] # Invert signature bits
        else:
            tampered_bits = sig_bits

        expected_quantum_states = self.alice.encode_quantum_states(sig_bits)
        transmitted_quantum_states = self.alice.encode_quantum_states(tampered_bits)

        logs.append(ProtocolStepLog(
            "2. Signature & Quantum Encoding",
            "Generated SHA-256 hash and HMAC signature bits; encoded qubit states",
            {"original_bits": sig_bits, "tampered_bits": tampered_bits if attack_type == "forgery" else sig_bits}
        ))

        # 3. Quantum Teleportation & Channel Transmission with Attack Injection
        qubit_teleportations = []
        received_states = []

        for idx, bit in enumerate(tampered_bits):
            theta, phi = angles_from_bit(bit)
            
            # Quantum teleportation through Bell EPR pair + Pauli correction
            tele = teleportation(theta, phi)
            corrected_state = tele["corrected_state"]

            # Apply Quantum Channel Attack (e.g. channel_manipulation, forgery, impersonation)
            if attack_type in ("channel_manipulation", "forgery", "impersonation") and attack_strength > 0.0:
                observed_state = apply_attack(corrected_state, attack_type, attack_strength)
            else:
                observed_state = corrected_state

            received_states.append(observed_state)
            qubit_teleportations.append({
                "bit_index": idx,
                "input_bit": bit,
                "bell_measurement": tele["bell_measurement"],
                "fidelity": fidelity_pure(expected_quantum_states[idx], observed_state)
            })

        logs.append(ProtocolStepLog(
            "3. Quantum Teleportation Channel",
            "Teleported qubits over QuantumChannel with Pauli correction and attack injection",
            {"qubits": qubit_teleportations}
        ))

        # 4. Receiver Projective Measurement & Quantum State Verification
        receiver_measurements = self.bob.measure_states(received_states, shots=shots)
        
        fidelity_valid, fidelities, avg_fidelity = self.bob.verify_quantum_states(
            expected_states=expected_quantum_states,
            received_states=received_states,
            threshold=QUANTUM_VERIFICATION_FIDELITY_THRESHOLD
        )
        
        logs.append(ProtocolStepLog(
            "4. Receiver Reception & Measurement",
            "Receiver measured qubits across X, Y, Z bases and verified state fidelity",
            {"average_fidelity": avg_fidelity, "fidelity_valid": fidelity_valid}
        ))

        # 5. Deterministic Verification Checks
        # a) Signature Valid: Verify transmitted/received signature bits against expected HMAC bits computed from message & private key
        expected_sig_material = signing_material(private_key, sha256_bytes(message), current_nonce, current_session_id)
        expected_sig_bits = bits_from_bytes(expected_sig_material, max_symbols)
        received_sig_bits = tampered_bits
        signature_valid = (received_sig_bits == expected_sig_bits)

        # b) Identity Valid: Sender must be Alice and Receiver must be Bob
        sender_is_alice = (effective_sender.name == "Alice" and getattr(effective_sender, "identity", "") == self.alice.identity)
        receiver_is_bob = (effective_receiver.name == "Bob" and getattr(effective_receiver, "identity", "") == self.bob.identity)
        identity_valid = sender_is_alice and receiver_is_bob

        # c) Replay Valid: Nonce freshness check (if nonce has been seen before, fail freshness check)
        freshness_ok = current_nonce not in self.seen_nonces
        replay_valid = freshness_ok
        if freshness_ok:
            self.seen_nonces.add(current_nonce)

        # d) Quantum Valid: State fidelity verification
        quantum_valid = fidelity_valid

        # Evaluate final deterministic ACCEPT / REJECT
        verification_result = evaluate_verification(
            signature_valid=signature_valid,
            identity_valid=identity_valid,
            replay_valid=replay_valid,
            quantum_valid=quantum_valid,
            details={
                "average_fidelity": avg_fidelity,
                "fidelities": fidelities,
                "fidelity_threshold": QUANTUM_VERIFICATION_FIDELITY_THRESHOLD,
                "attack_strength": attack_strength
            }
        )

        session.verification_result = verification_result
        logs.append(ProtocolStepLog(
            "5. Deterministic Verification",
            f"Evaluated ACCEPT/REJECT decision: {verification_result.decision}",
            {"decision": verification_result.decision, "reason": verification_result.reason}
        ))

        # 6. Phase 11: Append tamper-evident audit record (does NOT affect decision)
        message_hash_hex = sha256_bytes(message).hex()
        audit_event = build_protocol_audit_event(
            session_id=current_session_id,
            sender=effective_sender.name,
            receiver=effective_receiver.name,
            message_hash_hex=message_hash_hex,
            signature_valid=verification_result.signature_valid,
            identity_valid=verification_result.identity_valid,
            replay_valid=verification_result.replay_valid,
            quantum_valid=verification_result.quantum_valid,
            decision=verification_result.decision,
            attack_type=attack_type,
        )
        self._audit_chain.record_event(audit_event)
        logs.append(ProtocolStepLog(
            "6. Audit Record",
            "Appended tamper-evident audit record to hash chain (prototype)",
            {"audit_sequence": self._audit_chain.chain_length() - 1,
             "audit_chain_tip": self._audit_chain.get_records()[-1]["current_hash"]}
        ))

        return session, verification_result, logs
