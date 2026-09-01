import math
import numpy as np

def safe_probs(p: dict, keys: list[str]) -> np.ndarray:
    x = np.array([max(float(p.get(k, 0.0)), 0.0) for k in keys], dtype=float)
    s = x.sum()
    return x / s if s else np.ones(len(keys)) / len(keys)

def total_variation(p: dict, q: dict) -> float:
    keys = sorted(set(p) | set(q))
    return float(0.5 * np.sum(np.abs(safe_probs(p, keys) - safe_probs(q, keys))))

def kl_divergence(p: np.ndarray, q: np.ndarray, eps: float = 1e-12) -> float:
    p = np.clip(p, eps, None); p = p / p.sum()
    q = np.clip(q, eps, None); q = q / q.sum()
    return float(np.sum(p * np.log2(p / q)))

def js_divergence(p: dict, q: dict) -> float:
    keys = sorted(set(p) | set(q))
    pp = safe_probs(p, keys)
    qq = safe_probs(q, keys)
    m = 0.5 * (pp + qq)
    return 0.5 * kl_divergence(pp, m) + 0.5 * kl_divergence(qq, m)

def vector_deviation(expected: dict, observed: dict) -> float:
    keys = ["X", "Y", "Z"]
    e = np.array([expected[k] for k in keys], dtype=float)
    o = np.array([observed[k] for k in keys], dtype=float)
    return float(np.linalg.norm(e - o))

def standard_error(probability: float, shots: int) -> float:
    p = float(np.clip(probability, 0, 1))
    return math.sqrt(p * (1 - p) / max(shots, 1))

def confidence_interval_95(probability: float, shots: int) -> tuple[float, float]:
    p = float(np.clip(probability, 0, 1))
    se = standard_error(p, shots)
    return (max(0.0, p - 1.96 * se), min(1.0, p + 1.96 * se))

def qber(expected_bits: list[int], observed_bits: list[int]) -> float:
    if len(expected_bits) != len(observed_bits) or not expected_bits:
        return 0.0
    return sum(a != b for a, b in zip(expected_bits, observed_bits)) / len(expected_bits)

def weighted_score(values: dict, weights: dict) -> float:
    total_w = sum(weights.values())
    if total_w <= 0:
        return 0.0
    return float(np.clip(sum(values.get(k, 0.0) * w for k, w in weights.items()) / total_w, 0, 1))
