'use client';
import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { BandId, SCORE_BANDS } from '@/data/milestoneBands';
import { BandCounts, bandFill, formatCount, formatPct } from '@/utils/bands';
import { EASE_OUT } from './motion';

interface BandColumnChartProps {
  counts: BandCounts;
  total: number;
  /** Who the counts belong to, used in tooltips and screen-reader labels ("Class VI", "whole school") */
  groupLabel: string;
  /** Shared y-scale maximum so small multiples compare honestly; defaults to this chart's own max */
  maxValue?: number;
  /** Plot height in px */
  height?: number;
  /** Show each column's share under its count */
  showShare?: boolean;
}

/**
 * One column per score band, value on each cap, band label underneath.
 * Columns grow from the baseline the first time the chart scrolls into view.
 * Hover or keyboard focus on a column shows its share of the group.
 */
export default function BandColumnChart({
  counts,
  total,
  groupLabel,
  maxValue,
  height = 180,
  showShare = false,
}: BandColumnChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const shown = inView || Boolean(reduce);
  const [active, setActive] = useState<BandId | null>(null);

  const max = Math.max(maxValue ?? 0, ...SCORE_BANDS.map((band) => counts[band.id]), 1);
  // Room above the tallest column for its value label(s)
  const plotHeight = height - (showShare ? 40 : 24);

  return (
    <figure className="m-0">
      <div
        ref={ref}
        className="flex items-end gap-2 border-b border-[#c9d3df] sm:gap-3 dark:border-white/15"
        style={{ height }}
      >
        {SCORE_BANDS.map((band, index) => {
          const value = counts[band.id];
          const barHeight = value > 0 ? Math.max((value / max) * plotHeight, 2) : 0;
          const isActive = active === band.id;
          const delay = reduce ? 0 : 0.1 + index * 0.08;
          // Keep the tooltip inside the chart at both edges
          const tooltipAlign =
            index === 0 ? 'left-0' : index === SCORE_BANDS.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2';

          return (
            <div
              key={band.id}
              tabIndex={0}
              role="img"
              aria-label={`${groupLabel}, ${band.description}: ${formatCount(value)} students, ${formatPct(value, total)}`}
              onPointerEnter={() => setActive(band.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(band.id)}
              onBlur={() => setActive(null)}
              className="relative flex h-full flex-1 cursor-default flex-col items-center justify-end rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <motion.div
                className="flex flex-col items-center"
                initial={false}
                animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                transition={{ duration: 0.4, delay: delay + 0.35 }}
              >
                <span className="text-sm font-semibold tabular-nums text-ink dark:text-slate-100">{formatCount(value)}</span>
                {showShare && (
                  <span className="text-[11px] tabular-nums text-ink-mute dark:text-slate-400">{formatPct(value, total)}</span>
                )}
              </motion.div>
              <motion.div
                className="mt-1.5 w-full max-w-[36px] origin-bottom rounded-t transition-opacity duration-150"
                style={{ height: barHeight, backgroundColor: bandFill(band.id), opacity: active && !isActive ? 0.4 : 1 }}
                initial={false}
                animate={{ scaleY: shown ? 1 : 0 }}
                transition={{ duration: 0.8, delay, ease: EASE_OUT }}
              />

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    role="presentation"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className={`pointer-events-none absolute bottom-full z-10 mb-1 w-max max-w-[220px] rounded-lg bg-white px-3 py-2 shadow-[0_8px_24px_rgba(0,55,112,0.14)] ring-1 ring-hairline dark:bg-night-raised dark:ring-white/10 ${tooltipAlign}`}
                  >
                    <p className="text-sm font-semibold tabular-nums text-ink dark:text-slate-50">
                      {formatCount(value)} students
                      <span className="ml-1.5 font-normal text-ink-mute dark:text-slate-400">{formatPct(value, total)}</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-secondary dark:text-slate-300">
                      <span className="inline-block h-0.5 w-3 rounded-full" style={{ backgroundColor: bandFill(band.id) }} />
                      {band.description}, {groupLabel}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-2 sm:gap-3" aria-hidden="true">
        {SCORE_BANDS.map((band) => (
          <span key={band.id} className="flex-1 text-center text-xs font-medium text-ink-mute dark:text-slate-400">
            {band.label}
          </span>
        ))}
      </div>
    </figure>
  );
}
