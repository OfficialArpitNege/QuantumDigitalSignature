# Quantum Threat Observatory (QTO) — Research Backend

A research/demo backend for the teleportation-based quantum-signature workflow discussed for the SIH project.

## Scope
This is a research prototype/simulator, not a formally proven production QDS protocol.
It separates:
1. message/signing-material preparation,
2. quantum-state encoding,
3. Bell-pair generation and teleportation,
4. measurement,
5. attack simulation,
6. statistical threat analysis.

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Windows activation:
```powershell
.venv\Scripts\activate
```

Open http://127.0.0.1:8000/docs

## Flow
Message -> SHA-256 -> HMAC-based signing material -> qubit encoding
-> Bell pair -> teleportation -> measurement
-> expected/observed statistics -> attack-specific metrics.

## Formula map

h = SHA256(M)

s = HMAC-SHA256(K_priv, h || nonce || session_id)

|psi> = cos(theta/2)|0> + exp(i phi) sin(theta/2)|1>

<X> = sin(theta) cos(phi)
<Y> = sin(theta) sin(phi)
<Z> = cos(theta)

|Phi+> = (|00> + |11>)/sqrt(2)

|Psi> = 1/2 [ |00>|psi> + |01>X|psi> + |10>Z|psi> + |11>XZ|psi> ]

Correction: X^m2 Z^m1

QBER = N_errors / N_total

F = |<psi_expected|psi_observed>|^2

D_TV = 1/2 sum_i |p_i - q_i|

JSD(P,Q) = 1/2 KL(P||M) + 1/2 KL(Q||M), M=(P+Q)/2

Thresholds and weights in the detector are prototype defaults and must be calibrated experimentally.
