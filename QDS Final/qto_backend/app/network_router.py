"""
Network Router for Multi-Device Distributed Demo (Sender, Attacker, Receiver).
Allows 3 separate physical devices (phones, laptops, tablets) on the same Wi-Fi
to interactively participate in the QDS teleportation pipeline in real time.
"""

import time
import secrets
from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter

from .crypto import sha256_bytes
from .pipeline import run_full_pipeline

class TransmitRequest(BaseModel):
    message: str = "OFFICIAL TRANSACTION AUTHORIZATION #98241"
    shots: int = 2048
    max_symbols: int = 4

class InterceptRequest(BaseModel):
    attack_type: str = "channel_manipulation"  # "none" | "channel_manipulation" | "phase_flip" | "replay" | "forgery" | "impersonation"
    attack_strength: float = 0.65

class NetworkSession:
    def __init__(self):
        self.reset()

    def reset(self):
        self.session_id = secrets.token_hex(3).upper()
        self.status = "IDLE"  # "IDLE" | "TRANSMITTED" | "INTERCEPTED" | "VERIFIED"
        self.message = "PAYMENT VERIFICATION: 500,000 CREDITS TO NODE B"
        self.message_hash = ""
        self.shots = 2048
        self.max_symbols = 4
        self.created_at = time.time()
        self.sender_data: Dict[str, Any] = {}
        self.attacker_data: Dict[str, Any] = {
            "status": "idle",
            "attack_type": "none",
            "attack_strength": 0.0,
        }
        self.receiver_data: Dict[str, Any] = {}

    def to_dict(self):
        return {
            "session_id": self.session_id,
            "status": self.status,
            "message": self.message,
            "message_hash": self.message_hash,
            "shots": self.shots,
            "max_symbols": self.max_symbols,
            "sender": self.sender_data,
            "attacker": self.attacker_data,
            "receiver": self.receiver_data,
            "timestamp": time.time(),
        }

session = NetworkSession()
router = APIRouter(prefix="/api/v1/network", tags=["Distributed Demo"])

# Circular import safe reference to protocol_instance
_protocol_instance = None

def set_protocol_instance(instance):
    global _protocol_instance
    _protocol_instance = instance

@router.get("/state")
def get_network_state():
    return session.to_dict()

@router.post("/reset")
def reset_network_session():
    session.reset()
    return session.to_dict()

@router.post("/transmit")
def sender_transmit(req: TransmitRequest):
    session.message = req.message.strip() or "OFFICIAL MESSAGE #1"
    session.shots = req.shots
    session.max_symbols = req.max_symbols
    h = sha256_bytes(session.message)
    session.message_hash = h.hex()
    session.status = "TRANSMITTED"
    session.sender_data = {
        "status": "transmitted",
        "transmitted_at": time.time(),
        "message": session.message,
        "message_hash": session.message_hash,
        "max_symbols": session.max_symbols,
    }
    session.attacker_data = {
        "status": "awaiting_action",
        "attack_type": "none",
        "attack_strength": 0.0,
    }
    session.receiver_data = {
        "status": "waiting_reception",
    }
    return session.to_dict()

@router.post("/intercept")
def attacker_intercept(req: InterceptRequest):
    if session.status not in ("TRANSMITTED", "INTERCEPTED"):
        # If idle, auto-initialize transmission so attacker can still test
        h = sha256_bytes(session.message)
        session.message_hash = h.hex()
        session.sender_data = {
            "status": "auto_initialized",
            "message": session.message,
            "message_hash": session.message_hash,
        }

    session.attacker_data = {
        "status": "intercepted" if req.attack_type != "none" else "passed",
        "attack_type": req.attack_type,
        "attack_strength": req.attack_strength,
        "intercepted_at": time.time(),
    }
    session.status = "INTERCEPTED"
    return session.to_dict()

@router.post("/verify")
def receiver_verify():
    global _protocol_instance
    if _protocol_instance is None:
        from .protocol import QDSProtocolModel
        _protocol_instance = QDSProtocolModel()

    attack_type = session.attacker_data.get("attack_type", "none")
    attack_strength = session.attacker_data.get("attack_strength", 0.5)

    res = run_full_pipeline(
        model=_protocol_instance,
        message=session.message,
        attack_type=attack_type,
        attack_strength=attack_strength,
        shots=session.shots,
        max_symbols=session.max_symbols,
    )

    stats = res.get("statistical_analysis", {})
    qber = stats.get("qber_proxy", 0.0)
    fidelity = stats.get("average_fidelity", 1.0)
    tv_distance = stats.get("total_variation_distance", 0.0)
    threat = res.get("threat_assessment", {})
    audit = res.get("audit", {})
    latest_record = audit.get("latest_record", {})

    session.receiver_data = {
        "status": "verified",
        "verified_at": time.time(),
        "decision": res["verification"]["decision"],
        "reason": res["verification"]["reason"],
        "signature_valid": res["verification"]["signature_valid"],
        "identity_valid": res["verification"]["identity_valid"],
        "replay_valid": res["verification"]["replay_valid"],
        "quantum_valid": res["verification"]["quantum_valid"],
        "qber": qber,
        "fidelity": fidelity,
        "tv_distance": tv_distance,
        "threat_level": threat.get("threat_level", "LOW"),
        "classified_attack": threat.get("classified_attack", "none"),
        "audit_entry": {
            "entry_hash": latest_record.get("entry_hash", "SHA256-SEALED"),
            "timestamp": latest_record.get("timestamp", time.strftime("%Y-%m-%d %H:%M:%S")),
            "chain_length": audit.get("chain_length", 1),
        },
        "full_result": res,
    }
    session.status = "VERIFIED"
    return session.to_dict()
