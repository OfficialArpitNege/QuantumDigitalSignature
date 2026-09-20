import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
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

const TIMELINE_STEPS = 9;

interface SimulatorContextType {
  // Scenario / Config state
  scenarioAttack: ExtendedAttackType;
  setScenarioAttack: (a: ExtendedAttackType) => void;
  message: string;
  setMessage: (m: string) => void;
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

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkRevealRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => {
    if (loading) {
      setStepIndex(0);
      setChecksRevealed(0);
      intervalRef.current = setInterval(() => {
        setStepIndex(prev => Math.min(prev + 1, TIMELINE_STEPS - 1));
      }, 420);
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (fullPipelineData) {
        setStepIndex(TIMELINE_STEPS);
        setChecksRevealed(0);
        let count = 0;
        checkRevealRef.current = setInterval(() => {
          count++;
          setChecksRevealed(count);
          if (count >= 4) { clearInterval(checkRevealRef.current!); checkRevealRef.current = null; }
        }, 250);
      } else {
        setStepIndex(-1);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loading, fullPipelineData]);

  useEffect(() => {
    return () => { if (checkRevealRef.current) clearInterval(checkRevealRef.current); };
  }, []);

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
    resetResults();
  }, [resetResults]);

  const runProtocol = async () => {
    if (!message.trim()) return;
    resetResults();
    setLoading(true);
    setPipeline({ stages: [{ status: 'active' }, ...Array(8).fill({ status: 'idle' })] });

    try {
      const attack = backendAttack();
      const reqBody = {
        message,
        attack,
        attack_strength: attackStrength,
        shots,
        max_symbols: maxSymbols,
      };

      const fullRes = await api.runFullPipeline(reqBody);
      setFullPipelineData(fullRes);

      const experimentAttack = attack === 'unauthorized_verification'
        ? ({ ...reqBody, attack: 'none' as AttackType })
        : reqBody;

      Promise.all([
        api.signMessage({ message, max_symbols: maxSymbols }),
        api.runExperiment(experimentAttack),
      ]).then(([signRes, expRes]) => {
        setSignData(signRes);
        setExperimentData(expRes);
      }).catch(() => { });

      const hasAnomaly = fullRes.verification.decision === 'REJECT';
      setPipeline(makePipeline(hasAnomaly));

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setPipeline(IDLE_PIPELINE);
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
