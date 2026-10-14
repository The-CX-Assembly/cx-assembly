'use client';

import { useEffect, useRef, useState } from 'react';

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Animates a number from its previous value to `target`. */
export function useCountUp(target: number, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = fromRef.current;
    let raf = 0;
    let start = 0;

    const tick = (now: number) => {
      if (!start) start = now + delay;
      const t = reduce ? 1 : Math.min(1, Math.max(0, (now - start) / duration));
      const next = from + (target - from) * easeOutExpo(t);
      fromRef.current = next;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);

  return value;
}

export const formatNumber = (n: number) => Math.round(n).toLocaleString('en-IN');
