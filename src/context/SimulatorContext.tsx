import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ExtendedAttackType } from '../components/JudgeDemo/ScenarioSelector';
import type {
  AttackType,
  ExperimentResponse,
  SignResponse,
  FullPipelineResponse,
  PerformanceBenchmarkResponse,
  ForgeryBenchmarkResponse,
} from '../types/api';
import { api } from '../services/api';

export type PipelineStatus = 'idle' | 'active' | 'complete' | 'anomaly';
export interface PipelineState {
  stages: Array<{ status: PipelineStatus }>;
}

const IDLE_PIPELINE: PipelineState = { stages: Array(9).fill({ status: 'idle' }) };
function makePipeline(hasAnomaly: boolean): PipelineState {
  const stages = Array(8).fill({ status: 'complete' as PipelineStatus });
  stages.push({ status: (hasAnomaly ? 'anomaly' : 'complete') as PipelineStatus });
  return { stages };
}

interface SimulatorContextType {
  // Scenario / Config state
  scenarioAttack: ExtendedAttackType;
  setScenarioAttack: (a: ExtendedAttackType) => void;
  message: string;
  setMessage: (m: string) => void;
  impersonatedMessage: string;
  setImpersonatedMessage: (m: string) => void;
  shots: number;
  setShots: (s: number) => void;
  maxSymbols: number;
  setMaxSymbols: (m: number) => void;
  attackStrength: number;
  setAttackStrength: (a: number) => void;
  showAdvanced: boolean;
  setShowAdvanced: React.Dispatch<React.SetStateAction<boolean>>;

  // Execution state
  loading: boolean;
  error: string | null;
  stepIndex: number;
  checksRevealed: number;
  pipeline: PipelineState;

  // Response stores
  fullPipelineData: FullPipelineResponse | null;
  experimentData: ExperimentResponse | null;
  signData: SignResponse | null;

  // Benchmark response stores
  benchmarkData: PerformanceBenchmarkResponse | null;
  forgeryData: ForgeryBenchmarkResponse | null;
  benchmarkLoading: boolean;

  // Modals & Drawers
  showModal: boolean;
  setShowModal: (b: boolean) => void;
  showDrawer: boolean;
  setShowDrawer: React.Dispatch<React.SetStateAction<boolean>>;

  // Action methods
  runProtocol: () => Promise<void>;
  resetResults: () => void;
  handleScenarioSelect: (a: ExtendedAttackType) => void;
  runResearchBenchmarks: () => Promise<void>;
}

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined);

const STORAGE_KEY_FULL = 'qds_sim_full_pipeline';
const STORAGE_KEY_EXP = 'qds_sim_experiment';
const STORAGE_KEY_SIGN = 'qds_sim_sign';
const STORAGE_KEY_CONFIG = 'qds_sim_config';

export const SimulatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Config
  const [scenarioAttack, setScenarioAttack] = useState<ExtendedAttackType>('none');
  const [message, setMessage] = useState('HELLO QUANTUM');
  const [impersonatedMessage, setImpersonatedMessage] = useState('');
  const [shots, setShots] = useState(2048);
  const [maxSymbols, setMaxSymbols] = useState(4);
  const [attackStrength, setAttackStrength] = useState(0.35);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Execution
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [checksRevealed, setChecksRevealed] = useState(0);
  const [pipeline, setPipeline] = useState<PipelineState>(IDLE_PIPELINE);

  // Responses
  const [fullPipelineData, setFullPipelineData] = useState<FullPipelineResponse | null>(null);
  const [experimentData, setExperimentData] = useState<ExperimentResponse | null>(null);
  const [signData, setSignData] = useState<SignResponse | null>(null);

  // Benchmarks
  const [benchmarkData, setBenchmarkData] = useState<PerformanceBenchmarkResponse | null>(null);
  const [forgeryData, setForgeryData] = useState<ForgeryBenchmarkResponse | null>(null);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);

  // UI Modals
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // Hydrate from SessionStorage on initial mount
  useEffect(() => {
    try {
      const savedFull = sessionStorage.getItem(STORAGE_KEY_FULL);
      const savedExp = sessionStorage.getItem(STORAGE_KEY_EXP);
      const savedSign = sessionStorage.getItem(STORAGE_KEY_SIGN);
      const savedConfig = sessionStorage.getItem(STORAGE_KEY_CONFIG);

      if (savedFull) setFullPipelineData(JSON.parse(savedFull));
      if (savedExp) setExperimentData(JSON.parse(savedExp));
      if (savedSign) setSignData(JSON.parse(savedSign));
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed.scenarioAttack) setScenarioAttack(parsed.scenarioAttack);
        if (parsed.message) setMessage(parsed.message);
        if (parsed.shots) setShots(parsed.shots);
        if (parsed.maxSymbols) setMaxSymbols(parsed.maxSymbols);
        if (parsed.attackStrength) setAttackStrength(parsed.attackStrength);
      }
    } catch (e) {
      console.error('Failed to load session storage simulation data:', e);
    }
  }, []);

  // Save to SessionStorage when results update
  useEffect(() => {
    try {
      if (fullPipelineData) {
        sessionStorage.setItem(STORAGE_KEY_FULL, JSON.stringify(fullPipelineData));
      } else {
        sessionStorage.removeItem(STORAGE_KEY_FULL);
      }
      if (experimentData) {
        sessionStorage.setItem(STORAGE_KEY_EXP, JSON.stringify(experimentData));
      } else {
        sessionStorage.removeItem(STORAGE_KEY_EXP);
      }
      if (signData) {
        sessionStorage.setItem(STORAGE_KEY_SIGN, JSON.stringify(signData));
      } else {
        sessionStorage.removeItem(STORAGE_KEY_SIGN);
      }
      sessionStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({
        scenarioAttack, message, shots, maxSymbols, attackStrength
      }));
    } catch (e) {
      console.error('Failed to update session storage:', e);
    }
  }, [fullPipelineData, experimentData, signData, scenarioAttack, message, shots, maxSymbols, attackStrength]);

  const backendAttack = useCallback((): AttackType => {
    return scenarioAttack as AttackType;
  }, [scenarioAttack]);

  const STAGE_DURATIONS = [
    1400, // 0: SIGN
    1400, // 1: ENCODE
    2600, // 2: TRANSMIT (Hero Quantum Channel Transfer)
    1800, // 3: ANALYZE
    1600, // 4: DECIDE
    1400, // 5: VERIFY
  ];

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const resetResults = useCallback(() => {
    setFullPipelineData(null);
    setExperimentData(null);
    setSignData(null);
    setPipeline(IDLE_PIPELINE);
    setStepIndex(-1);
    setChecksRevealed(0);
    setShowDrawer(false);
    setError(null);
  }, []);

  const handleScenarioSelect = useCallback((a: ExtendedAttackType) => {
    setScenarioAttack(a);
    if (a !== 'impersonation') {
      setImpersonatedMessage('');
    }
    resetResults();
  }, [resetResults]);

  const runProtocol = async () => {
    if (!message.trim() || loading) return;
    resetResults();
    setLoading(true);
    setPipeline({ stages: [{ status: 'active' }, ...Array(8).fill({ status: 'idle' })] });

    const attack = backendAttack();
    const effectiveMsg = (attack === 'impersonation' && impersonatedMessage.trim())
      ? impersonatedMessage.trim()
      : message;

    const reqBody = {
      message: effectiveMsg,
      attack,
      attack_strength: attackStrength,
      shots,
      max_symbols: maxSymbols,
    };

    // Initiate backend API requests in parallel
    const pipelinePromise = api.runFullPipeline(reqBody);
    const experimentAttack = attack === 'unauthorized_verification'
      ? ({ ...reqBody, attack: 'none' as AttackType })
      : reqBody;

    const secondaryPromises = Promise.all([
      api.signMessage({ message, max_symbols: maxSymbols }),
      api.runExperiment(experimentAttack),
    ]);

    try {
      // Step 0: SIGN
      setStepIndex(0);
      await sleep(STAGE_DURATIONS[0]);

      // Step 1: ENCODE
      setStepIndex(1);
      await sleep(STAGE_DURATIONS[1]);

      // Step 2: TRANSMIT (Hero Stage — Quantum channel active)
      setStepIndex(2);
      await sleep(STAGE_DURATIONS[2]);

      // Step 3: ANALYZE
      setStepIndex(3);
      await sleep(STAGE_DURATIONS[3]);

      // Await actual API result from backend
      const fullRes = await pipelinePromise;
      setFullPipelineData(fullRes);

      secondaryPromises.then(([signRes, expRes]) => {
        setSignData(signRes);
        setExperimentData(expRes);
      }).catch(() => { });

      // Step 4: DECIDE — Reveals verification gates one by one
      setStepIndex(4);
      setChecksRevealed(0);
      for (let i = 1; i <= 4; i++) {
        await sleep(350);
        setChecksRevealed(i);
      }
      await sleep(400);

      // Step 5: VERIFY
      setStepIndex(5);
      await sleep(STAGE_DURATIONS[5]);

      // Complete
      setStepIndex(6);
      setChecksRevealed(4);
      const hasAnomaly = fullRes.verification.decision === 'REJECT';
      setPipeline(makePipeline(hasAnomaly));

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setPipeline(IDLE_PIPELINE);
      setStepIndex(-1);
    } finally {
      setLoading(false);
    }
  };


  const runResearchBenchmarks = async () => {
    setBenchmarkLoading(true);
    try {
      const [bmRes, fgRes] = await Promise.all([
        api.runPerformanceBenchmark(10),
        api.runForgeryExperiment(50),
      ]);
      setBenchmarkData(bmRes);
      setForgeryData(fgRes);
    } catch (e: unknown) {
      console.error('Failed to run research benchmarks:', e);
    } finally {
      setBenchmarkLoading(false);
    }
  };

  return (
    <SimulatorContext.Provider
      value={{
        scenarioAttack, setScenarioAttack,
        message, setMessage,
        impersonatedMessage, setImpersonatedMessage,
        shots, setShots,
        maxSymbols, setMaxSymbols,
        attackStrength, setAttackStrength,
        showAdvanced, setShowAdvanced,
        loading, error, stepIndex, checksRevealed, pipeline,
        fullPipelineData, experimentData, signData,
        benchmarkData, forgeryData, benchmarkLoading,
        showModal, setShowModal,
        showDrawer, setShowDrawer,
        runProtocol, resetResults, handleScenarioSelect, runResearchBenchmarks,
      }}
    >
      {children}
    </SimulatorContext.Provider>
  );
};

export function useSimulator(): SimulatorContextType {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return context;
}
