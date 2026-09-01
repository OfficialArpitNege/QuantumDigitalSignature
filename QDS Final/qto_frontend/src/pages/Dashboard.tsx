import { useState, useCallback } from 'react';
import type { AttackType, ExperimentResponse, SignResponse } from '../types/api';
import { api } from '../services/api';

import ExperimentForm from '../components/ExperimentForm';
import WorkflowPipeline from '../components/WorkflowPipeline';
import ThreatAssessment from '../components/ThreatAssessment';
import MessageAuth from '../components/MessageAuth';
import QuantumTeleportation from '../components/QuantumTeleportation';
import ThreatDetection from '../components/ThreatDetection';
import StatisticalAnalysis from '../components/StatisticalAnalysis';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

interface FormState {
  message: string;
  attack: AttackType;
  attackStrength: number;
  theta: number;
  phi: number;
  shots: number;
  maxSymbols: number;
}

type PipelineStatus = 'idle' | 'active' | 'complete' | 'anomaly';

interface PipelineState {
  stages: Array<{ status: PipelineStatus }>;
}

const IDLE_PIPELINE: PipelineState = {
  stages: Array(9).fill({ status: 'idle' }),
};

function makePipeline(hasAnomaly: boolean): PipelineState {
  const complete = { status: 'complete' as PipelineStatus };
  const anomaly  = { status: 'anomaly' as PipelineStatus };
  const stages = Array(8).fill(complete);
  stages.push(hasAnomaly ? anomaly : complete);
  return { stages };
}

export default function Dashboard() {
  const [form, setForm] = useState<FormState>({
    message: 'HELLO',
    attack: 'none',
    attackStrength: 0.25,
    theta: 1.2,
    phi: 0.7,
    shots: 2048,
    maxSymbols: 4,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pipeline, setPipeline] = useState<PipelineState>(IDLE_PIPELINE);

  // Separate response stores
  const [experimentData, setExperimentData] = useState<ExperimentResponse | null>(null);
  const [signData, setSignData] = useState<SignResponse | null>(null);

  const handleChange = useCallback((field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const runExperiment = async () => {
    if (!form.message.trim()) return;
    setLoading(true);
    setError(null);
    setExperimentData(null);
    setSignData(null);
    setPipeline({ stages: [{ status: 'active' }, ...Array(8).fill({ status: 'idle' })] });

    try {
      // Step 1: Sign (gives us the auth section data)
      const signRes = await api.signMessage({
        message: form.message,
        max_symbols: form.maxSymbols,
      });
      setSignData(signRes);
      setPipeline({ stages: [
        { status: 'complete' }, { status: 'complete' }, { status: 'active' },
        ...Array(6).fill({ status: 'idle' }),
      ]});

      // Step 2: Full experiment
      const expRes = await api.runExperiment({
        message: form.message,
        attack: form.attack,
        attack_strength: form.attackStrength,
        shots: form.shots,
        max_symbols: form.maxSymbols,
      });
      setExperimentData(expRes);

      const hasAnomaly = expRes.results.some(r => r.detection.threat_level !== 'LOW');
      setPipeline(makePipeline(hasAnomaly));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setPipeline(IDLE_PIPELINE);
    } finally {
      setLoading(false);
    }
  };

  const hasResults = !!experimentData;

  return (
    <main style={{ padding: '32px 0 64px' }}>
      <div className="container">

        {/* Experiment Configuration */}
        <ExperimentForm
          message={form.message}
          attack={form.attack}
          attackStrength={form.attackStrength}
          theta={form.theta}
          phi={form.phi}
          shots={form.shots}
          maxSymbols={form.maxSymbols}
          loading={loading}
          onChange={handleChange}
          onRunExperiment={runExperiment}
        />

        {/* Workflow Pipeline */}
        <WorkflowPipeline stages={pipeline.stages} />

        {/* Loading state */}
        {loading && (
          <div className="card section">
            <LoadingState />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="section">
            <ErrorState error={error} onRetry={runExperiment} />
          </div>
        )}

        {/* Results (only when we have data) */}
        {hasResults && !loading && experimentData && (
          <>
            {/* Threat Assessment — most prominent */}
            <ThreatAssessment data={experimentData} />

            {/* Two-column: Auth + Teleportation */}
            <div className="grid-2 section" style={{ marginBottom: 0 }}>
              {signData && (
                <MessageAuth data={signData} />
              )}
              <QuantumTeleportation results={experimentData.results} />
            </div>

            {/* Threat Detection */}
            <ThreatDetection
              results={experimentData.results}
              attackType={experimentData.attack}
            />

            {/* Statistical Analysis */}
            <StatisticalAnalysis results={experimentData.results} />

            {/* Experiment note */}
            {experimentData.note && (
              <div style={{
                background: 'var(--blue-50)', border: 'var(--border-light)',
                borderRadius: 8, padding: '12px 16px',
                fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic',
                marginBottom: 24,
              }}>
                ℹ {experimentData.note}
              </div>
            )}
          </>
        )}

        {/* Empty state (no run yet) */}
        {!hasResults && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚛</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Ready to Run
            </div>
            <div style={{ fontSize: 14 }}>
              Configure your experiment above and click <strong>Run Experiment</strong> to begin.
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
