"""
Setup script to build the exact elegant Milestone Dashboard for Class 9 in CCWS-Website.
"""

import json
import os

ROSTER_PATH = "e:/skilizee/CCIS_Website/scripts/roster_5exam.json"
TARGET_DIR = "e:/skilizee/CCWS-Website"

with open(ROSTER_PATH, "r", encoding="utf-8") as f:
    roster = json.load(f)

def get_5band(scores):
    valid = [float(s) for s in scores if s is not None]
    n = len(valid)
    if n == 0:
        return {"b95": 0, "b90": 0, "b80": 0, "b70": 0, "below70": 0}
    b95 = sum(1 for s in valid if s >= 95.0)
    b90 = sum(1 for s in valid if 90.0 <= s < 95.0)
    b80 = sum(1 for s in valid if 80.0 <= s < 90.0)
    b70 = sum(1 for s in valid if 70.0 <= s < 80.0)
    below70 = sum(1 for s in valid if s < 70.0)
    return {"b95": b95, "b90": b90, "b80": b80, "b70": b70, "below70": below70}

# Generate data for both Exam 2 (Mid Term) and Exam 1 (Pre Mid Term)
def build_milestone_dataset(exam_id, milestone_name):
    # Overall
    ov_scores = [s.get("exams", {}).get(exam_id, {}).get("overall", {}).get("value") for s in roster]
    ov_counts = get_5band(ov_scores)
    
    # Subjects
    subject_defs = [
        {"id": "it", "label": "Information Technology", "key": "it"},
        {"id": "maths", "label": "Mathematics", "key": "maths"},
        {"id": "socialScience", "label": "Social Science", "key": "socialScience"},
        {"id": "science", "label": "Science", "key": "science"},
        {"id": "english", "label": "English Language & Lit", "key": "english"},
        {"id": "secondLanguage", "label": "Second Language (H/S/F)", "key": "secondLanguage"},
    ]
    
    subjects_data = []
    for sub in subject_defs:
        scores = []
        for s in roster:
            v = s.get("exams", {}).get(exam_id, {}).get("subjects", {}).get(sub["key"], {}).get("value")
            if v is not None:
                scores.append((v / 20.0) * 100.0)
        counts = get_5band(scores)
        if len(scores) > 0:
            subjects_data.append({
                "classId": sub["id"],
                "label": sub["label"],
                "counts": counts
            })
            
    # Sections
    sections_data = []
    for sec in ["AURA", "ZEN", "NEO"]:
        sec_scores = [s.get("exams", {}).get(exam_id, {}).get("overall", {}).get("value") for s in roster if s.get("group") == sec]
        counts = get_5band(sec_scores)
        if len(sec_scores) > 0:
            sections_data.append({
                "classId": sec.lower(),
                "label": f"Section IX-{sec}",
                "counts": counts
            })

    return {
        "schoolName": "Cambridge Court World School",
        "milestone": milestone_name,
        "academicYear": "2026-27",
        "updatedOn": "2026-09-28",
        "isSample": False,
        "overallCounts": ov_counts,
        "classes": subjects_data,
        "sections": sections_data
    }

data_e2 = build_milestone_dataset("exam-2", "Mid Term Examination")
data_e1 = build_milestone_dataset("exam-1", "Pre-Mid Term Examination")

# 1. Write tailwind.config.ts
tailwind_path = os.path.join(TARGET_DIR, "tailwind.config.ts")
with open(tailwind_path, "w", encoding="utf-8") as f:
    f.write('''import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0d253d",
          secondary: "#273951",
          mute: "#64748d",
        },
        canvas: { soft: "#f6f9fc" },
        hairline: "#e3e8ee",
        night: { DEFAULT: "#0a1426", card: "#0f1d35", raised: "#172a4b" },
        maroon: {
          DEFAULT: "#960330",
          dark: "#1c3447",
        },
        navy: {
          DEFAULT: "#1c3447",
          dark: "#142635",
        },
        beige: {
          DEFAULT: "#F1E8D8",
          line: "#DDCFB0",
        },
        orange: {
          DEFAULT: "#B5542A",
          soft: "#E7B695",
        },
        white: "#FFFFFF",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-public-sans)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
      },
      boxShadow: {
        'glow-maroon': '0 0 15px rgba(154, 7, 54, 0.15)',
        'glow-orange': '0 0 15px rgba(181, 84, 42, 0.25)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
export default config;
''')
print("[OK] Updated tailwind.config.ts")

# 2. Write src/utils/csv.ts
os.makedirs(os.path.join(TARGET_DIR, "src/utils"), exist_ok=True)
csv_utils_path = os.path.join(TARGET_DIR, "src/utils/csv.ts")
with open(csv_utils_path, "w", encoding="utf-8") as f:
    f.write('''const UTF8_BOM = String.fromCharCode(0xfeff);

export type CsvCell = string | number | null | undefined;

function escapeCell(cell: CsvCell): string {
  if (cell === null || cell === undefined) return '';
  const text = String(cell);
  return /[",\\r\\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(headers: string[], rows: CsvCell[][]): string {
  return [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\\r\\n');
}

export function downloadCsv(filename: string, headers: string[], rows: CsvCell[][]): void {
  const blob = new Blob([UTF8_BOM + toCsv(headers, rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
''')
print("[OK] Written src/utils/csv.ts")

# 3. Write src/data/class9Bands.ts
os.makedirs(os.path.join(TARGET_DIR, "src/data"), exist_ok=True)
bands_data_path = os.path.join(TARGET_DIR, "src/data/class9Bands.ts")
with open(bands_data_path, "w", encoding="utf-8") as f:
    f.write(f'''export type BandId = 'b95' | 'b90' | 'b80' | 'b70' | 'below70';

export interface ScoreBand {{
  id: BandId;
  label: string;
  description: string;
  fill: {{ light: string; dark: string }};
  ink: {{ light: string; dark: string }};
}}

const INK_ON_DARK = '#f8fafc';
const INK_ON_LIGHT = '#0b1b33';

export const SCORE_BANDS: ScoreBand[] = [
  {{ id: 'b95', label: '95+', description: '95% and above', fill: {{ light: '#0d366b', dark: '#9ec5f4' }}, ink: {{ light: INK_ON_DARK, dark: INK_ON_LIGHT }} }},
  {{ id: 'b90', label: '90-94', description: '90% to 94.9%', fill: {{ light: '#1c5cab', dark: '#6da7ec' }}, ink: {{ light: INK_ON_DARK, dark: INK_ON_LIGHT }} }},
  {{ id: 'b80', label: '80-89', description: '80% to 89.9%', fill: {{ light: '#2a78d6', dark: '#3987e5' }}, ink: {{ light: INK_ON_DARK, dark: INK_ON_LIGHT }} }},
  {{ id: 'b70', label: '70-79', description: '70% to 79.9%', fill: {{ light: '#5598e7', dark: '#256abf' }}, ink: {{ light: INK_ON_LIGHT, dark: INK_ON_DARK }} }},
  {{ id: 'below70', label: '<70', description: 'Below 70%', fill: {{ light: '#86b6ef', dark: '#184f95' }}, ink: {{ light: INK_ON_LIGHT, dark: INK_ON_DARK }} }},
];

export interface ClassBandCounts {{
  classId: string;
  label: string;
  counts: Record<BandId, number>;
}}

export interface MilestoneBandData {{
  schoolName: string;
  milestone: string;
  academicYear: string;
  updatedOn: string;
  isSample: boolean;
  overallCounts: Record<BandId, number>;
  classes: ClassBandCounts[];
  sections: ClassBandCounts[];
}}

export const CLASS_IX_EXAM2_DATA: MilestoneBandData = {json.dumps(data_e2, indent=2)};

export const CLASS_IX_EXAM1_DATA: MilestoneBandData = {json.dumps(data_e1, indent=2)};
''')
print("[OK] Written src/data/class9Bands.ts")

# 4. Write src/utils/bands.ts
bands_utils_path = os.path.join(TARGET_DIR, "src/utils/bands.ts")
with open(bands_utils_path, "w", encoding="utf-8") as f:
    f.write('''import { BandId, ClassBandCounts, SCORE_BANDS } from '@/data/class9Bands';

export type BandCounts = Record<BandId, number>;

export const totalOf = (counts: BandCounts) => SCORE_BANDS.reduce((sum, band) => sum + counts[band.id], 0);

export function sumCounts(classes: ClassBandCounts[]): BandCounts {
  const total = Object.fromEntries(SCORE_BANDS.map((band) => [band.id, 0])) as BandCounts;
  for (const cls of classes) {
    for (const band of SCORE_BANDS) total[band.id] += cls.counts[band.id];
  }
  return total;
}

export function atOrAbove(counts: BandCounts, bandId: BandId) {
  let sum = 0;
  for (const band of SCORE_BANDS) {
    sum += counts[band.id];
    if (band.id === bandId) break;
  }
  return sum;
}

export const share = (value: number, total: number) => (total > 0 ? (value / total) * 100 : 0);

export const formatPct = (value: number, total: number) => `${share(value, total).toFixed(1)}%`;

export const formatCount = (value: number) => value.toLocaleString('en-IN');

export const bandFill = (id: BandId) => `var(--band-${id})`;
export const bandInk = (id: BandId) => `var(--band-${id}-ink)`;

export const ninetyShare = (counts: BandCounts) => share(atOrAbove(counts, 'b90'), totalOf(counts));

export function leaderBy90(classes: ClassBandCounts[]): ClassBandCounts | undefined {
  if (classes.length === 0) return undefined;
  return classes.reduce((best, cls) => (ninetyShare(cls.counts) > ninetyShare(best.counts) ? cls : best));
}

export function bandCsv(classes: ClassBandCounts[], overallCounts?: BandCounts) {
  const headers = [
    'Subject / Cohort',
    'Students',
    ...SCORE_BANDS.flatMap((band) => [`${band.description} (students)`, `${band.description} (%)`]),
    '90+ (students)',
    '90+ (%)',
  ];
  const row = (label: string, counts: BandCounts) => {
    const total = totalOf(counts);
    const pct = (value: number) => share(value, total).toFixed(1);
    return [
      label,
      total,
      ...SCORE_BANDS.flatMap((band) => [counts[band.id], pct(counts[band.id])]),
      atOrAbove(counts, 'b90'),
      pct(atOrAbove(counts, 'b90')),
    ];
  };
  const rows = classes.map((cls) => row(cls.label, cls.counts));
  if (overallCounts) {
    rows.push(row('Whole Class IX', overallCounts));
  }
  return { headers, rows };
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
''')
print("[OK] Written src/utils/bands.ts")

# 5. Write src/components/bands/styles.ts
os.makedirs(os.path.join(TARGET_DIR, "src/components/bands"), exist_ok=True)
styles_path = os.path.join(TARGET_DIR, "src/components/bands/styles.ts")
with open(styles_path, "w", encoding="utf-8") as f:
    f.write('''export const cardClass =
  'rounded-xl border border-hairline bg-white shadow-[0_1px_3px_rgba(0,55,112,0.08)] dark:border-white/[0.07] dark:bg-night-card dark:shadow-none';

export const raisedCardClass =
  'rounded-xl border border-white/70 bg-white/90 shadow-[0_8px_24px_rgba(0,55,112,0.08),0_2px_6px_rgba(0,55,112,0.04)] backdrop-blur-sm dark:border-white/[0.08] dark:bg-night-card/80 dark:shadow-none';

export const textPrimary = 'text-ink dark:text-slate-50';
export const textSecondary = 'text-ink-secondary dark:text-slate-300';
export const textMute = 'text-ink-mute dark:text-slate-400';

export const cardTitleClass = `text-[17px] font-medium tracking-tight ${textPrimary}`;
export const cardSubtitleClass = `text-[13px] ${textMute}`;

export const tagClass =
  'inline-flex items-center gap-1 rounded-full bg-[#dfe9fb] px-2.5 py-1 text-[11px] font-semibold text-[#1c4f99] dark:bg-blue-400/15 dark:text-blue-200';
''')
print("[OK] Written src/components/bands/styles.ts")

# 6. Write src/components/bands/motion.tsx
motion_path = os.path.join(TARGET_DIR, "src/components/bands/motion.tsx")
with open(motion_path, "w", encoding="utf-8") as f:
    f.write('''"use client";
import React, { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react';

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

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
''')
print("[OK] Written src/components/bands/motion.tsx")

# 7. Write src/components/bands/BandThemeStyle.tsx
theme_style_path = os.path.join(TARGET_DIR, "src/components/bands/BandThemeStyle.tsx")
with open(theme_style_path, "w", encoding="utf-8") as f:
    f.write('''import React from 'react';
import { SCORE_BANDS } from '@/data/class9Bands';

const vars = (mode: 'light' | 'dark') =>
  SCORE_BANDS.map((band) => `--band-${band.id}:${band.fill[mode]};--band-${band.id}-ink:${band.ink[mode]};`).join('');

const PRINT_CSS = [
  '@page{size:A4 landscape;margin:10mm}',
  '.mdash{background:#fff!important}',
  '.mdash *{-webkit-print-color-adjust:exact;print-color-adjust:exact}',
  '.mdash .sticky{position:static!important;backdrop-filter:none!important}',
  '.mdash .print-hide{display:none!important}',
  '.mdash .print-avoid-break{break-inside:avoid}',
  '.mdash [style*=opacity]{opacity:1!important}',
  '.mdash [style*=transform]{transform:none!important}',
].join('');

export default function BandThemeStyle() {
  const css = `.mdash{${vars('light')}}.dark .mdash{${vars('dark')}}@media print{${PRINT_CSS}}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
''')
print("[OK] Written src/components/bands/BandThemeStyle.tsx")

# 8. Write src/components/bands/BandColumnChart.tsx
chart_path = os.path.join(TARGET_DIR, "src/components/bands/BandColumnChart.tsx")
with open(chart_path, "w", encoding="utf-8") as f:
    f.write('''"use client";
import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { BandId, SCORE_BANDS } from '@/data/class9Bands';
import { BandCounts, bandFill, formatCount, formatPct } from '@/utils/bands';
import { EASE_OUT } from './motion';

interface BandColumnChartProps {
  counts: BandCounts;
  total: number;
  groupLabel: string;
  maxValue?: number;
  height?: number;
  showShare?: boolean;
}

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
                      {formatCount(value)} scholars
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
''')
print("[OK] Written src/components/bands/BandColumnChart.tsx")

# 9. Write src/components/bands/BandTables.tsx
tables_path = os.path.join(TARGET_DIR, "src/components/bands/BandTables.tsx")
with open(tables_path, "w", encoding="utf-8") as f:
    f.write('''"use client";
import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { BandId, ClassBandCounts, SCORE_BANDS } from '@/data/class9Bands';
import { BandCounts, atOrAbove, bandFill, formatCount, formatPct, share, totalOf } from '@/utils/bands';
import { EASE_OUT } from './motion';
import { tagClass } from './styles';

const th = 'px-3 pb-3 pt-1 text-xs font-medium text-ink-mute whitespace-nowrap dark:text-slate-400';
const td = 'px-3 py-3.5 tabular-nums';
const strong = 'text-ink dark:text-slate-50';
const mute = 'text-ink-mute dark:text-slate-400';

const rowsVariants: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } };
const rowVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

function RevealBody({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.tbody
      className={className}
      variants={rowsVariants}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.tbody>
  );
}

function Swatch({ bandId, size = 'h-2.5 w-2.5' }: { bandId: BandId; size?: string }) {
  return <span className={`${size} flex-shrink-0 rounded-[3px]`} style={{ backgroundColor: bandFill(bandId) }} aria-hidden="true" />;
}

function CountCell({ value, total, emphasis }: { value: number; total: number; emphasis?: boolean }) {
  return (
    <td className={`${td} text-right`}>
      <span className={`block text-[15px] ${emphasis ? 'font-semibold' : 'font-medium'} ${strong}`}>{formatCount(value)}</span>
      <span className={`block text-xs ${mute}`}>{formatPct(value, total)}</span>
    </td>
  );
}

type SortKey = 'class' | 'students' | 'ninety' | BandId;
type SortDir = 'asc' | 'desc';
interface SortState {
  key: SortKey;
  dir: SortDir;
}

const DEFAULT_SORT: SortState = { key: 'class', dir: 'asc' };
const SORT_KEYS: SortKey[] = ['class', 'students', 'ninety', ...SCORE_BANDS.map((band) => band.id)];

function sortValue(cls: ClassBandCounts, index: number, key: SortKey) {
  if (key === 'class') return index;
  const total = totalOf(cls.counts);
  if (key === 'students') return total;
  if (key === 'ninety') return share(atOrAbove(cls.counts, 'b90'), total);
  return share(cls.counts[key], total);
}

export function ClassBandTable({
  classes,
  schoolCounts,
  leaderId,
  title = "Subject",
}: {
  classes: ClassBandCounts[];
  schoolCounts: BandCounts;
  leaderId?: string;
  title?: string;
}) {
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const schoolTotal = totalOf(schoolCounts);

  const toggle = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'class' ? 'asc' : 'desc' }
    );
  };

  const sorted = useMemo(() => {
    const list = classes.map((cls, index) => ({ cls, index }));
    list.sort((a, b) => {
      const va = sortValue(a.cls, a.index, sort.key);
      const vb = sortValue(b.cls, b.index, sort.key);
      const cmp = typeof va === 'string' ? (va as string).localeCompare(vb as string) : (va as number) - (vb as number);
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return list.map((item) => item.cls);
  }, [classes, sort]);

  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    if (sort.key !== colKey) return <ArrowUpDown className="h-3 w-3 opacity-30" aria-hidden="true" />;
    return sort.dir === 'asc' ? <ArrowUp className="h-3 w-3 text-blue-600" aria-hidden="true" /> : <ArrowDown className="h-3 w-3 text-blue-600" aria-hidden="true" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" aria-label="Class and subject score band distribution">
        <thead>
          <tr className="border-b border-hairline dark:border-white/10">
            <th scope="col" className={`${th} text-left`}>
              <button
                type="button"
                onClick={() => toggle('class')}
                className="inline-flex items-center gap-1.5 hover:text-ink dark:hover:text-slate-200"
              >
                <span>{title}</span>
                <SortIcon colKey="class" />
              </button>
            </th>
            <th scope="col" className={`${th} text-right`}>
              <button
                type="button"
                onClick={() => toggle('students')}
                className="inline-flex items-center gap-1.5 hover:text-ink dark:hover:text-slate-200 ml-auto"
              >
                <span>Students</span>
                <SortIcon colKey="students" />
              </button>
            </th>
            {SCORE_BANDS.map((band) => (
              <th key={band.id} scope="col" className={`${th} text-right`}>
                <button
                  type="button"
                  onClick={() => toggle(band.id)}
                  className="inline-flex items-center gap-1.5 hover:text-ink dark:hover:text-slate-200 ml-auto"
                >
                  <Swatch bandId={band.id} />
                  <span>{band.label}</span>
                  <SortIcon colKey={band.id} />
                </button>
              </th>
            ))}
            <th scope="col" className={`${th} text-right`}>
              <button
                type="button"
                onClick={() => toggle('ninety')}
                className="inline-flex items-center gap-1.5 hover:text-ink dark:hover:text-slate-200 ml-auto"
              >
                <span>90+ total</span>
                <SortIcon colKey="ninety" />
              </button>
            </th>
          </tr>
        </thead>

        <RevealBody className="divide-y divide-hairline dark:divide-white/5">
          {sorted.map((cls) => {
            const total = totalOf(cls.counts);
            const ninetyTotal = atOrAbove(cls.counts, 'b90');
            const isLeader = cls.classId === leaderId;

            return (
              <motion.tr key={cls.classId} variants={rowVariants} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02]">
                <th scope="row" className={`${td} font-medium text-ink dark:text-slate-100`}>
                  <div className="flex items-center gap-2">
                    <span>{cls.label}</span>
                    {isLeader && <span className={tagClass}>Top 90+</span>}
                  </div>
                </th>
                <td className={`${td} text-right font-medium text-ink dark:text-slate-200`}>
                  {formatCount(total)}
                </td>
                {SCORE_BANDS.map((band) => (
                  <CountCell key={band.id} value={cls.counts[band.id]} total={total} />
                ))}
                <td className={`${td} text-right`}>
                  <span className={`block text-[15px] font-semibold text-ink dark:text-slate-50`}>
                    {formatPct(ninetyTotal, total)}
                  </span>
                  <span className={`block text-xs ${mute}`}>{formatCount(ninetyTotal)} students</span>
                </td>
              </motion.tr>
            );
          })}
        </RevealBody>

        <tfoot>
          <tr className="border-t-2 border-hairline bg-slate-50/50 font-medium dark:border-white/10 dark:bg-night-card">
            <th scope="row" className={`${td} text-left font-semibold ${strong}`}>
              Whole Class IX
            </th>
            <td className={`${td} text-right font-semibold ${strong}`}>{formatCount(schoolTotal)}</td>
            {SCORE_BANDS.map((band) => (
              <CountCell key={band.id} value={schoolCounts[band.id]} total={schoolTotal} emphasis />
            ))}
            <td className={`${td} text-right`}>
              <span className={`block text-[15px] font-bold ${strong}`}>
                {formatPct(atOrAbove(schoolCounts, 'b90'), schoolTotal)}
              </span>
              <span className={`block text-xs ${mute}`}>{formatCount(atOrAbove(schoolCounts, 'b90'))} students</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function SchoolBandTable({ counts }: { counts: BandCounts }) {
  const total = totalOf(counts);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" aria-label="Score band breakdown">
        <thead>
          <tr className="border-b border-hairline dark:border-white/10">
            <th scope="col" className={`${th} text-left`}>Score band</th>
            <th scope="col" className={`${th} text-right`}>Students</th>
            <th scope="col" className={`${th} text-right`}>Share</th>
            <th scope="col" className={`${th} text-right`}>At or above</th>
          </tr>
        </thead>
        <RevealBody className="divide-y divide-hairline dark:divide-white/5">
          {SCORE_BANDS.map((band) => {
            const count = counts[band.id];
            const cumulative = atOrAbove(counts, band.id);
            return (
              <motion.tr key={band.id} variants={rowVariants} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02]">
                <th scope="row" className={`${td} font-medium ${strong}`}>
                  <div className="flex items-center gap-2">
                    <Swatch bandId={band.id} />
                    <span>{band.description}</span>
                  </div>
                </th>
                <td className={`${td} text-right font-medium ${strong}`}>{formatCount(count)}</td>
                <td className={`${td} text-right text-xs ${mute}`}>{formatPct(count, total)}</td>
                <td className={`${td} text-right font-medium ${strong}`}>
                  {formatCount(cumulative)} <span className={`text-xs ${mute} font-normal`}>({formatPct(cumulative, total)})</span>
                </td>
              </motion.tr>
            );
          })}
        </RevealBody>
        <tfoot>
          <tr className="border-t-2 border-hairline bg-slate-50/50 font-medium dark:border-white/10 dark:bg-night-card">
            <th scope="row" className={`${td} font-semibold ${strong}`}>Total</th>
            <td className={`${td} text-right font-semibold ${strong}`}>{formatCount(total)}</td>
            <td className={`${td} text-right text-xs ${mute}`}>100%</td>
            <td className={`${td} text-right`}>—</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
''')
print("[OK] Written src/components/bands/BandTables.tsx")

# 10. Write src/components/bands/DashboardFrame.tsx
frame_path = os.path.join(TARGET_DIR, "src/components/bands/DashboardFrame.tsx")
with open(frame_path, "w", encoding="utf-8") as f:
    f.write('''"use client";
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Download, GraduationCap, Maximize2, Minimize2, Moon, Printer, Sun } from 'lucide-react';
import { downloadCsv, type CsvCell } from '@/utils/csv';
import { tagClass } from './styles';

interface DashboardFrameProps {
  schoolName: string;
  updatedLabel: string;
  isSample: boolean;
  fontClassName: string;
  csv?: { filename: string; headers: string[]; rows: CsvCell[][] };
  examSwitcher?: React.ReactNode;
  children: React.ReactNode;
}

const THEME_KEY = 'milestone-dashboard-theme';
const PAGE_BG = { light: '#f6f9fc', dark: '#0a1426' };

const pillButton =
  'inline-flex h-9 touch-manipulation items-center justify-center gap-2 rounded-full px-3.5 text-sm font-medium transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-night';
const pillGhost = `${pillButton} border border-hairline bg-white/80 text-ink hover:border-[#c9d3df] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10`;
const pillSolid = `${pillButton} bg-ink text-white hover:bg-ink-secondary dark:bg-slate-100 dark:text-ink dark:hover:bg-white`;

function GradientWash() {
  return (
    <div
      aria-hidden="true"
      className="print-hide pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_45%,transparent)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(40%_60%_at_12%_20%,#d6e5fb_0%,transparent_70%),radial-gradient(35%_55%_at_45%_0%,#e9eefc_0%,transparent_70%),radial-gradient(38%_60%_at_78%_18%,#bcd6f7_0%,transparent_70%),radial-gradient(30%_45%_at_96%_60%,#fbeee0_0%,transparent_70%)] dark:hidden" />
      <div className="absolute inset-0 hidden bg-[radial-gradient(40%_60%_at_12%_15%,rgba(37,106,191,0.30)_0%,transparent_70%),radial-gradient(38%_60%_at_80%_10%,rgba(57,135,229,0.22)_0%,transparent_70%),radial-gradient(30%_45%_at_50%_40%,rgba(24,79,149,0.25)_0%,transparent_70%)] dark:block" />
    </div>
  );
}

export default function DashboardFrame({ schoolName, updatedLabel, isSample, fontClassName, csv, examSwitcher, children }: DashboardFrameProps) {
  const [dark, setDark] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const darkBeforePrint = useRef<boolean | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      setDark(saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch {
      /* ignore */
    }
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    const onBeforePrint = () =>
      setDark((prev) => {
        darkBeforePrint.current = prev;
        return false;
      });
    const onAfterPrint = () => {
      if (darkBeforePrint.current !== null) setDark(darkBeforePrint.current);
      darkBeforePrint.current = null;
    };
    document.addEventListener('fullscreenchange', onFullscreen);
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const previous = {
      colorScheme: root.style.colorScheme,
      scrollPadding: root.style.scrollPaddingTop,
      background: document.body.style.backgroundColor,
    };
    root.style.colorScheme = dark ? 'dark' : 'light';
    root.style.scrollPaddingTop = '5rem';
    document.body.style.backgroundColor = dark ? PAGE_BG.dark : PAGE_BG.light;
    return () => {
      root.style.colorScheme = previous.colorScheme;
      root.style.scrollPaddingTop = previous.scrollPadding;
      document.body.style.backgroundColor = previous.background;
    };
  }, [dark]);

  const toggleTheme = () => {
    setDark((prev) => {
      try {
        localStorage.setItem(THEME_KEY, prev ? 'light' : 'dark');
      } catch {
        /* ignore */
      }
      return !prev;
    });
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  return (
    <div className={dark ? 'dark' : ''}>
      <div
        className={`mdash ${fontClassName} relative isolate min-h-screen bg-canvas-soft text-ink antialiased transition-colors duration-300 dark:bg-night dark:text-slate-100`}
        style={{ colorScheme: dark ? 'dark' : 'light' }}
      >
        <a
          href="#main"
          className="sr-only z-30 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
        >
          Skip to Content
        </a>
        <GradientWash />

        <div className="sticky top-0 z-20 bg-canvas-soft/60 backdrop-blur-xl dark:bg-night/60">
          <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-ink text-white dark:bg-white/10 dark:text-blue-100">
                <GraduationCap className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[15px] font-semibold tracking-tight">Milestone Results</p>
                <p className="truncate text-xs text-ink-mute dark:text-slate-400" translate="no">
                  {schoolName} · Class IX
                </p>
              </div>
            </div>

            <div className="print-hide flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
              {examSwitcher}
              <span className="hidden text-xs text-ink-mute xl:inline dark:text-slate-400">Updated {updatedLabel}</span>
              {csv && (
                <button
                  type="button"
                  onClick={() => downloadCsv(csv.filename, csv.headers, csv.rows)}
                  className={`${pillGhost} max-sm:w-9 max-sm:px-0`}
                  aria-label="Download class-wise figures as CSV"
                  title="Download CSV"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => window.print()}
                className={`${pillGhost} max-sm:w-9 max-sm:px-0`}
                aria-label="Print Dashboard"
                title="Print or save as PDF"
              >
                <Printer className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className={`${pillGhost} w-9 px-0`}
                aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
                title={dark ? 'Light theme' : 'Dark theme'}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={dark ? 'sun' : 'moon'}
                    initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
                    transition={{ duration: 0.2 }}
                    className="flex"
                  >
                    {dark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
                  </motion.span>
                </AnimatePresence>
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className={`${pillSolid} max-sm:w-9 max-sm:px-0`}
                aria-label={fullscreen ? 'Exit fullscreen' : 'Present fullscreen'}
              >
                {fullscreen ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
                <span className="hidden sm:inline">{fullscreen ? 'Exit' : 'Present'}</span>
              </button>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
''')
print("[OK] Written src/components/bands/DashboardFrame.tsx")

# 11. Write src/app/class-9-performance/page.tsx
page_path = os.path.join(TARGET_DIR, "src/app/class-9-performance/page.tsx")
with open(page_path, "w", encoding="utf-8") as f:
    f.write('''"use client";

import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, Trophy, Calendar, BookOpen, Layers } from 'lucide-react';
import {
  CLASS_IX_EXAM1_DATA,
  CLASS_IX_EXAM2_DATA,
  type ClassBandCounts,
  type MilestoneBandData,
} from '@/data/class9Bands';
import {
  BandCounts,
  atOrAbove,
  bandCsv,
  formatCount,
  formatDate,
  formatPct,
  leaderBy90,
  ninetyShare,
  totalOf,
} from '@/utils/bands';
import DashboardFrame from '@/components/bands/DashboardFrame';
import BandThemeStyle from '@/components/bands/BandThemeStyle';
import BandColumnChart from '@/components/bands/BandColumnChart';
import { ClassBandTable, SchoolBandTable } from '@/components/bands/BandTables';
import { CountUp, Reveal } from '@/components/bands/motion';
import {
  cardClass,
  cardSubtitleClass,
  cardTitleClass,
  raisedCardClass,
  tagClass,
  textMute,
  textPrimary,
  textSecondary,
} from '@/components/bands/styles';

const round1 = (value: number) => Math.round(value * 10) / 10;

function SectionHeading({ id, title, description }: { id: string; title: string; description: string }) {
  return (
    <Reveal className="mb-5">
      <h2 id={id} className={`text-balance text-[26px] font-light tracking-[-0.02em] ${textPrimary}`}>
        {title}
      </h2>
      <p className={`mt-1 text-pretty text-sm ${textMute}`}>{description}</p>
    </Reveal>
  );
}

function HeroStat({ label, value, detail, delay }: { label: string; value: number; detail: string; delay: number }) {
  return (
    <Reveal delay={delay} className={`${raisedCardClass} p-5 sm:p-6`}>
      <dt className={`text-[13px] font-medium ${textMute}`}>{label}</dt>
      <dd className="mt-2">
        <CountUp
          value={value}
          className={`block text-[34px] font-light leading-none tracking-[-0.03em] tabular-nums sm:text-[40px] ${textPrimary}`}
        />
        <span className={`mt-2 block text-xs ${textMute}`}>{detail}</span>
      </dd>
    </Reveal>
  );
}

function VsClass({ subjectShare, classShare }: { subjectShare: number; classShare: number }) {
  const delta = round1(subjectShare - classShare);
  if (delta === 0) {
    return (
      <p className={`inline-flex items-center gap-1 text-xs font-medium ${textMute}`}>
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        Level with the class at 90+
      </p>
    );
  }
  const above = delta > 0;
  const Icon = above ? ArrowUpRight : ArrowDownRight;
  return (
    <p
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        above ? 'text-[#006300] dark:text-[#3ecf6e]' : 'text-[#b42318] dark:text-[#f58b80]'
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {Math.abs(delta).toFixed(1)} pts {above ? 'above' : 'below'} the class at 90+
    </p>
  );
}

function SubjectCard({
  cls,
  index,
  isLeader,
  classShare,
  classMax,
}: {
  cls: ClassBandCounts;
  index: number;
  isLeader: boolean;
  classShare: number;
  classMax: number;
}) {
  const total = totalOf(cls.counts);
  return (
    <Reveal delay={(index % 3) * 0.08} className={`${cardClass} print-avoid-break flex flex-col p-6`}>
      <article className="flex h-full flex-col" aria-labelledby={`sub-${cls.classId}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id={`sub-${cls.classId}`} className={`truncate text-lg font-medium tracking-tight ${textPrimary}`}>
              {cls.label}
            </h3>
            <p className={`text-[13px] tabular-nums ${textMute}`}>{formatCount(total)} scholars</p>
          </div>
          {isLeader && (
            <span className={`${tagClass} flex-shrink-0`}>
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
              Top 90+
            </span>
          )}
        </div>

        <dl className="mt-5 grid grid-cols-2 divide-x divide-hairline dark:divide-white/10">
          <div className="flex flex-col-reverse pr-4">
            <dt className={`mt-1 text-xs ${textMute}`}>scored 90+</dt>
            <dd className={`text-[32px] font-light leading-none tracking-[-0.03em] tabular-nums ${textPrimary}`}>
              {formatPct(atOrAbove(cls.counts, 'b90'), total)}
            </dd>
          </div>
          <div className="flex flex-col-reverse pl-4">
            <dt className={`mt-1 text-xs ${textMute}`}>scored 95+</dt>
            <dd className={`text-[32px] font-light leading-none tracking-[-0.03em] tabular-nums ${textSecondary}`}>
              {formatPct(cls.counts.b95, total)}
            </dd>
          </div>
        </dl>
        <div className="mt-3">
          <VsClass subjectShare={ninetyShare(cls.counts)} schoolShare={classShare} />
        </div>

        <div className="mt-auto pt-6">
          <BandColumnChart counts={cls.counts} total={total} groupLabel={cls.label} maxValue={classMax} height={150} />
        </div>
      </article>
    </Reveal>
  );
}

export default function Class9MilestoneDashboardPage() {
  const [selectedExam, setSelectedExam] = useState<'e2' | 'e1'>('e2');
  const [viewTab, setViewTab] = useState<'subjects' | 'sections'>('subjects');

  const data: MilestoneBandData = selectedExam === 'e2' ? CLASS_IX_EXAM2_DATA : CLASS_IX_EXAM1_DATA;

  // Active items for tables & cards (Subjects or Sections)
  const activeItems = viewTab === 'subjects' ? data.classes : data.sections;

  const leader = leaderBy90(activeItems);
  const classCounts: BandCounts = data.overallCounts;
  const classTotal = totalOf(classCounts);
  const hasData = classTotal > 0;

  const ninetyPlus = atOrAbove(classCounts, 'b90');
  const ninetyFivePlus = atOrAbove(classCounts, 'b95');
  const eightyPlus = atOrAbove(classCounts, 'b80');
  const classShare = ninetyShare(classCounts);

  // Common max value for column heights across cards
  const classMax = Math.max(1, ...activeItems.flatMap((cls) => Object.values(cls.counts)));

  const csv = hasData
    ? { filename: `class-9-${data.milestone.toLowerCase().replace(/\\s+/g, '-')}-${data.academicYear}.csv`, ...bandCsv(activeItems, classCounts) }
    : undefined;

  const examSwitcher = (
    <div className="inline-flex rounded-full bg-white/80 p-0.5 border border-hairline dark:bg-white/5 dark:border-white/10 text-xs font-medium">
      <button
        type="button"
        onClick={() => setSelectedExam('e2')}
        className={`px-3 py-1 rounded-full transition-colors ${
          selectedExam === 'e2'
            ? 'bg-ink text-white dark:bg-slate-100 dark:text-ink font-semibold shadow-xs'
            : 'text-ink-mute hover:text-ink dark:text-slate-400'
        }`}
      >
        Mid Term (E2)
      </button>
      <button
        type="button"
        onClick={() => setSelectedExam('e1')}
        className={`px-3 py-1 rounded-full transition-colors ${
          selectedExam === 'e1'
            ? 'bg-ink text-white dark:bg-slate-100 dark:text-ink font-semibold shadow-xs'
            : 'text-ink-mute hover:text-ink dark:text-slate-400'
        }`}
      >
        Pre-Mid Term (E1)
      </button>
    </div>
  );

  return (
    <DashboardFrame
      schoolName={data.schoolName}
      updatedLabel={formatDate(data.updatedOn)}
      isSample={data.isSample}
      fontClassName="font-sans"
      csv={csv}
      examSwitcher={examSwitcher}
    >
      <BandThemeStyle />
      <h1 className="sr-only">
        Milestone results, Class IX, {data.schoolName}, {data.milestone} {data.academicYear}
      </h1>

      <main id="main" tabIndex={-1} className="mx-auto max-w-[1320px] space-y-14 px-4 pb-14 outline-none sm:px-6 lg:px-10">
        {/* Headline Section */}
        <section
          aria-label="Headline figures"
          className="print-avoid-break grid gap-10 pt-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:pt-14"
        >
          <Reveal>
            <p className={`text-sm font-medium ${textSecondary}`}>
              {data.milestone} · AY {data.academicYear}
            </p>
            <p className={`mt-5 text-[76px] font-light leading-[0.95] tracking-[-0.045em] tabular-nums sm:text-[104px] ${textPrimary}`}>
              <CountUp value={round1(classShare)} decimals={1} suffix="%" />
            </p>
            <p className={`mt-4 text-balance text-2xl font-light tracking-[-0.01em] sm:text-[28px] ${textPrimary}`}>
              of students scored 90 or above
            </p>
            <p className={`mt-3 max-w-[48ch] text-pretty text-[15px] leading-relaxed ${textSecondary}`}>
              {formatCount(ninetyPlus)} of {formatCount(classTotal)} students in Class IX across 3 sections (AURA, ZEN, NEO).{' '}
              {leader ? `${leader.label} has the highest 90+ share at ${formatPct(atOrAbove(leader.counts, 'b90'), totalOf(leader.counts))}.` : ''}
            </p>
          </Reveal>

          <dl className="grid grid-cols-2 gap-3 sm:gap-4">
            <HeroStat label="Students assessed" value={classTotal} detail="Across Sections AURA, ZEN, NEO" delay={0.1} />
            <HeroStat label="Scored 95+" value={ninetyFivePlus} detail={`${formatPct(ninetyFivePlus, classTotal)} of the class`} delay={0.18} />
            <HeroStat label="Scored 80+" value={eightyPlus} detail={`${formatPct(eightyPlus, classTotal)} of the class`} delay={0.26} />
            <HeroStat
              label="Below 70"
              value={classCounts.below70}
              detail={`${formatPct(classCounts.below70, classTotal)} of the class`}
              delay={0.34}
            />
          </dl>
        </section>

        {/* Whole Class Section */}
        <section aria-labelledby="class-overall-heading" className="scroll-mt-20">
          <SectionHeading
            id="class-overall-heading"
            title="Whole Class IX"
            description="All Class IX scholars combined across academic disciplines"
          />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <Reveal className={`${cardClass} print-avoid-break flex flex-col p-6 lg:col-span-5`}>
              <div className="mb-6 flex items-baseline justify-between gap-3">
                <h3 className={cardTitleClass}>Students per Score Band</h3>
                <p className={`${cardSubtitleClass} tabular-nums`}>{formatCount(classTotal)} students</p>
              </div>
              <div className="mt-auto">
                <BandColumnChart counts={classCounts} total={classTotal} groupLabel="whole class" height={250} showShare />
              </div>
            </Reveal>

            <Reveal delay={0.1} className={`${cardClass} print-avoid-break p-6 lg:col-span-7`}>
              <div className="mb-4">
                <h3 className={cardTitleClass}>Band Breakdown</h3>
                <p className={cardSubtitleClass}>At or above counts every student in that band or higher</p>
              </div>
              <SchoolBandTable counts={classCounts} />
            </Reveal>
          </div>
        </section>

        {/* View Toggle Bar (Subject-Wise vs Section-Wise) */}
        <div className="flex items-center justify-between border-b border-hairline pb-4 dark:border-white/10">
          <div className="inline-flex rounded-full bg-white/80 p-0.5 border border-hairline dark:bg-white/5 dark:border-white/10 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewTab('subjects')}
              className={`px-3.5 py-1.5 rounded-full transition-colors ${
                viewTab === 'subjects'
                  ? 'bg-ink text-white dark:bg-slate-100 dark:text-ink font-semibold shadow-xs'
                  : 'text-ink-mute hover:text-ink dark:text-slate-400'
              }`}
            >
              Subject-Wise Breakdown
            </button>
            <button
              type="button"
              onClick={() => setViewTab('sections')}
              className={`px-3.5 py-1.5 rounded-full transition-colors ${
                viewTab === 'sections'
                  ? 'bg-ink text-white dark:bg-slate-100 dark:text-ink font-semibold shadow-xs'
                  : 'text-ink-mute hover:text-ink dark:text-slate-400'
              }`}
            >
              Section Cohort Breakdown
            </button>
          </div>

          <span className="text-xs text-ink-mute hidden sm:inline">
            Active Dataset: {selectedExam === 'e2' ? 'Mid Term Examination' : 'Pre-Mid Term Examination'}
          </span>
        </div>

        {/* Comparative Figures Table */}
        <section aria-labelledby="table-heading" className="scroll-mt-20">
          <SectionHeading
            id="table-heading"
            title={viewTab === 'subjects' ? "Subject-Wise Figures" : "Section-Wise Figures"}
            description={`Students in each score band, with the share underneath. Select a column heading to rank ${viewTab === 'subjects' ? 'subjects' : 'sections'}.`}
          />
          <Reveal className={`${cardClass} print-avoid-break p-4 sm:p-6`}>
            <ClassBandTable
              classes={activeItems}
              schoolCounts={classCounts}
              leaderId={leader?.classId}
              title={viewTab === 'subjects' ? 'Subject' : 'Section'}
            />
          </Reveal>
        </section>

        {/* Small Multiples Cards */}
        <section aria-labelledby="cards-heading" className="scroll-mt-20">
          <SectionHeading
            id="cards-heading"
            title={viewTab === 'subjects' ? "Subject by Subject" : "Section by Section"}
            description="Students per score band. Every chart uses the same scale."
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeItems.map((cls, index) => (
              <SubjectCard
                key={cls.classId}
                cls={cls}
                index={index}
                isLeader={cls.classId === leader?.classId}
                classShare={classShare}
                classMax={classMax}
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className={`border-t border-hairline pt-6 text-[13px] dark:border-white/10 ${textMute}`}>
          <span translate="no">{data.schoolName}</span>, {data.milestone}, AY {data.academicYear}. Updated {formatDate(data.updatedOn)}.
          {' Institutional aggregate figures — strictly zero personal student records.'}
        </div>
      </main>
    </DashboardFrame>
  );
}
''')
print("[OK] Written src/app/class-9-performance/page.tsx")
print("\\nSUCCESS! All components and pages created.")
