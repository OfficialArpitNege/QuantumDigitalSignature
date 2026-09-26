import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TransitionPage({ isModal = false, onComplete }) {
  const navigate = useNavigate();

  useEffect(() => {
    let bootAnimationTimers = [];

    const checkmarkSvg = `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;

    function markStepCompleted(stepIdx) {
      const dot = document.getElementById(`stepDot${stepIdx}`);
      const line = document.getElementById(`stepLine${stepIdx}`);
      if (dot) {
        dot.className =
          'flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium transition-all duration-300 scale-105 shadow-sm';
        dot.innerHTML = checkmarkSvg;
      }
      if (line) {
        line.className = 'w-5 h-[1.5px] bg-emerald-400 transition-colors duration-300';
      }
      const nextDot = document.getElementById(`stepDot${stepIdx + 1}`);
      if (nextDot && stepIdx + 1 <= 4) {
        nextDot.className =
          'flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 text-xs font-medium ring-2 ring-cyan-400 ring-offset-2 transition-all duration-300';
      }
    }

    function createFloatingQubit(symbolText, colorClass, startX, startY, destX, destY, delayMs) {
      const t = setTimeout(() => {
        const layer = document.getElementById('floatingQubitsLayer');
        if (!layer) return;
        const el = document.createElement('div');
        el.className = `absolute px-2.5 py-1 rounded-md bg-white border border-slate-300/80 shadow-md text-xs font-mono font-bold ${colorClass} qubit-state-tag select-none pointer-events-none transition-all duration-1000 ease-in-out z-30`;
        el.style.left = typeof startX === 'number' ? startX + 'px' : startX;
        el.style.top = typeof startY === 'number' ? startY + 'px' : startY;
        el.style.opacity = '0';
        el.style.transform = 'translate(-50%, -50%) scale(0.6)';
        el.textContent = symbolText;
        layer.appendChild(el);

        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translate(-50%, -50%) scale(1)';
          setTimeout(() => {
            el.style.left = typeof destX === 'number' ? destX + 'px' : destX;
            el.style.top = typeof destY === 'number' ? destY + 'px' : destY;
            el.style.opacity = '0';
            el.style.transform = 'translate(-50%, -50%) scale(0.8)';
            setTimeout(() => el.remove(), 1000);
          }, 350);
        });
      }, delayMs);
      bootAnimationTimers.push(t);
    }

    function drawLinePath(id, durationMs = 250) {
      const el = document.getElementById(id);
      if (!el) return;
      const len = el.getTotalLength ? el.getTotalLength() : 600;
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len);
      el.style.transition = `stroke-dashoffset ${durationMs}ms cubic-bezier(0.33, 1, 0.68, 1), opacity 150ms ease`;
      el.style.opacity = '1';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.strokeDashoffset = '0';
        });
      });
    }

    function popInLabel(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('opacity-0');
      el.classList.add('text-pop');
    }

    function resetBlochConstruction() {
      bootAnimationTimers.forEach(clearTimeout);
      bootAnimationTimers = [];

      const dot = document.getElementById('b-origin-dot');
      if (dot) dot.classList.add('opacity-0');

      const paths = [
        'b-axis-z',
        'b-axis-y',
        'b-axis-y-neg',
        'b-axis-x',
        'b-sphere-circle',
        'b-equator-ellipse',
        'b-meridian-ellipse',
        'b-vec-0',
        'b-vec-1',
        'b-proj-arc',
        'b-proj-line',
        'b-arc-phi',
        'b-arc-theta',
        'b-vec-psi',
      ];
      paths.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          const len = el.getTotalLength ? el.getTotalLength() : 800;
          el.style.transition = 'none';
          el.style.strokeDasharray = String(len);
          el.style.strokeDashoffset = String(len);
        }
      });

      const labels = [
        'b-lbl-z',
        'b-lbl-y',
        'b-lbl-x',
        'b-lbl-0',
        'b-lbl-1',
        'b-lbl-phi',
        'b-lbl-theta',
        'b-lbl-psi',
      ];
      labels.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.add('opacity-0');
          el.classList.remove('text-pop');
        }
      });
    }

    function playBlochDrawingSequence() {
      resetBlochConstruction();
      const schedule = (fn, delay) => {
        const timer = setTimeout(fn, delay);
        bootAnimationTimers.push(timer);
      };

      schedule(() => {
        const dot = document.getElementById('b-origin-dot');
        if (dot) dot.classList.remove('opacity-0');
      }, 40);

      schedule(() => {
        drawLinePath('b-axis-z', 250);
        schedule(() => popInLabel('b-lbl-z'), 100);
      }, 80);

      schedule(() => {
        drawLinePath('b-axis-y', 250);
        drawLinePath('b-axis-y-neg', 200);
        schedule(() => popInLabel('b-lbl-y'), 100);
      }, 200);

      schedule(() => {
        drawLinePath('b-axis-x', 250);
        schedule(() => popInLabel('b-lbl-x'), 100);
      }, 320);

      schedule(() => {
        drawLinePath('b-sphere-circle', 300);
      }, 440);

      schedule(() => {
        drawLinePath('b-equator-ellipse', 250);
        drawLinePath('b-meridian-ellipse', 220);
      }, 600);

      schedule(() => {
        drawLinePath('b-vec-0', 250);
        schedule(() => popInLabel('b-lbl-0'), 100);
      }, 750);

      schedule(() => {
        drawLinePath('b-vec-1', 250);
        schedule(() => popInLabel('b-lbl-1'), 100);
      }, 900);

      schedule(() => {
        drawLinePath('b-proj-arc', 250);
        drawLinePath('b-proj-line', 200);
      }, 1050);

      schedule(() => {
        drawLinePath('b-arc-phi', 200);
        schedule(() => popInLabel('b-lbl-phi'), 80);
      }, 1180);

      schedule(() => {
        drawLinePath('b-arc-theta', 200);
        schedule(() => popInLabel('b-lbl-theta'), 80);
      }, 1300);

      schedule(() => {
        drawLinePath('b-vec-psi', 250);
        schedule(() => popInLabel('b-lbl-psi'), 100);
      }, 1420);
    }

    function startQuantumBootSequence() {
      playBlochDrawingSequence();

      const t1 = setTimeout(() => {
        markStepCompleted(0);
      }, 300);
      bootAnimationTimers.push(t1);

      const t2 = setTimeout(() => {
        markStepCompleted(1);
      }, 700);
      bootAnimationTimers.push(t2);

      const t3 = setTimeout(() => {
        markStepCompleted(2);
      }, 1100);
      bootAnimationTimers.push(t3);

      const t4 = setTimeout(() => {
        markStepCompleted(3);
      }, 1400);
      bootAnimationTimers.push(t4);

      const t5 = setTimeout(() => {
        markStepCompleted(4);
        const blochSvg = document.getElementById('blochSvg');
        const stageContainer = document.getElementById('stageContainer');
        const sphereGlow = document.getElementById('sphereGlow');
        const bootSeq = document.getElementById('quantumBootSequence');
        if (blochSvg) blochSvg.style.transform = 'scale(0.96)';
        if (sphereGlow) {
          sphereGlow.style.opacity = '0.95';
          sphereGlow.style.transform = 'scale(1.25)';
        }
        const endT1 = setTimeout(() => {
          if (stageContainer) {
            stageContainer.style.transform = isModal ? 'scale(0.95)' : 'scale(1.04)';
            stageContainer.style.opacity = '0';
          }
          if (bootSeq) bootSeq.style.opacity = '0';
          const endT2 = setTimeout(() => {
            if (onComplete) {
              onComplete();
            } else {
              navigate('/simulator');
            }
          }, 300);
          bootAnimationTimers.push(endT2);
        }, 500);
        bootAnimationTimers.push(endT1);
      }, 1700);
      bootAnimationTimers.push(t5);
    }

    startQuantumBootSequence();

    return () => {
      bootAnimationTimers.forEach(clearTimeout);
    };
  }, [navigate, onComplete, isModal]);

  return (
    <div className={isModal ? 'relative z-[200]' : 'bg-[#fafbfc] text-slate-800 antialiased min-h-screen font-sans selection:bg-cyan-100 selection:text-cyan-900 relative overflow-hidden'}>
      <style>{`
        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.04); }
        }
        @keyframes gateAppear {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0.4); opacity: 0; }
          70% { transform: scale(1.18); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes modalEntrance {
          0% { opacity: 0; transform: scale(0.86) translateY(24px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes backdropFade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .animate-float { animation: subtleFloat 4s ease-in-out infinite; }
        .gate-enter { animation: gateAppear 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .text-pop { animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; transform-origin: center; }
        .qubit-state-tag { font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; direction: ltr !important; unicode-bidi: isolate; transform: none !important; }
        .bg-quantum-grid {
          background-size: 32px 32px;
          background-image: radial-gradient(circle, #cbd5e1 0.75px, transparent 0.75px);
        }
        .draw-path {
          stroke-dashoffset: 1000;
          stroke-dasharray: 1000;
          transition: stroke-dashoffset 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
        }
        .draw-path.drawn { stroke-dashoffset: 0 !important; }
      `}</style>

      <div
        className="fixed inset-0 z-50 text-center overflow-y-auto"
        id="quantumBootSequence"
        style={
          isModal
            ? {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                margin: 0,
                padding: '24px',
                boxSizing: 'border-box',
                zIndex: 99999,
                animation: 'backdropFade 0.35s ease forwards',
                transition: 'opacity 0.45s ease',
              }
            : {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fafbfc',
                margin: 0,
                padding: '24px',
                boxSizing: 'border-box',
                zIndex: 99999,
                transition: 'opacity 0.45s ease',
              }
        }
      >
        <div
          className="w-full max-w-4xl transition-all duration-500 ease-out"
          id="stageContainer"
          style={
            isModal
              ? {
                  width: '92%',
                  maxWidth: '740px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: 'auto',
                  textAlign: 'center',
                  background: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  padding: '28px 24px',
                  animation: 'modalEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  transition: 'opacity 0.45s ease, transform 0.45s ease',
                }
              : {
                  width: '100%',
                  maxWidth: '800px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: 'auto',
                  textAlign: 'center',
                  transition: 'opacity 0.45s ease, transform 0.45s ease',
                }
          }
        >
          <div className="relative w-80 h-84 md:w-96 md:h-96 flex items-center justify-center my-1">
            <div
              className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-amber-300/60 via-yellow-400/50 to-amber-200/60 blur-2xl transition-all duration-1000 opacity-80"
              id="sphereGlow"
            />
            <svg
              className="w-full h-full relative z-10 transition-transform duration-700"
              fill="none"
              id="blochSvg"
              viewBox="0 0 400 440"
            >
              <defs>
                <marker
                  id="arrow-axis"
                  markerHeight="6"
                  markerWidth="6"
                  orient="auto-start-reverse"
                  refX="7"
                  refY="5"
                  viewBox="0 0 10 10"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0f172a" />
                </marker>
                <marker
                  id="arrow-blue"
                  markerHeight="6.5"
                  markerWidth="6.5"
                  orient="auto-start-reverse"
                  refX="7"
                  refY="5"
                  viewBox="0 0 10 10"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0033cc" />
                </marker>
                <marker
                  id="arrow-red"
                  markerHeight="6.5"
                  markerWidth="6.5"
                  orient="auto-start-reverse"
                  refX="7"
                  refY="5"
                  viewBox="0 0 10 10"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#cc0000" />
                </marker>
                <marker
                  id="arrow-green"
                  markerHeight="6.5"
                  markerWidth="6.5"
                  orient="auto-start-reverse"
                  refX="7"
                  refY="5"
                  viewBox="0 0 10 10"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#16a34a" />
                </marker>
                <marker
                  id="arrow-arc"
                  markerHeight="4.5"
                  markerWidth="4.5"
                  orient="auto"
                  refX="6"
                  refY="4"
                  viewBox="0 0 8 8"
                >
                  <path d="M 1 1.5 L 6 4 L 1 6.5 z" fill="#0f172a" />
                </marker>
              </defs>
              <g id="b-stage-axes">
                <circle
                  className="opacity-0 transition-opacity duration-200"
                  cx="170"
                  cy="235"
                  fill="#0f172a"
                  id="b-origin-dot"
                  r="3.5"
                />
                <path
                  className="draw-path"
                  d="M 170 235 L 170 35"
                  id="b-axis-z"
                  markerEnd="url(#arrow-axis)"
                  stroke="#000000"
                  strokeLinecap="round"
                  strokeWidth="1.6"
                />
                <text
                  className="opacity-0 font-semibold"
                  fill="#000000"
                  fontFamily="'Inter', serif, system-ui"
                  fontSize="24"
                  fontStyle="italic"
                  id="b-lbl-z"
                  textAnchor="middle"
                  x="170"
                  y="24"
                >
                  z
                </text>
                <path
                  className="draw-path"
                  d="M 170 235 L 385 235"
                  id="b-axis-y"
                  markerEnd="url(#arrow-axis)"
                  stroke="#000000"
                  strokeLinecap="round"
                  strokeWidth="1.6"
                />
                <path
                  className="draw-path"
                  d="M 170 235 L 20 235"
                  id="b-axis-y-neg"
                  stroke="#000000"
                  strokeLinecap="round"
                  strokeWidth="1.3"
                />
                <text
                  className="opacity-0 font-semibold"
                  fill="#000000"
                  fontFamily="'Inter', serif, system-ui"
                  fontSize="24"
                  fontStyle="italic"
                  id="b-lbl-y"
                  x="366"
                  y="268"
                >
                  y
                </text>
                <path
                  className="draw-path"
                  d="M 170 235 L 20 385"
                  id="b-axis-x"
                  markerEnd="url(#arrow-axis)"
                  stroke="#000000"
                  strokeLinecap="round"
                  strokeWidth="1.6"
                />
                <text
                  className="opacity-0 font-semibold"
                  fill="#000000"
                  fontFamily="'Inter', serif, system-ui"
                  fontSize="24"
                  fontStyle="italic"
                  id="b-lbl-x"
                  x="44"
                  y="392"
                >
                  x
                </text>
              </g>
              <g id="b-stage-geometry">
                <path
                  className="draw-path"
                  d="M 170 85 A 150 150 0 1 1 169.9 85 Z"
                  fill="#fffbeb"
                  fillOpacity="0.9"
                  id="b-sphere-circle"
                  stroke="#000000"
                  strokeWidth="1.8"
                />
                <path
                  className="draw-path"
                  d="M 20 235 A 150 60 0 1 0 320 235 A 150 60 0 1 0 20 235 Z"
                  fill="none"
                  id="b-equator-ellipse"
                  stroke="#000000"
                  strokeWidth="1.5"
                />
                <path
                  className="draw-path opacity-40"
                  d="M 170 85 A 60 150 0 0 1 170 385 A 60 150 0 0 1 170 85"
                  fill="none"
                  id="b-meridian-ellipse"
                  stroke="#64748b"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              </g>
              <g id="b-stage-basis">
                <path
                  className="draw-path"
                  d="M 170 235 L 170 90"
                  id="b-vec-0"
                  markerEnd="url(#arrow-blue)"
                  stroke="#0033cc"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
                <text
                  className="qubit-state-tag opacity-0"
                  fill="#0033cc"
                  fontFamily="'Inter', sans-serif"
                  fontSize="24"
                  fontWeight="600"
                  id="b-lbl-0"
                  x="178"
                  y="78"
                >
                  |0⟩
                </text>
                <path
                  className="draw-path"
                  d="M 170 235 L 170 380"
                  id="b-vec-1"
                  markerEnd="url(#arrow-red)"
                  stroke="#cc0000"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
                <text
                  className="qubit-state-tag opacity-0"
                  fill="#cc0000"
                  fontFamily="'Inter', sans-serif"
                  fontSize="24"
                  fontWeight="600"
                  id="b-lbl-1"
                  textAnchor="middle"
                  x="170"
                  y="415"
                >
                  |1⟩
                </text>
              </g>
              <g id="b-stage-angles">
                <path
                  className="draw-path opacity-80"
                  d="M 170 85 A 150 150 0 0 1 290 270"
                  fill="none"
                  id="b-proj-arc"
                  stroke="#000000"
                  strokeDasharray="2 3"
                  strokeWidth="1.3"
                />
                <path
                  className="draw-path"
                  d="M 170 235 L 286 269"
                  fill="none"
                  id="b-proj-line"
                  stroke="#000000"
                  strokeDasharray="2 3"
                  strokeWidth="1.3"
                />
                <path
                  className="draw-path"
                  d="M 136 269 A 60 24 0 0 0 234 254"
                  fill="none"
                  id="b-arc-phi"
                  markerEnd="url(#arrow-arc)"
                  stroke="#000000"
                  strokeWidth="1.4"
                />
                <text
                  className="opacity-0 font-medium"
                  fill="#000000"
                  fontFamily="'Inter', serif, system-ui"
                  fontSize="20"
                  fontStyle="italic"
                  id="b-lbl-phi"
                  x="180"
                  y="280"
                >
                  φ
                </text>
                <path
                  className="draw-path"
                  d="M 170 120 A 115 115 0 0 1 234 171"
                  fill="none"
                  id="b-arc-theta"
                  markerEnd="url(#arrow-arc)"
                  stroke="#000000"
                  strokeWidth="1.4"
                />
                <text
                  className="opacity-0 font-medium"
                  fill="#000000"
                  fontFamily="'Inter', serif, system-ui"
                  fontSize="20"
                  fontStyle="italic"
                  id="b-lbl-theta"
                  x="216"
                  y="132"
                >
                  θ
                </text>
              </g>
              <g id="b-stage-psi">
                <path
                  className="draw-path"
                  d="M 170 235 L 260 145"
                  id="b-vec-psi"
                  markerEnd="url(#arrow-green)"
                  stroke="#16a34a"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
                <text
                  className="qubit-state-tag opacity-0"
                  fill="#16a34a"
                  fontFamily="'Inter', sans-serif"
                  fontSize="24"
                  fontWeight="600"
                  id="b-lbl-psi"
                  x="286"
                  y="132"
                >
                  |ψ⟩
                </text>
              </g>
            </svg>
            <div className="absolute inset-0 pointer-events-none z-20" id="floatingQubitsLayer" />
          </div>
          <div
            className="mt-2 text-3xl md:text-4xl font-black tracking-widest text-center animate-pulse select-none z-30 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
            style={{ color: '#ffffff', fontWeight: 900 }}
          >
            Loading...
          </div>

        </div>
      </div>
    </div>
  );
}
