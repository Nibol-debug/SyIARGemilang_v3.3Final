'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  enabled?: boolean;
}

export default function AnimatedCounter({
  target,
  duration = 800,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  enabled = true,
}: AnimatedCounterProps) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const prevTarget = useRef(target);
  const hasStarted = useRef(false);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (target !== prevTarget.current) {
      hasStarted.current = false;
      prevTarget.current = target;
    }

    if (!enabled) {
      setCurrent(target);
      return;
    }

    if (hasStarted.current) return;
    hasStarted.current = true;

    const startTime = performance.now();
    const startVal = 0;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);
      const value = startVal + (target - startVal) * eased;

      setCurrent(value);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    }

    rafId.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId.current);
  }, [target, duration, enabled]);

  return (
    <span ref={ref} className={`inline-block tabular-nums value-change ${className}`}>
      {prefix}{current.toFixed(decimals)}{suffix}
    </span>
  );
}
