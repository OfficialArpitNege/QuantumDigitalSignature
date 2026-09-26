"""
Session model for QDS Protocol communication.
"""
from typing import Optional, Dict, Any
from dataclasses import dataclass, field
import uuid
import datetime

from .entities import Alice, Bob, Eve
from .channels import QuantumChannel, ClassicalChannel
from .verification import VerificationResult

@dataclass
class Session:
    """
    Represents one QDS communication session between Alice and Bob, 
    tracking quantum/classical channels, metadata, nonces, and verification results.
    """
    session_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    nonce: Optional[str] = None
    sender: Alice = field(default_factory=Alice)
    receiver: Bob = field(default_factory=Bob)
    attacker: Optional[Eve] = None
    message: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)
    attack_info: Optional[Dict[str, Any]] = None
    quantum_channel: QuantumChannel = field(default_factory=QuantumChannel)
    classical_channel: ClassicalChannel = field(default_factory=ClassicalChannel)
    verification_result: Optional[VerificationResult] = None
    created_at: str = field(default_factory=lambda: datetime.datetime.utcnow().isoformat())

    def get_summary(self) -> Dict[str, Any]:
        """Return a clean summary dictionary of the session state."""
        return {
            "session_id": self.session_id,
            "nonce": self.nonce,
            "sender": self.sender.name,
            "receiver": self.receiver.name,
            "has_attacker": self.attacker is not None and self.attacker.active,
            "message": self.message,
            "created_at": self.created_at,
            "metadata": self.metadata,
            "attack_info": self.attack_info,
            "verification_decision": self.verification_result.decision if self.verification_result else None
        }
