import type {
  HealthResponse,
  ExperimentRequest,
  ExperimentResponse,
  SignRequest,
  SignResponse,
  TeleportRequest,
  TeleportResponse,
  AttackRequest,
  AttackResponse,
} from '../types/api';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://127.0.0.1:8000';

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
  runExperiment: (req: ExperimentRequest) =>
    post<ExperimentResponse>('/api/v1/experiment', req),
  signMessage: (req: SignRequest) =>
    post<SignResponse>('/api/v1/sign', req),
  teleportQubit: (req: TeleportRequest) =>
    post<TeleportResponse>('/api/v1/teleport', req),
  simulateAttack: (req: AttackRequest) =>
    post<AttackResponse>('/api/v1/attack', req),
};
