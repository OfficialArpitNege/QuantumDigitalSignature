import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './landing/LandingPage';
import SimulatorLayout from './pages/simulator/SimulatorLayout';
import ExperimentPage from './pages/simulator/ExperimentPage';
import AnalysisPage from './pages/simulator/AnalysisPage';
import QuantumDataPage from './pages/simulator/QuantumDataPage';
import ResearchPage from './pages/simulator/ResearchPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulator" element={<SimulatorLayout />}>
          <Route index element={<ExperimentPage />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="quantum" element={<QuantumDataPage />} />
          <Route path="research" element={<ResearchPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

