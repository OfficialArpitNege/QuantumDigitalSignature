import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Scene from './components/Scene.jsx';
import Nav from './components/Nav.jsx';
import StatsPanel from './sections/StatsPanel.jsx';
import DecisionSection from './sections/DecisionSection.jsx';
import { setProgress, subscribe, scrollStore } from './scrollStore.js';
import './landing.css';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const navigate = useNavigate();
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: scrollStore.reducedMotion ? false : 1,
      onUpdate: (self) => setProgress(self.progress),
    });
    return () => {
      trigger.kill();
    };
  }, []);

  useEffect(() => {
    return subscribe((t) => {
      setHasScrolled(t > 0.015);
    });
  }, []);

  const scrollToSender = () => {
    (document.getElementById('s-sender') || document.getElementById('s-alice'))?.scrollIntoView({
      behavior: scrollStore.reducedMotion ? 'auto' : 'smooth',
    });
  };

  const launchSimulator = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    navigate('/simulator');
  };

  return (
    <div className="landing-root">
      <Nav />
      <Scene />

      <div className="scroller">
        {/* 0. Hero */}
        <Section id="s-hero">
          <div className="hero-content-row">
            <Panel maxWidth="580px">
              <h1 className="font-display font-semibold leading-[1.1] text-[clamp(28px,3.8vw,48px)] mb-3.5">
                QuantumShield: Teleportation-Based Quantum Digital Signature Threat Detection
              </h1>
              <p className="text-ink-soft font-light mb-2">
                An entanglement-assisted Quantum Digital Signature (QDS) security architecture integrating quantum state preparation, teleportation-based transmission, controlled attack simulation, and real-time statistical threat classification.
              </p>
              <div className="flex flex-wrap gap-4 items-center mt-6">
                <button onClick={scrollToSender} className="cta-button">
                  Explore Pipeline ↓
                </button>
                <button
                  onClick={launchSimulator}
                  className="cta-button"
                  style={{
                    background: '#1D4ED8',
                    color: '#FFFFFF',
                    border: '1.5px solid #0F0F0F',
                    boxShadow: '2.5px 2.5px 0px #0F0F0F',
                  }}
                >
                  Launch QDS Simulator ⚛
                </button>
              </div>
            </Panel>

            {/* Scroll Indicator Prompt in blank space on right */}
            <div
              className="hero-scroll-cue"
              onClick={scrollToSender}
              style={{
                opacity: hasScrolled ? 0 : 1,
                transform: hasScrolled ? 'translateY(16px)' : 'translateY(0)',
                pointerEvents: hasScrolled ? 'none' : 'auto',
              }}
            >
              <div style={{
                width: '26px',
                height: '40px',
                borderRadius: '13px',
                border: '2px solid #0F0F0F',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '6px',
                background: '#FFFFFF',
              }}>
                <div style={{
                  width: '4px',
                  height: '8px',
                  borderRadius: '2px',
                  background: '#1D4ED8',
                  animation: 'qds-mouse-wheel 1.6s ease-in-out infinite',
                }} />
              </div>

              <div>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#0F0F0F',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}>
                  PLEASE SCROLL TO EXPLORE
                </div>
                <p style={{
                  margin: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  color: '#555555',
                  lineHeight: 1.4,
                }}>
                  Follow quantum transmission from Sender to Receiver ↓
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* 1. Sender */}
        <Section id="s-sender">
          <Panel>
            <p className="eyebrow text-cyan mb-2.5">01 · Message &amp; Signature Generation</p>
            <h2 className="font-display font-semibold text-[clamp(26px,3.2vw,36px)] mb-3.5">
              Sender Node
            </h2>
            <p className="font-mono text-[12px] text-ink-soft mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#555555' }}>
              Origin Node · QDS State Preparation
            </p>
            <p className="text-ink-soft font-light">
              The sender prepares the input message and generates the Quantum Digital Signature (QDS). Cryptographic quantum state commitments are established to ensure non-repudiation and prevent existential forgery.
            </p>
          </Panel>
        </Section>

        {/* 2. Writing message */}
        <Section id="s-write">
          <Panel align="right">
            <p className="eyebrow text-cyan mb-2.5">02 · Quantum Teleportation</p>
            <h2 className="font-display font-semibold text-[clamp(26px,3.2vw,36px)] mb-3.5">
              Entangled State Distribution
            </h2>
            <p className="text-ink-soft font-light">
              Entanglement and quantum teleportation transfer the required quantum state. Bell-state pairs are established across the link, transmitting the quantum state without direct physical cloning.
            </p>
          </Panel>
        </Section>

        {/* 3. Channel */}
        <Section id="s-channel">
          <Panel align="center">
            <p className="eyebrow text-cyan mb-2.5">03 · Transmission Layer</p>
            <h2 className="font-display font-semibold text-[clamp(26px,3.2vw,36px)] mb-3.5">
              Quantum Communication Layer
            </h2>
            <p className="text-ink-soft font-light">
              The quantum communication layer routes teleported states between endpoints while continuously monitoring state fidelity, phase coherence, and baseline Quantum Bit Error Rate (QBER).
            </p>
          </Panel>
        </Section>

        {/* 4. Attacker */}
        <Section id="s-attacker">
          <Panel>
            <p className="eyebrow text-threat mb-2.5">04 · Attack Simulation Module</p>
            <h2 className="font-display font-semibold text-[clamp(26px,3.2vw,36px)] mb-3.5">
              Attacker Node
            </h2>
            <p className="font-mono text-[12px] text-ink-soft mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#DC2626' }}>
              Channel Manipulation · Forgery &amp; Interception
            </p>
            <p className="text-ink-soft font-light">
              The framework simulates forgery, impersonation, replay, and channel manipulation attacks. Due to the No-Cloning Theorem, unauthorized measurement introduces detectable statistical disturbance into the quantum channel.
            </p>
          </Panel>
        </Section>

        {/* 5. Stats - inside threat detection, before Receiver */}
        <Section id="s-stats">
          <StatsPanel />
        </Section>

        {/* 6. Decision */}
        <Section id="s-decision">
          <DecisionSection />
        </Section>

        {/* 7. Receiver */}
        <Section id="s-receiver">
          <Panel align="right">
            <p className="eyebrow text-violet mb-2.5">06 · Signature Verification</p>
            <h2 className="font-display font-semibold text-[clamp(26px,3.2vw,36px)] mb-3.5">
              Receiver Node
            </h2>
            <p className="font-mono text-[12px] text-ink-soft mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#555555' }}>
              Destination Node · Projective Measurements
            </p>
            <p className="text-ink-soft font-light">
              The receiver performs projective quantum measurements to validate the received signature against expected patterns and predefined thresholds, ensuring origin authenticity and payload integrity.
            </p>
          </Panel>
        </Section>

        {/* 8. Final */}
        <Section id="s-final">
          <Panel align="center" maxWidth="560px">
            <p className="eyebrow text-cyan mb-2.5">07 · Tamper-Evident Audit Layer</p>
            <h1 className="font-display font-semibold text-[clamp(28px,3.6vw,42px)] mb-3.5">
              High-Assurance Cyber Threat Detection
            </h1>
            <p className="text-ink-soft font-light mb-1.5">
              Legitimate communication is accepted, while anomalous behaviour is detected, classified, and recorded in a tamper-evident audit layer for defense, government, and financial operations.
            </p>
            <button
              onClick={launchSimulator}
              className="cta-button"
              style={{
                background: '#1D4ED8',
                color: '#FFFFFF',
                border: '1.5px solid #0F0F0F',
                boxShadow: '3px 3px 0px #0F0F0F',
                marginTop: '12px',
              }}
            >
              Launch QDS Simulation Platform ⚛
            </button>
          </Panel>
        </Section>
      </div>

      {scrollStore.reducedMotion && (
        <p className="fixed bottom-4 left-[8vw] z-10 font-mono text-[11px] text-ink-soft opacity-60 pointer-events-none">
          Reduced-motion mode: animations simplified.
        </p>
      )}
    </div>
  );
}

function Section({ id, children }) {
  return (
    <section id={id} className="relative min-h-screen flex items-center px-[8vw] py-[6vh] pointer-events-none">
      {children}
    </section>
  );
}

function Panel({ children, align = 'left', maxWidth = '520px' }) {
  const alignClass =
    align === 'right' ? 'ml-auto' : align === 'center' ? 'mx-auto text-center' : '';
  return (
    <div className={`glass-panel pointer-events-auto ${alignClass}`}
         style={{ maxWidth, padding: '38px 44px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {children}
    </div>
  );
}
