import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';
import HowItWorksModal from '../../components/JudgeDemo/HowItWorksModal';
import { SimulatorProvider, useSimulator } from '../../context/SimulatorContext';
import '../../qds-lab.css';

function InnerLayout() {
  const { showModal, setShowModal } = useSimulator();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, []);

  return (
    <div className="lab-page-root">
      {/* Background Ambient Orbs matching 3D Landing Page */}
      <div className="lab-ambient-bg">
        <div className="lab-orb-1" />
        <div className="lab-orb-2" />
        <div className="lab-orb-3" />
      </div>

      <Header
        onOpenHowItWorks={() => setShowModal(true)}
      />

      <HowItWorksModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <main style={{ padding: '28px 0 80px', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ maxWidth: 1280 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function SimulatorLayout() {
  return (
    <SimulatorProvider>
      <InnerLayout />
    </SimulatorProvider>
  );
}
