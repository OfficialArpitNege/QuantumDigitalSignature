// ─────────────────────────────────────────────
// API Types — derived directly from backend source
// (app/models.py, app/main.py, app/detector.py)
// ─────────────────────────────────────────────

export type AttackType =
  | 'none'
  | 'forgery'
  | 'replay'
  | 'channel_manipulation'
  | 'impersonation';

// ── /api/v1/experiment ────────────────────────
export interface ExperimentRequest {
  message: string;
  attack: AttackType;
  attack_strength: number; // 0.0–1.0
  shots: number;           // 100–100000
  max_symbols: number;     // 1–8
}

export interface BlochExpectations {
  X: number;
  Y: number;
  Z: number;
}

// Evidence keys differ by attack type
export type EvidenceMap = Record<string, number>;

export interface DetectionResult {
  attack_type: AttackType;
  threat_score: number;      // 0–100
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidence: EvidenceMap;
  raw_vector_deviation: number;
  distribution_total_variation: number;
  jensen_shannon_divergence: number;
  note: string;
}

export interface ExperimentSymbolResult {
  index: number;
  source_bit: number;
  bell_measurement: string; // e.g. "01"
  fidelity: number;
  expected: BlochExpectations;
  observed: BlochExpectations;
  detection: DetectionResult;
}

export interface ExperimentResponse {
  message: string;
  message_hash_hex: string;
  attack: AttackType;
  attack_strength: number;
  shots: number;
  results: ExperimentSymbolResult[];
  note: string;
}

// ── /api/v1/sign ──────────────────────────────
export interface SignRequest {
  message: string;
  max_symbols: number;
  private_key?: string;
  nonce?: string;
  session_id?: string;
}

export interface QubitInfo {
  index: number;
  bit: number;
  theta: number;
  phi: number;
  state: [number, number][]; // [[real, imag], ...]
}

export interface SignResponse {
  message_hash_hex: string;
  nonce: string;
  session_id: string;
  signature_material_hex: string;
  qubits: QubitInfo[];
  prototype_note: string;
}

// ── /api/v1/teleport ──────────────────────────
export interface TeleportRequest {
  theta: number;
  phi: number;
  shots: number;
  attack: AttackType;
  attack_strength: number;
}

export interface MeasurementAxis {
  expectation: number;
  counts: { '+': number; '-': number };
  probabilities: { '+': number; '-': number };
  shots: number;
  plus_ci95: [number, number];
}

export interface TeleportResponse {
  input_state: [number, number][];
  bell_state: [number, number][];
  bell_measurement: string;
  received_state: [number, number][];
  corrected_state: [number, number][];
  observed_state: [number, number][];
  fidelity_after_attack: number;
  expected_measurements: { X: MeasurementAxis; Y: MeasurementAxis; Z: MeasurementAxis };
  observed_measurements: { X: MeasurementAxis; Y: MeasurementAxis; Z: MeasurementAxis };
  attack: AttackType;
  attack_strength: number;
}

// ── /api/v1/attack ────────────────────────────
export interface AttackRequest {
  theta: number;
  phi: number;
  attack: AttackType;
  strength: number;
  shots: number;
}

export interface AttackResponse {
  attack: AttackType;
  strength: number;
  expected_measurements: { X: MeasurementAxis; Y: MeasurementAxis; Z: MeasurementAxis };
  observed_measurements: { X: MeasurementAxis; Y: MeasurementAxis; Z: MeasurementAxis };
  fidelity: number;
  states: {
    expected: [number, number][];
    observed: [number, number][];
  };
}

// ── /health ───────────────────────────────────
export interface HealthResponse {
  status: string;
  service: string;
}
