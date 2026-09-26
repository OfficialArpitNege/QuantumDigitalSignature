import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './landing/LandingPage';
import SimulatorLayout from './pages/simulator/SimulatorLayout';
import ExperimentPage from './pages/simulator/ExperimentPage';
import AnalysisPage from './pages/simulator/AnalysisPage';
import QuantumDataPage from './pages/simulator/QuantumDataPage';
import ResearchPage from './pages/simulator/ResearchPage';
import DistributedNetworkPage from './pages/simulator/DistributedNetworkPage';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulator" element={<SimulatorLayout />}>
          <Route index element={<ExperimentPage />} />
          <Route path="network" element={<DistributedNetworkPage />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="quantum" element={<QuantumDataPage />} />
          <Route path="research" element={<ResearchPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

