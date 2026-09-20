import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Scene from './components/Scene.jsx';
import Nav from './components/Nav.jsx';
import StatsPanel from './sections/StatsPanel.jsx';
import DecisionSection from './sections/DecisionSection.jsx';
import { setProgress, scrollStore } from './scrollStore.js';
import './landing.css';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const navigate = useNavigate();

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

  const scrollToAlice = () => {
    document.getElementById('s-alice')?.scrollIntoView({
      behavior: scrollStore.reducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <div className="landing-root">
      <Nav />
      <Scene />

      <div className="scroller">
        {/* 0. Hero */}
        <Section id="s-hero">
          <Panel>
            <p className="eyebrow text-cyan mb-2.5">Quantum Communication</p>
            <h1 className="font-display font-semibold leading-[1.08] text-[clamp(34px,4.6vw,58px)] mb-3.5">
              Secure messages travel through light itself.
            </h1>
            <p className="text-ink-soft font-light mb-1.5">
              Scroll to follow a single message from Alice to Bob — and watch the network detect
              an eavesdropper along the way.
            </p>
            <div className="flex flex-wrap gap-4 items-center mt-6">
              <button onClick={scrollToAlice} className="cta-button">
                Begin the journey ↓
              </button>
              <button
                onClick={() => navigate('/simulator')}
                className="cta-button text-white shadow-lg hover:shadow-cyan-500/25"
                style={{ background: 'linear-gradient(135deg, #1fb6d6, #4c5fd5)', padding: '16px 32px' }}
              >
                Start Simulation ⚛
              </button>
            </div>
          </Panel>
        </Section>

        {/* 1. Alice */}
        <Section id="s-alice">
          <Panel>
            <p className="eyebrow text-cyan mb-2.5">01 · Sender</p>
            <h2 className="font-display font-semibold text-[clamp(26px,3.2vw,36px)] mb-3.5">
              Alice
            </h2>
            <p className="font-mono text-[13px] text-ink-soft mb-2">
              Origin node · Quantum Channel A
            </p>
            <p className="text-ink-soft font-light">
              Alice encodes a message into a quantum state, then commits it to the shared
              channel.
            </p>
          </Panel>
        </Section>

        {/* 2. Writing message */}
        <Section id="s-write">
          <Panel align="right">
            <p className="eyebrow text-cyan mb-2.5">02 · Message Created</p>
            <h2 className="font-display font-semibold text-[clamp(26px,3.2vw,36px)] mb-3.5">
              Writing the message
            </h2>
            <p className="text-ink-soft font-light">
              Each character is encoded as a qubit. As the state stabilizes, the message
              assembles from particles in real time.
            </p>
          </Panel>
        </Section>

        {/* 3. Channel */}
        <Section id="s-channel">
          <Panel align="center">
            <p className="eyebrow text-cyan mb-2.5">03 · Quantum Channel</p>
            <h2 className="font-display font-semibold text-[clamp(26px,3.2vw,36px)] mb-3.5">
              Entering the channel
            </h2>
            <p className="text-ink-soft font-light">
              The message now travels as a single photon state along the entangled link
              connecting Alice and Bob.
            </p>
          </Panel>
        </Section>

        {/* 4. Eve */}
        <Section id="s-eve">
          <Panel>
            <p className="eyebrow text-threat mb-2.5">04 · Threat Detection</p>
            <h2 className="font-display font-semibold text-[clamp(26px,3.2vw,36px)] mb-3.5">
              Eve
            </h2>
            <p className="font-mono text-[13px] text-ink-soft mb-2">
              Unauthorized node · Interception attempt
            </p>
            <p className="text-ink-soft font-light">
              Eve attempts to intercept the transmission. Any measurement of a quantum state
              disturbs it — and the channel notices.
            </p>
          </Panel>
        </Section>

        {/* 5. Stats - inside threat detection, before Bob */}
        <Section id="s-stats">
          <StatsPanel />
        </Section>

        {/* 6. Decision */}
        <Section id="s-decision">
          <DecisionSection />
        </Section>

        {/* 7. Bob */}
        <Section id="s-bob">
          <Panel align="right">
            <p className="eyebrow text-violet mb-2.5">06 · Receiver</p>
            <h2 className="font-display font-semibold text-[clamp(26px,3.2vw,36px)] mb-3.5">
              Bob
            </h2>
            <p className="font-mono text-[13px] text-ink-soft mb-2">
              Destination node · Quantum Channel B
            </p>
            <p className="text-ink-soft font-light">
              The verified message arrives intact. Bob decodes the quantum state and confirms
              secure delivery.
            </p>
          </Panel>
        </Section>

        {/* 8. Final */}
        <Section id="s-final">
          <Panel align="center">
            <p className="eyebrow text-cyan mb-2.5">Secure Delivery</p>
            <h1 className="font-display font-semibold text-[clamp(28px,3.6vw,42px)] mb-3.5">
              Secure communication starts here.
            </h1>
            <p className="text-ink-soft font-light mb-1.5">
              Every message on this network is verified before it arrives — no exceptions.
            </p>
            <button
              onClick={() => navigate('/simulator')}
              className="cta-button bg-cyan-600 text-white"
              style={{ background: 'linear-gradient(135deg, #1fb6d6, #7c6cf6)' }}
            >
              Start Simulation ⚛
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

function Panel({ children, align = 'left' }) {
  const alignClass =
    align === 'right' ? 'ml-auto' : align === 'center' ? 'mx-auto text-center' : '';
  return (
    <div className={`glass-panel max-w-[520px] pointer-events-auto ${alignClass}`}
         style={{ padding: '38px 44px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {children}
    </div>
  );
}
