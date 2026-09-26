import type {
  HealthResponse,
  ExperimentRequest,
  ExperimentResponse,
  SignRequest,
  SignResponse,
  TeleportRequest,
  TeleportResponse,
  ProtocolExecuteResponse,
  FullPipelineResponse,
  PerformanceBenchmarkResponse,
  ForgeryBenchmarkResponse,
} from '../types/api';
const defaultHost = typeof window !== 'undefined' && window.location.hostname
  ? (window.location.port === '5173' ? `http://${window.location.hostname}:8000` : '')
  : '';
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || defaultHost;

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (err?.detail) detail = String(err.detail);
    } catch {}
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  checkHealth: () => get<HealthResponse>('/health'),

  // Phase 12: primary full-pipeline endpoint (single call for all results)
  runFullPipeline: (req: ExperimentRequest) =>
    post<FullPipelineResponse>('/api/v1/protocol/full', req),

  // Legacy endpoints — preserved for backward compatibility and diagnostics
  runExperiment: (req: ExperimentRequest) =>
    post<ExperimentResponse>('/api/v1/experiment', req),
  executeProtocol: (req: ExperimentRequest) =>
    post<ProtocolExecuteResponse>('/api/v1/protocol/execute', req),
  signMessage: (req: SignRequest) =>
    post<SignResponse>('/api/v1/sign', req),
  teleportQubit: (req: TeleportRequest) =>
    post<TeleportResponse>('/api/v1/teleport', req),
  // Phase 15: Research Evaluation & Benchmarks
  runPerformanceBenchmark: (trialsPerScenario = 5) =>
    post<PerformanceBenchmarkResponse>('/api/v1/performance/benchmark', { trials_per_scenario: trialsPerScenario }),
  runForgeryExperiment: (totalAttempts = 25) =>
    post<ForgeryBenchmarkResponse>('/api/v1/experiment/forgery', { total_attempts: totalAttempts }),

  // Distributed Multi-Device Network Demo
  getNetworkState: () => get<any>('/api/v1/network/state'),
  resetNetworkSession: () => post<any>('/api/v1/network/reset', {}),
  transmitNetworkSession: (body: { message: string; shots?: number; max_symbols?: number }) =>
    post<any>('/api/v1/network/transmit', body),
  interceptNetworkSession: (body: { attack_type: string; attack_strength?: number }) =>
    post<any>('/api/v1/network/intercept', body),
  verifyNetworkSession: () => post<any>('/api/v1/network/verify', {}),
};

