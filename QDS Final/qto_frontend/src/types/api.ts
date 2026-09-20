// ─────────────────────────────────────────────
// API Types — derived directly from backend source
// (app/models.py, app/main.py, app/detector.py, app/pipeline.py)
// ─────────────────────────────────────────────

export type AttackType =
  | 'none'
  | 'forgery'
  | 'replay'
  | 'channel_manipulation'
  | 'impersonation'
  | 'unauthorized_verification';

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
  attack_type: string;
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

// ── /api/v1/protocol/execute (backward compat) ─
export interface ProtocolVerificationResult {
  decision: 'ACCEPT' | 'REJECT';
  reason: string;
  signature_valid: boolean;
  identity_valid: boolean;
  replay_valid: boolean;
  quantum_valid: boolean;
  details: Record<string, unknown>;
}

export interface ProtocolLog {
  step: string;
  description: string;
  data: Record<string, unknown>;
}

export interface ProtocolExecuteResponse {
  session: Record<string, unknown>;
  verification: ProtocolVerificationResult;
  logs: ProtocolLog[];
}

// ── /api/v1/protocol/full (Phase 12 — primary) ─
export interface FullPipelineSession {
  session_id: string;
  nonce: string;
  sender: string;
  receiver: string;
  has_attacker: boolean;
  created_at: string;
}

export interface FullPipelineSignature {
  message: string;
  message_hash_hex: string;
  max_symbols: number;
  attack_type: string;
  attack_strength: number;
}

export interface FullPipelineQuantumTransmission {
  qubits_transmitted: number;
  shots_per_qubit: number;
  average_fidelity: number;
  fidelity_threshold: number;
  per_qubit_fidelities: number[];
  qubit_details: Array<{
    bit_index: number;
    input_bit: number;
    bell_measurement: string;
    fidelity: number;
  }>;
}

export interface FullPipelineStatisticalAnalysis {
  label: string;
  qber_proxy: number;
  average_fidelity: number;
  vector_deviation: number;
  total_variation_distance: number;
  jensen_shannon_divergence: number;
  standard_error: number;
  confidence_interval_95: [number, number];
}

export interface FullPipelineThreatAssessment {
  label: string;
  classified_attack: string;
  threat_score: number;
  threat_level: string;
  evidence: Record<string, number>;
}

export interface FullPipelineAuditRecord {
  sequence: number;
  event_data: {
    audit_schema_version: string;
    timestamp: string;
    session_id: string;
    sender: string;
    receiver: string;
    message_hash_hex: string;
    signature_valid: boolean;
    identity_valid: boolean;
    replay_valid: boolean;
    quantum_valid: boolean;
    decision: string;
    attack_type: string;
  };
  previous_hash: string;
  current_hash: string;
}

export interface FullPipelineAudit {
  chain_length: number;
  latest_record: FullPipelineAuditRecord | null;
  label: string;
}

export interface FullPipelineResponse {
  pipeline_version: string;
  session: FullPipelineSession;
  signature: FullPipelineSignature;
  quantum_transmission: FullPipelineQuantumTransmission;
  statistical_analysis: FullPipelineStatisticalAnalysis;
  verification: ProtocolVerificationResult;
  threat_assessment: FullPipelineThreatAssessment;
  audit: FullPipelineAudit;
  logs: ProtocolLog[];
  execution_time_ms: number;
  disclaimer: string;
}

// ── Research Evaluation & Benchmark Types (Phase 15) ────────
export interface BenchmarkMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  detection_rate: number;
  forgery_detection_rate: number;
  far: number;
  frr: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  total_samples: number;
  average_quantum_fidelity: number;
  average_qber_proxy: number;
  average_verification_time_ms: number;
}

export interface ScenarioBreakdownItem {
  trials: number;
  avg_fidelity: number;
  rejections: number;
  acceptances: number;
}

export interface PerformanceBenchmarkResponse {
  trials_per_scenario: number;
  scenarios_tested: string[];
  metrics: BenchmarkMetrics;
  scenario_breakdown: Record<string, ScenarioBreakdownItem>;
  disclaimer: string;
}

export interface ForgeryBenchmarkResults {
  total_forgery_attempts: number;
  successful_forgery_accepts: number;
  detected_forgery_rejects: number;
  empirical_forgery_probability: number;
  forgery_detection_rate: number;
  false_acceptance_rate: number;
  confidence_interval: [number, number];
  confidence_level: number;
  sample_size: number;
  sample_size_label: string;
  description: string;
  interpretation_note: string;
}

export interface ForgeryBenchmarkResponse {
  experiment_name: string;
  parameters: {
    total_attempts: number;
    shots: number;
    max_symbols: number;
    attack_strength: number;
  };
  results: ForgeryBenchmarkResults;
  disclaimer: string;
}

