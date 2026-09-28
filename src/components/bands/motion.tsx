'use client';
import React, { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react';

/** Shared easing: fast start, long soft landing */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Fades and lifts its content into place the first time it scrolls into view */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

const formatNumber = (value: number, decimals: number) =>
  value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Counts up to `value` once it is on screen, drawing the eye to headline figures.
 * Driven by a motion value so React does not re-render every frame; screen readers get the final value.
 */
export function CountUp({
  value,
  decimals = 0,
  suffix = '',
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const current = useMotionValue(0);
  const text = useTransform(current, (v) => `${formatNumber(v, decimals)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      current.set(value);
      return;
    }
    const controls = animate(current, value, { duration: 1.4, ease: EASE_OUT });
    return () => controls.stop();
  }, [inView, reduce, value, current]);

  return (
    <span className={className}>
      <motion.span ref={ref} aria-hidden="true">
        {text}
      </motion.span>
      <span className="sr-only">
        {formatNumber(value, decimals)}
        {suffix}
      </span>
    </span>
  );
}
