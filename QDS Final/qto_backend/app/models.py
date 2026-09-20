from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field

AttackType = Literal["none", "forgery", "replay", "channel_manipulation", "impersonation"]

class SignRequest(BaseModel):
    message: str = Field(min_length=1)
    private_key: Optional[str] = None
    nonce: Optional[str] = None
    session_id: Optional[str] = None
    max_symbols: int = Field(default=8, ge=1, le=32)

class TeleportRequest(BaseModel):
    theta: float
    phi: float = 0.0
    shots: int = Field(default=1024, ge=100, le=100000)
    attack: AttackType = "none"
    attack_strength: float = Field(default=0.0, ge=0.0, le=1.0)

class MeasurementRequest(BaseModel):
    theta: float
    phi: float = 0.0
    shots: int = Field(default=1024, ge=100, le=100000)

class AttackRequest(BaseModel):
    theta: float
    phi: float = 0.0
    attack: AttackType
    strength: float = Field(default=0.25, ge=0.0, le=1.0)
    shots: int = Field(default=1024, ge=100, le=100000)

class AnalyzeRequest(BaseModel):
    expected: Dict[str, float]
    observed: Dict[str, float]
    expected_probs: Optional[Dict[str, float]] = None
    observed_probs: Optional[Dict[str, float]] = None
    qber: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    fidelity: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    forgery_probability: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    verification_success_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    identity_failure_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    duplicate_detected: bool = False
    freshness_ok: bool = True
    attack_type: AttackType = "none"

class ExperimentRequest(BaseModel):
    message: str = Field(min_length=1)
    attack: AttackType = "none"
    attack_strength: float = Field(default=0.25, ge=0.0, le=1.0)
    shots: int = Field(default=2048, ge=100, le=100000)
    max_symbols: int = Field(default=4, ge=1, le=8)

class PerformanceBenchmarkRequest(BaseModel):
    trials_per_scenario: int = Field(default=10, ge=1, le=100)
    shots: int = Field(default=1024, ge=100, le=10000)
    max_symbols: int = Field(default=4, ge=1, le=8)
    attack_strength: float = Field(default=0.5, ge=0.0, le=1.0)

class ForgeryExperimentRequest(BaseModel):
    total_attempts: int = Field(default=50, ge=0, le=1000)
    shots: int = Field(default=1024, ge=100, le=10000)
    max_symbols: int = Field(default=4, ge=1, le=8)
    attack_strength: float = Field(default=0.5, ge=0.0, le=1.0)


