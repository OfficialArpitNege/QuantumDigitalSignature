"""
Formal Verification Model for the QDS Protocol (Phase 2).

Maintains strict separation between:
1. Deterministic Verification: Logical checks resulting strictly in ACCEPT or REJECT.
2. Statistical Threat Detection: Attack classification, anomaly scoring, and diagnostic evidence.
"""
from typing import Dict, Any, Literal, Optional
from dataclasses import dataclass, field

@dataclass
class VerificationResult:
    """
    Formal deterministic verification outcome for the QDS protocol.
    
    Decision rule:
    ACCEPT if signature_valid AND identity_valid AND replay_valid AND quantum_valid
    REJECT otherwise.
    """
    signature_valid: bool = False
    identity_valid: bool = False
    replay_valid: bool = False
    quantum_valid: bool = False
    decision: Literal["ACCEPT", "REJECT"] = "REJECT"
    reason: str = ""
    details: Dict[str, Any] = field(default_factory=dict)

    def evaluate(self) -> Literal["ACCEPT", "REJECT"]:
        """
        Evaluates and sets the final deterministic decision based on logical checks.
        """
        all_valid = (
            self.signature_valid and 
            self.identity_valid and 
            self.replay_valid and 
            self.quantum_valid
        )
        
        if all_valid:
            self.decision = "ACCEPT"
            self.reason = "All protocol verification checks passed."
        else:
            self.decision = "REJECT"
            failed_checks = []
            if not self.signature_valid:
                failed_checks.append("signature_valid=False")
            if not self.identity_valid:
                failed_checks.append("identity_valid=False")
            if not self.replay_valid:
                failed_checks.append("replay_valid=False")
            if not self.quantum_valid:
                failed_checks.append("quantum_valid=False")
            self.reason = f"Verification failed on: {', '.join(failed_checks)}"
            
        return self.decision


def evaluate_verification(
    signature_valid: bool,
    identity_valid: bool,
    replay_valid: bool,
    quantum_valid: bool,
    details: Optional[Dict[str, Any]] = None
) -> VerificationResult:
    """
    Helper function to instantiate and evaluate a formal VerificationResult.
    """
    result = VerificationResult(
        signature_valid=signature_valid,
        identity_valid=identity_valid,
        replay_valid=replay_valid,
        quantum_valid=quantum_valid,
        details=details or {}
    )
    result.evaluate()
    return result
