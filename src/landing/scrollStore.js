// Lightweight mutable store for scroll progress (0..1).
// Avoids putting fast-changing scroll values into React state, which would
// re-render the whole tree on every scroll tick. The 3D scene reads
// `scrollStore.t` directly inside useFrame; DOM overlays subscribe for the
// occasional update (stats, decision steps) via `subscribe`.
const listeners = new Set();

export const scrollStore = {
  t: 0,
  reducedMotion:
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};

export function setProgress(t) {
  scrollStore.t = t;
  listeners.forEach((fn) => fn(t));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
