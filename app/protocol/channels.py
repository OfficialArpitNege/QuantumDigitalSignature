"""
Communication channels (Quantum & Classical) for QDS Protocol.
"""
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from .entities import Alice, Bob, Eve

@dataclass
class QuantumChannel:
    """
    Quantum channel carrying quantum states from Alice (sender) to Bob (receiver).
    Conceptually supports optional Eve interception or channel noise.
    """
    sender: Alice = field(default_factory=Alice)
    receiver: Bob = field(default_factory=Bob)
    interceptor: Optional[Eve] = None
    loss_rate: float = 0.0

    def transmit(self, state: Any, attack: str = "none", attack_strength: float = 0.0) -> Any:
        """
        Conceptually transmit a quantum state from Alice to Bob.
        If Eve is present and active, interception / attack logic can be applied here in future phases.
        """
        # Conceptual placeholder transmission logic for Phase 1 architecture
        return state

@dataclass
class ClassicalChannel:
    """
    Classical channel carrying protocol metadata, sessions, and non-quantum signature information between Alice and Bob.
    """
    messages: List[Dict[str, Any]] = field(default_factory=list)

    def send_message(self, sender: str, receiver: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Record and transmit a classical payload."""
        msg = {
            "sender": sender,
            "receiver": receiver,
            "payload": payload
        }
        self.messages.append(msg)
        return msg
