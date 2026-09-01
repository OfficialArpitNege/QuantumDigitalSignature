import hashlib
import hmac
import secrets

def sha256_bytes(message: str) -> bytes:
    return hashlib.sha256(message.encode("utf-8")).digest()

def new_nonce(nbytes: int = 16) -> str:
    return secrets.token_hex(nbytes)

def new_session_id() -> str:
    return secrets.token_urlsafe(18)

def signing_material(private_key: str, message_hash: bytes, nonce: str, session_id: str) -> bytes:
    payload = message_hash + nonce.encode() + session_id.encode()
    return hmac.new(private_key.encode(), payload, hashlib.sha256).digest()

def bits_from_bytes(data: bytes, limit: int) -> list[int]:
    bits = []
    for byte in data:
        for shift in range(7, -1, -1):
            bits.append((byte >> shift) & 1)
            if len(bits) >= limit:
                return bits
    return bits
