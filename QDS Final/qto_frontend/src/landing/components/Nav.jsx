import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribe } from '../scrollStore.js';

export default function Nav() {
  const fillRef = useRef();
  const navigate = useNavigate();

  useEffect(
    () =>
      subscribe((t) => {
        if (fillRef.current) fillRef.current.style.width = `${(t * 100).toFixed(1)}%`;
      }),
    []
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-[8vw] py-5 pointer-events-none"
         style={{ gap: '24px' }}>
      {/* Logo — fixed min-width so it never collapses into the right side */}
      <div className="pointer-events-auto flex-shrink-0" style={{ minWidth: '120px' }}>
        <span className="font-display font-semibold text-base tracking-wide whitespace-nowrap">
          QUANTUM<span className="text-cyan">·</span>NET
        </span>
      </div>

      {/* Right cluster: progress bar + button */}
      <div className="flex items-center gap-5 pointer-events-auto flex-shrink-0">
        <div className="w-[120px] h-[3px] rounded-full bg-black/[0.06] dark:bg-white/10 overflow-hidden hidden sm:block">
          <div
            ref={fillRef}
            className="h-full w-0"
            style={{ background: 'linear-gradient(90deg,#1fb6d6,#7c6cf6)' }}
          />
        </div>
        <button
          onClick={() => navigate('/simulator')}
          className="px-8 py-3.5 rounded-full text-[14px] font-display font-semibold tracking-wide text-white shadow-lg hover:shadow-cyan-500/25 transition-all hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg, #1fb6d6, #4c5fd5)', padding: '14px 28px' }}
        >
          Launch Simulator →
        </button>
      </div>
    </nav>
  );
}
