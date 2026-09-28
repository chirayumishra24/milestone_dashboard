"""
Python generator script to build CCWS Class 9 Performance Dashboard components.
Target directory: e:/skilizee/CCWS-Website
"""

import os

DEST_DIR = "e:/skilizee/CCWS-Website"

files = {}

# ==========================================
# 1. ScoreTierPill.tsx
# ==========================================
files["src/components/performance/ScoreTierPill.tsx"] = '''import React from 'react';

export type TierKey =
  | 'b95'
  | 'b90'
  | 'b80'
  | 'b70'
  | 'b60'
  | 'below60'
  | 'b90_plus'
  | 'b80_plus'
  | 'b70_plus'
  | 'b60_plus';

interface ScoreTierPillProps {
  tier: TierKey | string;
  count?: number;
  pct?: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TIER_CONFIG: Record<
  string,
  { label: string; fullLabel: string; bg: string; border: string; text: string }
> = {
  b95: {
    label: '95%+',
    fullLabel: '95% and Above (Stellar)',
    bg: 'bg-maroon text-white',
    border: 'border-maroon',
    text: 'text-maroon',
  },
  b90: {
    label: '90–94%',
    fullLabel: '90% to 94.9%',
    bg: 'bg-navy text-white',
    border: 'border-navy',
    text: 'text-navy',
  },
  b90_plus: {
    label: '90%+',
    fullLabel: '90% and Above (Distinction)',
    bg: 'bg-navy text-white',
    border: 'border-navy',
    text: 'text-navy',
  },
  b80: {
    label: '80–89%',
    fullLabel: '80% to 89.9%',
    bg: 'bg-[#B5542A] text-white',
    border: 'border-[#B5542A]',
    text: 'text-[#B5542A]',
  },
  b80_plus: {
    label: '80%+',
    fullLabel: '80% and Above (First Division)',
    bg: 'bg-[#B5542A] text-white',
    border: 'border-[#B5542A]',
    text: 'text-[#B5542A]',
  },
  b70: {
    label: '70–79%',
    fullLabel: '70% to 79.9%',
    bg: 'bg-[#DDCFB0] text-ink',
    border: 'border-[#C8B896]',
    text: 'text-ink',
  },
  b70_plus: {
    label: '70%+',
    fullLabel: '70% and Above (Proficient)',
    bg: 'bg-[#DDCFB0] text-ink',
    border: 'border-[#C8B896]',
    text: 'text-ink',
  },
  b60: {
    label: '60–69%',
    fullLabel: '60% to 69.9%',
    bg: 'bg-[#F1E8D8] text-ink',
    border: 'border-[#DDCFB0]',
    text: 'text-ink/80',
  },
  b60_plus: {
    label: '60%+',
    fullLabel: '60% and Above (Passing)',
    bg: 'bg-[#F1E8D8] text-ink',
    border: 'border-[#DDCFB0]',
    text: 'text-ink/80',
  },
  below60: {
    label: '<60%',
    fullLabel: 'Below 60% (Priority Focus)',
    bg: 'bg-stone-200 text-stone-700',
    border: 'border-stone-300',
    text: 'text-stone-700',
  },
};

export default function ScoreTierPill({
  tier,
  count,
  pct,
  showDetails = false,
  size = 'md',
  className = '',
}: ScoreTierPillProps) {
  const conf = TIER_CONFIG[tier] || {
    label: tier,
    fullLabel: tier,
    bg: 'bg-gray-100 text-gray-800',
    border: 'border-gray-200',
    text: 'text-gray-700',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-none border ${conf.border} ${conf.bg} ${sizeStyles} ${className}`}
      title={conf.fullLabel}
    >
      <span>{conf.label}</span>
      {showDetails && count !== undefined && (
        <span className="opacity-90 tabular-nums">
          ({count}{pct !== undefined ? ` · ${pct}%` : ''})
        </span>
      )}
    </span>
  );
}
'''

# ==========================================
# 2. PerformanceHeader.tsx
# ==========================================
files["src/components/performance/PerformanceHeader.tsx"] = '''"use client";

import React from 'react';
import { Award, ShieldCheck, Printer, Calendar, School, BookOpen } from 'lucide-react';
import PipingRule from '@/components/ui/PipingRule';

interface PerformanceHeaderProps {
  totalScholars: number;
  lastUpdated: string;
  activeExam: 'exam1' | 'exam2' | 'compare' | 'target';
  setActiveExam: (exam: 'exam1' | 'exam2' | 'compare' | 'target') => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export default function PerformanceHeader({
  totalScholars,
  lastUpdated,
  activeExam,
  setActiveExam,
  activeSection,
  setActiveSection,
}: PerformanceHeaderProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <header className="relative bg-white border-b border-beige-line bg-texture-linen pt-8 pb-7">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Institutional Badge Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono uppercase tracking-wider text-ink/70 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-maroon text-white px-2.5 py-0.5 font-semibold">
              <School className="w-3.5 h-3.5" />
              CCWS Academic Governance
            </span>
            <span className="hidden sm:inline text-ink/40">|</span>
            <span className="hidden sm:inline">CBSE Affiliation No. 1730867</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Aggregate Data · Privacy Preserved
            </span>
            <button
              onClick={handlePrint}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-beige border border-beige-line text-ink text-xs font-sans font-medium transition-colors"
              title="Print Official Performance Sheet"
            >
              <Printer className="w-3.5 h-3.5 text-maroon" />
              Print Report
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-maroon tracking-tight">
            Class IX Academic Performance & Score Comparison
          </h1>
          <p className="mt-2 text-ink/80 text-base sm:text-lg max-w-3xl font-sans">
            Institutional score tier distribution across all {totalScholars} scholars in Class IX (Sections AURA, ZEN, and NEO). 
            Comprehensive whole-class and subject-wise score benchmarks without individual student records.
          </p>
          <div className="mt-4">
            <PipingRule />
          </div>
        </div>

        {/* Global Controls & Filter Bar */}
        <div className="mt-6 pt-5 border-t border-beige-line/80 flex flex-wrap items-center justify-between gap-4">
          {/* Exam Milestone Toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-ink/60 mr-1 hidden md:inline">
              Exam Milestone:
            </span>
            <div className="inline-flex bg-beige/50 p-1 border border-beige-line">
              <button
                type="button"
                onClick={() => setActiveExam('exam1')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-sans font-medium transition-all ${
                  activeExam === 'exam1'
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-ink/80 hover:text-ink hover:bg-white/80'
                }`}
              >
                Pre-Mid Term (E1)
              </button>
              <button
                type="button"
                onClick={() => setActiveExam('exam2')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-sans font-medium transition-all ${
                  activeExam === 'exam2'
                    ? 'bg-maroon text-white shadow-sm'
                    : 'text-ink/80 hover:text-ink hover:bg-white/80'
                }`}
              >
                Mid Term (E2)
              </button>
              <button
                type="button"
                onClick={() => setActiveExam('compare')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-sans font-medium transition-all ${
                  activeExam === 'compare'
                    ? 'bg-[#B5542A] text-white shadow-sm'
                    : 'text-ink/80 hover:text-ink hover:bg-white/80'
                }`}
              >
                E1 vs E2 Comparison
              </button>
              <button
                type="button"
                onClick={() => setActiveExam('target')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-sans font-medium transition-all ${
                  activeExam === 'target'
                    ? 'bg-ink text-white shadow-sm'
                    : 'text-ink/80 hover:text-ink hover:bg-white/80'
                }`}
              >
                Academic Targets
              </button>
            </div>
          </div>

          {/* Section Cohort Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-ink/60 mr-1 hidden lg:inline">
              Section Cohort:
            </span>
            <div className="inline-flex bg-white p-0.5 border border-beige-line text-xs font-mono">
              {[
                { id: 'ALL', label: 'All Sections (Cohort IX)' },
                { id: 'AURA', label: 'IX-AURA' },
                { id: 'ZEN', label: 'IX-ZEN' },
                { id: 'NEO', label: 'IX-NEO' },
              ].map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`px-2.5 py-1 transition-colors ${
                    activeSection === sec.id
                      ? 'bg-beige font-semibold text-maroon border border-beige-line'
                      : 'text-ink/70 hover:text-ink hover:bg-beige/40'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
'''

# ==========================================
# 3. ScoreTierSummaryCards.tsx
# ==========================================
files["src/components/performance/ScoreTierSummaryCards.tsx"] = '''"use client";

import React from 'react';
import { Trophy, Award, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { ScoreTierDistribution } from '@/data/class9PerformanceData';

interface ScoreTierSummaryCardsProps {
  stats: ScoreTierDistribution;
  prevStats?: ScoreTierDistribution;
  examLabel: string;
  cohortLabel: string;
}

export default function ScoreTierSummaryCards({
  stats,
  prevStats,
  examLabel,
  cohortLabel,
}: ScoreTierSummaryCardsProps) {
  const formatDelta = (current: number, prev?: number, isPct: boolean = true) => {
    if (prev === undefined) return null;
    const diff = Math.round((current - prev) * 10) / 10;
    if (diff === 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-xs text-ink/50 font-mono">
          <Minus className="w-3 h-3" /> No change
        </span>
      );
    }
    const positive = diff > 0;
    const Icon = positive ? ArrowUpRight : ArrowDownRight;
    const color = positive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50';
    return (
      <span className={`inline-flex items-center gap-0.5 text-xs font-mono font-medium px-1.5 py-0.5 border ${
        positive ? 'border-emerald-200' : 'border-rose-200'
      } ${color}`}>
        <Icon className="w-3 h-3" />
        {positive ? '+' : ''}{diff}{isPct ? ' pts' : ' scholars'}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: 95% and Above (Stellar) */}
      <div className="bg-white border-2 border-maroon/20 p-5 rounded-none relative overflow-hidden shadow-sm hover:border-maroon transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-maroon font-bold">
            95% & Above (95+)
          </span>
          <span className="p-1.5 bg-maroon/10 text-maroon">
            <Trophy className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-3xl font-serif font-bold text-maroon tabular-nums">
            {stats.b95}
            <span className="text-xs font-mono font-normal text-ink/60 ml-1.5">
              scholars ({stats.b95Pct}%)
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-ink/60 border-t border-beige-line pt-2">
          <span>Stellar High Distinction</span>
          {formatDelta(stats.b95, prevStats?.b95, false)}
        </div>
      </div>

      {/* Card 2: 90% and Above Cumulative */}
      <div className="bg-white border-2 border-navy/20 p-5 rounded-none relative overflow-hidden shadow-sm hover:border-navy transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-navy font-bold">
            90% & Above (90+)
          </span>
          <span className="p-1.5 bg-navy/10 text-navy">
            <Award className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-3xl font-serif font-bold text-navy tabular-nums">
            {stats.b90_plus}
            <span className="text-xs font-mono font-normal text-ink/60 ml-1.5">
              scholars ({stats.b90_plusPct}%)
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-ink/60 border-t border-beige-line pt-2">
          <span>Honor Roll (90–94%: {stats.b90_94})</span>
          {formatDelta(stats.b90_plusPct, prevStats?.b90_plusPct, true)}
        </div>
      </div>

      {/* Card 3: 80% and Above Cumulative */}
      <div className="bg-white border-2 border-[#B5542A]/20 p-5 rounded-none relative overflow-hidden shadow-sm hover:border-[#B5542A] transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#B5542A] font-bold">
            80% & Above (80+)
          </span>
          <span className="p-1.5 bg-[#B5542A]/10 text-[#B5542A]">
            <TrendingUp className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-3xl font-serif font-bold text-[#B5542A] tabular-nums">
            {stats.b80_plus}
            <span className="text-xs font-mono font-normal text-ink/60 ml-1.5">
              scholars ({stats.b80_plusPct}%)
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-ink/60 border-t border-beige-line pt-2">
          <span>First Division Band</span>
          {formatDelta(stats.b80_plusPct, prevStats?.b80_plusPct, true)}
        </div>
      </div>

      {/* Card 4: Class Average & Tested Scholars */}
      <div className="bg-white border-2 border-beige-line p-5 rounded-none relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-ink/70 font-bold">
            Class Average
          </span>
          <span className="p-1.5 bg-beige text-ink">
            <Users className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-3xl font-serif font-bold text-ink tabular-nums">
            {stats.average}%
            <span className="text-xs font-mono font-normal text-ink/60 ml-1.5">
              (N = {stats.total})
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-ink/60 border-t border-beige-line pt-2">
          <span>Peak: {stats.highest}%</span>
          {formatDelta(stats.average, prevStats?.average, true)}
        </div>
      </div>
    </div>
  );
}
'''

# ==========================================
# 4. ScoreBandBarChart.tsx
# ==========================================
files["src/components/performance/ScoreBandBarChart.tsx"] = '''"use client";

import React, { useState } from 'react';
import { BarChart3, HelpCircle } from 'lucide-react';
import { ScoreTierDistribution } from '@/data/class9PerformanceData';

interface ScoreBandBarChartProps {
  statsExam1: ScoreTierDistribution;
  statsExam2: ScoreTierDistribution;
  statsTarget?: ScoreTierDistribution | null;
  activeExam: 'exam1' | 'exam2' | 'compare' | 'target';
  title?: string;
  subtitle?: string;
}

export default function ScoreBandBarChart({
  statsExam1,
  statsExam2,
  statsTarget,
  activeExam,
  title = "Whole Class Score Band Distribution",
  subtitle = "Comparative distribution across academic performance brackets",
}: ScoreBandBarChartProps) {
  const [viewMode, setViewMode] = useState<'discrete' | 'cumulative'>('discrete');
  const [unitMode, setUnitMode] = useState<'pct' | 'count'>('pct');

  const discreteTiers = [
    { key: 'b95', label: '95% and Above', short: '95%+', color: 'bg-maroon', textCol: 'text-maroon' },
    { key: 'b90_94', label: '90% to 94.9%', short: '90–94%', color: 'bg-navy', textCol: 'text-navy' },
    { key: 'b80_89', label: '80% to 89.9%', short: '80–89%', color: 'bg-[#B5542A]', textCol: 'text-[#B5542A]' },
    { key: 'b70_79', label: '70% to 79.9%', short: '70–79%', color: 'bg-[#C8B896]', textCol: 'text-ink' },
    { key: 'b60_69', label: '60% to 69.9%', short: '60–69%', color: 'bg-[#E5DAC4]', textCol: 'text-ink/80' },
    { key: 'below60', label: 'Below 60%', short: '<60%', color: 'bg-stone-300', textCol: 'text-stone-700' },
  ];

  const cumulativeTiers = [
    { key: 'b95', label: '95% and Above', short: '95%+', color: 'bg-maroon', textCol: 'text-maroon' },
    { key: 'b90_plus', label: '90% and Above', short: '90%+', color: 'bg-navy', textCol: 'text-navy' },
    { key: 'b80_plus', label: '80% and Above', short: '80%+', color: 'bg-[#B5542A]', textCol: 'text-[#B5542A]' },
    { key: 'b70_plus', label: '70% and Above', short: '70%+', color: 'bg-[#C8B896]', textCol: 'text-ink' },
    { key: 'b60_plus', label: '60% and Above', short: '60%+', color: 'bg-[#E5DAC4]', textCol: 'text-ink/80' },
  ];

  const tiers = viewMode === 'discrete' ? discreteTiers : cumulativeTiers;

  const getTierVal = (stats: ScoreTierDistribution, key: string, isCount: boolean) => {
    if (isCount) {
      return (stats as any)[key] ?? 0;
    }
    const pctKey = `${key}Pct`;
    return (stats as any)[pctKey] ?? 0;
  };

  const isComparison = activeExam === 'compare';
  const currentStats = activeExam === 'exam1' ? statsExam1 : activeExam === 'target' && statsTarget ? statsTarget : statsExam2;

  // Max value calculation for proportional bar sizing
  const allValues: number[] = [];
  tiers.forEach((t) => {
    if (isComparison) {
      allValues.push(getTierVal(statsExam1, t.key, unitMode === 'count'));
      allValues.push(getTierVal(statsExam2, t.key, unitMode === 'count'));
      if (statsTarget) allValues.push(getTierVal(statsTarget, t.key, unitMode === 'count'));
    } else {
      allValues.push(getTierVal(currentStats, t.key, unitMode === 'count'));
    }
  });
  const maxVal = Math.max(10, ...allValues);

  return (
    <div className="bg-white border border-beige-line p-6 rounded-none shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-beige-line">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-maroon flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-maroon" />
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-ink/70 font-sans mt-0.5">{subtitle}</p>
        </div>

        {/* View mode & Unit controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="inline-flex bg-beige/60 p-0.5 border border-beige-line">
            <button
              type="button"
              onClick={() => setViewMode('discrete')}
              className={`px-2.5 py-1 transition-colors ${
                viewMode === 'discrete' ? 'bg-white font-semibold text-maroon shadow-xs' : 'text-ink/70'
              }`}
            >
              Brackets (e.g. 90–94%)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cumulative')}
              className={`px-2.5 py-1 transition-colors ${
                viewMode === 'cumulative' ? 'bg-white font-semibold text-maroon shadow-xs' : 'text-ink/70'
              }`}
            >
              Cumulative (e.g. 90%+)
            </button>
          </div>

          <div className="inline-flex bg-beige/60 p-0.5 border border-beige-line">
            <button
              type="button"
              onClick={() => setUnitMode('pct')}
              className={`px-2 py-1 transition-colors ${
                unitMode === 'pct' ? 'bg-white font-semibold text-maroon shadow-xs' : 'text-ink/70'
              }`}
            >
              % Share
            </button>
            <button
              type="button"
              onClick={() => setUnitMode('count')}
              className={`px-2 py-1 transition-colors ${
                unitMode === 'count' ? 'bg-white font-semibold text-maroon shadow-xs' : 'text-ink/70'
              }`}
            >
              Scholar Count (N)
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      {isComparison && (
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-navy border border-navy/40" />
            <span>Pre-Mid Term (E1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-maroon border border-maroon/40" />
            <span>Mid Term (E2)</span>
          </div>
          {statsTarget && (
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-[#B5542A] border border-[#B5542A]" />
              <span>School Benchmark Target</span>
            </div>
          )}
        </div>
      )}

      {/* Chart Rows */}
      <div className="mt-6 space-y-5">
        {tiers.map((tier) => {
          const v1 = getTierVal(statsExam1, tier.key, unitMode === 'count');
          const v2 = getTierVal(statsExam2, tier.key, unitMode === 'count');
          const vt = statsTarget ? getTierVal(statsTarget, tier.key, unitMode === 'count') : null;

          const pctWidth1 = Math.max(1, (v1 / maxVal) * 100);
          const pctWidth2 = Math.max(1, (v2 / maxVal) * 100);
          const pctWidthT = vt !== null ? Math.max(1, (vt / maxVal) * 100) : 0;

          return (
            <div key={tier.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm font-sans font-medium text-ink">
                <span className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 ${tier.color}`} />
                  <span className="font-semibold">{tier.label}</span>
                </span>
                <span className="font-mono text-xs text-ink/70">
                  {isComparison ? (
                    <span>
                      E1: <strong>{v1}{unitMode === 'pct' ? '%' : ''}</strong> | E2: <strong>{v2}{unitMode === 'pct' ? '%' : ''}</strong>
                    </span>
                  ) : (
                    <span>
                      <strong>{unitMode === 'count' ? `${getTierVal(currentStats, tier.key, true)} scholars` : `${getTierVal(currentStats, tier.key, false)}%`}</strong>
                      <span className="text-ink/40 ml-1">
                        ({unitMode === 'count' ? `${getTierVal(currentStats, tier.key, false)}%` : `${getTierVal(currentStats, tier.key, true)} scholars`})
                      </span>
                    </span>
                  )}
                </span>
              </div>

              {/* Progress bars */}
              {isComparison ? (
                <div className="space-y-1">
                  {/* Exam 1 bar */}
                  <div className="h-4 bg-beige/40 overflow-hidden relative border border-beige-line/50">
                    <div
                      className="h-full bg-navy transition-all duration-500 ease-out flex items-center justify-end pr-1 text-[10px] font-mono text-white"
                      style={{ width: `${pctWidth1}%` }}
                    >
                      {v1 > 0 && <span className="opacity-90">{v1}{unitMode === 'pct' ? '%' : ''}</span>}
                    </div>
                  </div>
                  {/* Exam 2 bar */}
                  <div className="h-4 bg-beige/40 overflow-hidden relative border border-beige-line/50">
                    <div
                      className="h-full bg-maroon transition-all duration-500 ease-out flex items-center justify-end pr-1 text-[10px] font-mono text-white"
                      style={{ width: `${pctWidth2}%` }}
                    >
                      {v2 > 0 && <span className="opacity-90">{v2}{unitMode === 'pct' ? '%' : ''}</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-5 bg-beige/40 overflow-hidden relative border border-beige-line">
                  <div
                    className={`h-full ${tier.color} transition-all duration-500 ease-out flex items-center justify-end pr-2 text-xs font-mono text-white`}
                    style={{ width: `${Math.max(2, (getTierVal(currentStats, tier.key, unitMode === 'count') / maxVal) * 100)}%` }}
                  >
                    {getTierVal(currentStats, tier.key, unitMode === 'count') > 0 && (
                      <span className="font-medium drop-shadow-xs">
                        {getTierVal(currentStats, tier.key, unitMode === 'count')}
                        {unitMode === 'pct' ? '%' : ''}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
'''

# ==========================================
# 5. WholeClassComparisonTable.tsx
# ==========================================
files["src/components/performance/WholeClassComparisonTable.tsx"] = '''"use client";

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Table } from 'lucide-react';
import { ScoreTierDistribution } from '@/data/class9PerformanceData';
import ScoreTierPill from './ScoreTierPill';

interface WholeClassComparisonTableProps {
  statsExam1: ScoreTierDistribution;
  statsExam2: ScoreTierDistribution;
  statsTarget?: ScoreTierDistribution | null;
}

export default function WholeClassComparisonTable({
  statsExam1,
  statsExam2,
  statsTarget,
}: WholeClassComparisonTableProps) {
  const tiers = [
    { key: 'b95', label: '95% and Above', pillKey: 'b95', desc: 'Stellar High Distinction' },
    { key: 'b90_94', label: '90% to 94.9%', pillKey: 'b90', desc: 'Distinction First Division' },
    { key: 'b90_plus', label: '90% and Above Cumulative', pillKey: 'b90_plus', desc: 'Total Honor Roll Scholars', isBold: true },
    { key: 'b80_89', label: '80% to 89.9%', pillKey: 'b80', desc: 'First Division' },
    { key: 'b80_plus', label: '80% and Above Cumulative', pillKey: 'b80_plus', desc: 'Total First Division Scholars', isBold: true },
    { key: 'b70_79', label: '70% to 79.9%', pillKey: 'b70', desc: 'Solid Proficient' },
    { key: 'b70_plus', label: '70% and Above Cumulative', pillKey: 'b70_plus', desc: 'Scholars at or above 70%', isBold: true },
    { key: 'b60_69', label: '60% to 69.9%', pillKey: 'b60', desc: 'Developing Standard' },
    { key: 'b60_plus', label: '60% and Above Cumulative', pillKey: 'b60_plus', desc: 'CBSE First / Second Standard Pass', isBold: true },
    { key: 'b50_59', label: '50% to 59.9%', pillKey: 'below60', desc: 'Passing Support Needed' },
    { key: 'below50', label: 'Below 50%', pillKey: 'below60', desc: 'Priority Academic Remediation' },
    { key: 'below60', label: 'Total Below 60%', pillKey: 'below60', desc: 'All Priority Clinic Scholars', isBold: true },
  ];

  const renderDelta = (valE2: number, valE1: number, isPct: boolean = true) => {
    const diff = Math.round((valE2 - valE1) * 10) / 10;
    if (diff === 0) {
      return (
        <span className="inline-flex items-center text-xs font-mono text-ink/40">
          <Minus className="w-3 h-3 mr-0.5" /> 0.0
        </span>
      );
    }
    const positive = diff > 0;
    const Icon = positive ? ArrowUpRight : ArrowDownRight;
    const color = positive ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200';
    return (
      <span className={`inline-flex items-center text-xs font-mono font-medium px-1.5 py-0.5 border ${color}`}>
        <Icon className="w-3 h-3 mr-0.5" />
        {positive ? '+' : ''}{diff}{isPct ? ' pts' : ''}
      </span>
    );
  };

  return (
    <div className="bg-white border border-beige-line rounded-none overflow-hidden shadow-sm">
      <div className="p-5 border-b border-beige-line bg-beige/20 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl font-bold text-maroon flex items-center gap-2">
            <Table className="w-5 h-5 text-maroon" />
            Whole Class Milestone Score Matrix
          </h3>
          <p className="text-xs sm:text-sm text-ink/70 font-sans mt-0.5">
            Full score bracket comparison between Pre-Mid Term (E1), Mid Term (E2), and School Benchmark Target
          </p>
        </div>
        <div className="text-xs font-mono text-ink/60 bg-white px-2.5 py-1 border border-beige-line">
          Total Tested Scholars: <strong>E1: {statsExam1.total}</strong> | <strong>E2: {statsExam2.total}</strong>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-beige/40 text-xs font-mono uppercase tracking-wider text-ink/80 border-b border-beige-line">
              <th className="py-3 px-4">Score Band</th>
              <th className="py-3 px-4 text-center bg-navy/5 text-navy font-semibold">
                Pre-Mid Term (E1)
              </th>
              <th className="py-3 px-4 text-center bg-maroon/5 text-maroon font-semibold">
                Mid Term (E2)
              </th>
              <th className="py-3 px-4 text-center">Progression Delta</th>
              {statsTarget && (
                <th className="py-3 px-4 text-center bg-amber-50/50 text-[#B5542A] font-semibold">
                  School Target (TGT)
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-line/60">
            {tiers.map((row) => {
              const countE1 = (statsExam1 as any)[row.key] ?? 0;
              const pctE1 = (statsExam1 as any)[`${row.key}Pct`] ?? 0;
              const countE2 = (statsExam2 as any)[row.key] ?? 0;
              const pctE2 = (statsExam2 as any)[`${row.key}Pct`] ?? 0;
              const countTgt = statsTarget ? (statsTarget as any)[row.key] ?? 0 : null;
              const pctTgt = statsTarget ? (statsTarget as any)[`${row.key}Pct`] ?? 0 : null;

              return (
                <tr
                  key={row.key}
                  className={`hover:bg-beige/20 transition-colors ${
                    row.isBold ? 'bg-beige/10 font-medium' : ''
                  }`}
                >
                  {/* Bracket Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <ScoreTierPill tier={row.pillKey} size="sm" />
                      <div>
                        <span className={`font-sans ${row.isBold ? 'font-bold text-ink' : 'text-ink/90'}`}>
                          {row.label}
                        </span>
                        <span className="block text-[11px] text-ink/50 font-sans">{row.desc}</span>
                      </div>
                    </div>
                  </td>

                  {/* Exam 1 */}
                  <td className="py-3 px-4 text-center font-mono tabular-nums bg-navy/5">
                    <span className="font-semibold text-navy">{countE1}</span>
                    <span className="text-xs text-navy/70 ml-1.5">({pctE1}%)</span>
                  </td>

                  {/* Exam 2 */}
                  <td className="py-3 px-4 text-center font-mono tabular-nums bg-maroon/5">
                    <span className="font-semibold text-maroon">{countE2}</span>
                    <span className="text-xs text-maroon/70 ml-1.5">({pctE2}%)</span>
                  </td>

                  {/* Delta */}
                  <td className="py-3 px-4 text-center">
                    {renderDelta(pctE2, pctE1, true)}
                  </td>

                  {/* Target */}
                  {statsTarget && (
                    <td className="py-3 px-4 text-center font-mono tabular-nums bg-amber-50/30 text-[#B5542A]">
                      <span className="font-semibold">{countTgt}</span>
                      <span className="text-xs opacity-75 ml-1.5">({pctTgt}%)</span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-beige/60 font-mono font-bold text-xs uppercase text-ink border-t-2 border-beige-line">
              <td className="py-3 px-4">Class Average & Assessed Scholars</td>
              <td className="py-3 px-4 text-center text-navy">
                Avg: {statsExam1.average}% (N = {statsExam1.total})
              </td>
              <td className="py-3 px-4 text-center text-maroon">
                Avg: {statsExam2.average}% (N = {statsExam2.total})
              </td>
              <td className="py-3 px-4 text-center">
                {renderDelta(statsExam2.average, statsExam1.average, true)}
              </td>
              {statsTarget && (
                <td className="py-3 px-4 text-center text-[#B5542A]">
                  Tgt: {statsTarget.average}% (N = {statsTarget.total})
                </td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
'''

# ==========================================
# 6. SubjectWisePerformanceSection.tsx
# ==========================================
files["src/components/performance/SubjectWisePerformanceSection.tsx"] = '''"use client";

import React, { useState } from 'react';
import {
  BookOpen,
  Calculator,
  Atom,
  Globe,
  Laptop,
  Languages,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
} from 'lucide-react';
import { SubjectPerformanceItem, SecondLanguageItem } from '@/data/class9PerformanceData';
import ScoreTierPill from './ScoreTierPill';

interface SubjectWisePerformanceSectionProps {
  subjects: Record<string, SubjectPerformanceItem>;
  electives: Record<string, SecondLanguageItem>;
  activeExam: 'exam1' | 'exam2' | 'compare' | 'target';
}

const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  english: <BookOpen className="w-4 h-4" />,
  maths: <Calculator className="w-4 h-4" />,
  science: <Atom className="w-4 h-4" />,
  socialScience: <Globe className="w-4 h-4" />,
  it: <Laptop className="w-4 h-4" />,
  secondLanguage: <Languages className="w-4 h-4" />,
};

export default function SubjectWisePerformanceSection({
  subjects,
  electives,
  activeExam,
}: SubjectWisePerformanceSectionProps) {
  const subjectList = Object.values(subjects);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [electiveView, setElectiveView] = useState<'consolidated' | 'hindi' | 'sanskrit' | 'french'>('consolidated');

  const selectedSubject = subjects[selectedSubjectId];

  const tiers = [
    { key: 'b95', label: '95%+', desc: '95% and Above' },
    { key: 'b90_94', label: '90–94%', desc: '90% to 94.9%' },
    { key: 'b90_plus', label: '90%+', desc: '90%+ Total Honor Roll', isBold: true },
    { key: 'b80_89', label: '80–89%', desc: '80% to 89.9%' },
    { key: 'b80_plus', label: '80%+', desc: '80%+ First Division', isBold: true },
    { key: 'b70_79', label: '70–79%', desc: '70% to 79.9%' },
    { key: 'b60_69', label: '60–69%', desc: '60% to 69.9%' },
    { key: 'below60', label: '<60%', desc: 'Below 60% Focus Band', isBold: true },
  ];

  return (
    <section className="bg-white border border-beige-line p-6 rounded-none shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-beige-line">
        <div>
          <h2 className="font-serif text-2xl font-bold text-maroon flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-maroon" />
            Subject-Wise Score Tier Breakdown
          </h2>
          <p className="text-xs sm:text-sm text-ink/70 font-sans mt-0.5">
            Discipline-by-discipline score band comparison (English, Mathematics, Science, Social Science, IT, and Second Languages)
          </p>
        </div>

        {/* Subject Pill Filter */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setSelectedSubjectId('all')}
            className={`px-3 py-1.5 border transition-colors ${
              selectedSubjectId === 'all'
                ? 'bg-maroon text-white border-maroon font-semibold'
                : 'bg-white text-ink/80 border-beige-line hover:bg-beige/40'
            }`}
          >
            All Subjects Overview
          </button>
          {subjectList.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 border transition-colors ${
                selectedSubjectId === sub.id
                  ? 'bg-maroon text-white border-maroon font-semibold'
                  : 'bg-white text-ink/80 border-beige-line hover:bg-beige/40'
              }`}
            >
              {SUBJECT_ICONS[sub.id]}
              <span>{sub.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of All Subjects Overview */}
      {selectedSubjectId === 'all' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjectList.map((sub) => {
            const e1 = sub.exam1;
            const e2 = sub.exam2;
            const tgt = sub.target;

            return (
              <div
                key={sub.id}
                className="bg-white border-2 border-beige-line hover:border-maroon transition-all p-5 rounded-none flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-ink/50 block">
                        {sub.code}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-maroon mt-0.5">
                        {sub.label}
                      </h3>
                    </div>
                    <span className="p-2 bg-beige/60 text-maroon">
                      {SUBJECT_ICONS[sub.id]}
                    </span>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs font-mono">
                    <div className="bg-navy/5 p-2 border border-navy/20">
                      <span className="block text-[10px] text-navy/70 uppercase">Pre-Mid (E1) Avg</span>
                      <span className="text-base font-bold text-navy tabular-nums">{e1.average}%</span>
                      <span className="block text-[10px] text-navy/60">90+: {e1.b90_plus} scholars</span>
                    </div>
                    <div className="bg-maroon/5 p-2 border border-maroon/20">
                      <span className="block text-[10px] text-maroon/70 uppercase">Mid Term (E2) Avg</span>
                      <span className="text-base font-bold text-maroon tabular-nums">{e2.average}%</span>
                      <span className="block text-[10px] text-maroon/60">90+: {e2.b90_plus} scholars</span>
                    </div>
                  </div>

                  {/* Tier Distribution Summary */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-ink/70 font-mono">
                      <span>90%+ Achievers:</span>
                      <span className="font-bold text-ink">
                        E1: {e1.b90_plus} ({e1.b90_plusPct}%) · E2: {e2.b90_plus} ({e2.b90_plusPct}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-ink/70 font-mono">
                      <span>80%+ Scholars:</span>
                      <span className="font-bold text-ink">
                        E1: {e1.b80_plus} ({e1.b80_plusPct}%) · E2: {e2.b80_plus} ({e2.b80_plusPct}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-ink/70 font-mono">
                      <span>Below 60% Focus:</span>
                      <span className="font-semibold text-rose-700">
                        E1: {e1.below60} scholars · E2: {e2.below60} scholars
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-beige-line">
                  <button
                    type="button"
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className="w-full text-center text-xs font-mono uppercase tracking-wider text-maroon hover:text-white hover:bg-maroon py-1.5 border border-maroon transition-colors"
                  >
                    View Detailed Tier Matrix →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Drilldown for Selected Subject */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-beige/30 p-4 border border-beige-line">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-maroon text-white">
                {SUBJECT_ICONS[selectedSubject.id]}
              </span>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-ink/60">
                  {selectedSubject.code}
                </span>
                <h3 className="font-serif text-2xl font-bold text-maroon">
                  {selectedSubject.label}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSubjectId('all')}
              className="text-xs font-mono text-ink/70 hover:text-maroon underline"
            >
              ← Back to All Subjects
            </button>
          </div>

          {/* If Second Language selected, allow drilldown to Hindi / Sanskrit / French */}
          {selectedSubject.id === 'secondLanguage' && (
            <div className="bg-white border border-beige-line p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-maroon font-bold">
                  Elective Language Drilldown (Mid Term E2):
                </span>
                <div className="inline-flex bg-beige/50 p-0.5 border border-beige-line text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setElectiveView('consolidated')}
                    className={`px-2.5 py-1 ${electiveView === 'consolidated' ? 'bg-maroon text-white' : 'text-ink/70'}`}
                  >
                    Combined (97 scholars)
                  </button>
                  <button
                    type="button"
                    onClick={() => setElectiveView('hindi')}
                    className={`px-2.5 py-1 ${electiveView === 'hindi' ? 'bg-maroon text-white' : 'text-ink/70'}`}
                  >
                    Hindi (43)
                  </button>
                  <button
                    type="button"
                    onClick={() => setElectiveView('sanskrit')}
                    className={`px-2.5 py-1 ${electiveView === 'sanskrit' ? 'bg-maroon text-white' : 'text-ink/70'}`}
                  >
                    Sanskrit (23)
                  </button>
                  <button
                    type="button"
                    onClick={() => setElectiveView('french')}
                    className={`px-2.5 py-1 ${electiveView === 'french' ? 'bg-maroon text-white' : 'text-ink/70'}`}
                  >
                    French (31)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table for Selected Subject */}
          <div className="border border-beige-line overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-beige/40 text-xs font-mono uppercase tracking-wider text-ink/80 border-b border-beige-line">
                  <th className="py-3 px-4">Score Tier Bracket</th>
                  <th className="py-3 px-4 text-center bg-navy/5 text-navy font-semibold">
                    Pre-Mid Term (E1)
                  </th>
                  <th className="py-3 px-4 text-center bg-maroon/5 text-maroon font-semibold">
                    Mid Term (E2)
                  </th>
                  <th className="py-3 px-4 text-center">Score Band Shift</th>
                  {selectedSubject.target && (
                    <th className="py-3 px-4 text-center bg-amber-50/50 text-[#B5542A] font-semibold">
                      Subject Target
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-line/60">
                {tiers.map((t) => {
                  const countE1 = (selectedSubject.exam1 as any)[t.key] ?? 0;
                  const pctE1 = (selectedSubject.exam1 as any)[`${t.key}Pct`] ?? 0;
                  const countE2 = (selectedSubject.exam2 as any)[t.key] ?? 0;
                  const pctE2 = (selectedSubject.exam2 as any)[`${t.key}Pct`] ?? 0;
                  const countTgt = selectedSubject.target ? (selectedSubject.target as any)[t.key] ?? 0 : null;
                  const pctTgt = selectedSubject.target ? (selectedSubject.target as any)[`${t.key}Pct`] ?? 0 : null;

                  const delta = Math.round((pctE2 - pctE1) * 10) / 10;

                  return (
                    <tr
                      key={t.key}
                      className={`hover:bg-beige/20 transition-colors ${
                        t.isBold ? 'bg-beige/10 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <ScoreTierPill tier={t.key} size="sm" />
                          <div>
                            <span className={t.isBold ? 'font-bold text-ink' : 'text-ink/90'}>
                              {t.label}
                            </span>
                            <span className="block text-[11px] text-ink/50">{t.desc}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums bg-navy/5">
                        <span className="font-semibold text-navy">{countE1}</span>
                        <span className="text-xs text-navy/70 ml-1.5">({pctE1}%)</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums bg-maroon/5">
                        <span className="font-semibold text-maroon">{countE2}</span>
                        <span className="text-xs text-maroon/70 ml-1.5">({pctE2}%)</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-xs">
                        {delta > 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                            +{delta} pts
                          </span>
                        ) : delta < 0 ? (
                          <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 border border-rose-200">
                            {delta} pts
                          </span>
                        ) : (
                          <span className="text-ink/40">0.0</span>
                        )}
                      </td>
                      {selectedSubject.target && (
                        <td className="py-3 px-4 text-center font-mono tabular-nums bg-amber-50/30 text-[#B5542A]">
                          <span className="font-semibold">{countTgt}</span>
                          <span className="text-xs opacity-75 ml-1.5">({pctTgt}%)</span>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-beige/60 font-mono font-bold text-xs uppercase text-ink border-t-2 border-beige-line">
                  <td className="py-3 px-4">Subject Average Score</td>
                  <td className="py-3 px-4 text-center text-navy font-bold">
                    {selectedSubject.exam1.average}%
                  </td>
                  <td className="py-3 px-4 text-center text-maroon font-bold">
                    {selectedSubject.exam2.average}%
                  </td>
                  <td className="py-3 px-4 text-center font-bold">
                    {Math.round((selectedSubject.exam2.average - selectedSubject.exam1.average) * 10) / 10} pts
                  </td>
                  {selectedSubject.target && (
                    <td className="py-3 px-4 text-center text-[#B5542A] font-bold">
                      {selectedSubject.target.average}%
                    </td>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
'''

# ==========================================
# 7. SectionComparisonView.tsx
# ==========================================
files["src/components/performance/SectionComparisonView.tsx"] = '''"use client";

import React from 'react';
import { Users, Layers, Award } from 'lucide-react';
import { SectionPerformanceItem } from '@/data/class9PerformanceData';

interface SectionComparisonViewProps {
  sections: Record<string, SectionPerformanceItem>;
}

export default function SectionComparisonView({ sections }: SectionComparisonViewProps) {
  const sectionList = Object.values(sections);

  return (
    <div className="bg-white border border-beige-line p-6 rounded-none shadow-sm space-y-5">
      <div className="pb-3 border-b border-beige-line">
        <h3 className="font-serif text-xl font-bold text-maroon flex items-center gap-2">
          <Layers className="w-5 h-5 text-maroon" />
          Section Cohort Comparison (IX-AURA vs IX-ZEN vs IX-NEO)
        </h3>
        <p className="text-xs sm:text-sm text-ink/70 font-sans mt-0.5">
          Sectional distribution breakdown and comparative achievement metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sectionList.map((sec) => {
          const e1 = sec.exam1;
          const e2 = sec.exam2;

          return (
            <div
              key={sec.sectionName}
              className="bg-white border border-beige-line p-5 rounded-none space-y-4 hover:border-maroon transition-colors"
            >
              <div className="flex items-center justify-between border-b border-beige-line pb-3">
                <div>
                  <h4 className="font-serif text-lg font-bold text-maroon">
                    {sec.sectionName}
                  </h4>
                  <span className="text-xs font-mono text-ink/60">
                    {sec.totalEnrolled} Registered Scholars
                  </span>
                </div>
                <span className="p-2 bg-beige text-maroon">
                  <Users className="w-4 h-4" />
                </span>
              </div>

              {/* Exam 1 vs Exam 2 Performance */}
              <div className="space-y-3 text-xs font-mono">
                <div className="p-2.5 bg-navy/5 border border-navy/20">
                  <div className="flex justify-between items-center text-navy font-bold">
                    <span>Pre-Mid Term (E1)</span>
                    <span className="text-base">{e1.average}%</span>
                  </div>
                  <div className="mt-1 flex justify-between text-navy/70 text-[11px]">
                    <span>90%+ Scholars: {e1.b90_plus} ({e1.b90_plusPct}%)</span>
                    <span>80%+: {e1.b80_plus}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-maroon/5 border border-maroon/20">
                  <div className="flex justify-between items-center text-maroon font-bold">
                    <span>Mid Term (E2)</span>
                    <span className="text-base">{e2.average}%</span>
                  </div>
                  <div className="mt-1 flex justify-between text-maroon/70 text-[11px]">
                    <span>90%+ Scholars: {e2.b90_plus} ({e2.b90_plusPct}%)</span>
                    <span>80%+: {e2.b80_plus}</span>
                  </div>
                </div>
              </div>

              {/* Tiers Tally */}
              <div className="text-xs space-y-1.5 border-t border-beige-line pt-3 font-mono">
                <div className="flex justify-between text-ink/80">
                  <span>95%+ Stellar:</span>
                  <span>E1: {e1.b95} | E2: {e2.b95}</span>
                </div>
                <div className="flex justify-between text-ink/80">
                  <span>70%+ Proficient:</span>
                  <span>E1: {e1.b70_plus} | E2: {e2.b70_plus}</span>
                </div>
                <div className="flex justify-between text-rose-700">
                  <span>Below 60% Priority:</span>
                  <span>E1: {e1.below60} | E2: {e2.below60}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
'''

# ==========================================
# 8. FmsBenchmarkTable.tsx
# ==========================================
files["src/components/performance/FmsBenchmarkTable.tsx"] = '''"use client";

import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { FmsBenchmarkRow } from '@/data/class9PerformanceData';

interface FmsBenchmarkTableProps {
  benchmarks: FmsBenchmarkRow[];
}

export default function FmsBenchmarkTable({ benchmarks }: FmsBenchmarkTableProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border border-beige-line rounded-none overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 bg-beige/30 hover:bg-beige/50 border-b border-beige-line flex items-center justify-between text-left transition-colors"
      >
        <div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-maroon flex items-center gap-2">
            <Calendar className="w-5 h-5 text-maroon" />
            CCWS Official Milestone Strategic Roadmap (STEP 2 Benchmarks)
          </h3>
          <p className="text-xs sm:text-sm text-ink/70 font-sans mt-0.5">
            Board-approved institutional targets comparing Class VIII Half Yearly to Class IX Milestones
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-maroon font-semibold">
          <span>{isOpen ? 'Collapse Strategic Matrix' : 'Expand Strategic Matrix'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="overflow-x-auto p-4 sm:p-6">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-beige/40 text-xs font-mono uppercase tracking-wider text-ink/80 border-b border-beige-line">
                <th className="py-2.5 px-3">Performance Tier</th>
                <th className="py-2.5 px-3 text-center">Class VIII (HY Actual)</th>
                <th className="py-2.5 px-3 text-center text-navy font-semibold">Class IX (Pre-Mid Target)</th>
                <th className="py-2.5 px-3 text-center text-maroon font-semibold">Class IX (Pre-Mid Actual)</th>
                <th className="py-2.5 px-3 text-center text-[#B5542A] font-semibold">Class IX (Mid-Term Target)</th>
                <th className="py-2.5 px-3 text-center text-ink font-semibold">Final Board Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-line/50 font-mono">
              {benchmarks.map((row, idx) => (
                <tr key={idx} className="hover:bg-beige/20 transition-colors">
                  <td className="py-2 px-3 font-sans font-medium text-ink">{row.bracket}</td>
                  <td className="py-2 px-3 text-center text-ink/70">{row.class8HY}</td>
                  <td className="py-2 px-3 text-center text-navy font-semibold">{row.preMidTarget}</td>
                  <td className="py-2 px-3 text-center text-maroon font-semibold">{row.preMidActual}</td>
                  <td className="py-2 px-3 text-center text-[#B5542A] font-semibold">{row.midTermTarget}</td>
                  <td className="py-2 px-3 text-center text-ink font-bold">{row.finalTarget}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
'''

# ==========================================
# 9. Main Page: src/app/class-9-performance/page.tsx
# ==========================================
files["src/app/class-9-performance/page.tsx"] = '''"use client";

import React, { useState } from 'react';
import {
  CLASS_IX_PERFORMANCE_METRICS,
  ScoreTierDistribution,
} from '@/data/class9PerformanceData';
import PerformanceHeader from '@/components/performance/PerformanceHeader';
import ScoreTierSummaryCards from '@/components/performance/ScoreTierSummaryCards';
import ScoreBandBarChart from '@/components/performance/ScoreBandBarChart';
import WholeClassComparisonTable from '@/components/performance/WholeClassComparisonTable';
import SubjectWisePerformanceSection from '@/components/performance/SubjectWisePerformanceSection';
import SectionComparisonView from '@/components/performance/SectionComparisonView';
import FmsBenchmarkTable from '@/components/performance/FmsBenchmarkTable';

export default function Class9PerformancePage() {
  const [activeExam, setActiveExam] = useState<'exam1' | 'exam2' | 'compare' | 'target'>('compare');
  const [activeSection, setActiveSection] = useState<string>('ALL');

  const { school, overall, sections, subjects, electives, fmsBenchmark } =
    CLASS_IX_PERFORMANCE_METRICS;

  // Resolve active stats based on section filter
  const currentSectionData =
    activeSection !== 'ALL' && sections[activeSection as keyof typeof sections]
      ? sections[activeSection as keyof typeof sections]
      : null;

  const statsExam1: ScoreTierDistribution = currentSectionData
    ? currentSectionData.exam1
    : overall.exam1;

  const statsExam2: ScoreTierDistribution = currentSectionData
    ? currentSectionData.exam2
    : overall.exam2;

  const statsTarget: ScoreTierDistribution | null = currentSectionData
    ? currentSectionData.target
    : overall.target;

  const activeStats: ScoreTierDistribution =
    activeExam === 'exam1'
      ? statsExam1
      : activeExam === 'target' && statsTarget
      ? statsTarget
      : statsExam2;

  const prevStats: ScoreTierDistribution | undefined =
    activeExam === 'exam2' || activeExam === 'compare' ? statsExam1 : undefined;

  const examLabel =
    activeExam === 'exam1'
      ? 'Pre-Mid Term (E1)'
      : activeExam === 'exam2'
      ? 'Mid Term (E2)'
      : activeExam === 'target'
      ? 'Academic Target'
      : 'E1 vs E2 Comparison';

  const cohortLabel =
    activeSection === 'ALL' ? 'Class IX Whole Cohort' : `Section IX-${activeSection}`;

  return (
    <div className="min-h-screen bg-[#FBF8F2] pb-16">
      {/* Header Banner */}
      <PerformanceHeader
        totalScholars={school.totalScholarsEnrolled}
        lastUpdated={school.lastUpdated}
        activeExam={activeExam}
        setActiveExam={setActiveExam}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* 1. Top KPI Summary Cards */}
        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
          <ScoreTierSummaryCards
            stats={activeStats}
            prevStats={prevStats}
            examLabel={examLabel}
            cohortLabel={cohortLabel}
          />
        </section>

        {/* 2. Whole Class Score Distribution Column/Bar Chart */}
        <section aria-labelledby="chart-heading">
          <ScoreBandBarChart
            statsExam1={statsExam1}
            statsExam2={statsExam2}
            statsTarget={statsTarget}
            activeExam={activeExam}
            title={`${cohortLabel} — Score Tier Distribution`}
            subtitle={`Visual distribution across performance tiers (95%+, 90–94%, 80–89%, 70–79%, 60–69%, and below 60%)`}
          />
        </section>

        {/* 3. Whole Class Comparison Table */}
        <section aria-labelledby="table-heading">
          <WholeClassComparisonTable
            statsExam1={statsExam1}
            statsExam2={statsExam2}
            statsTarget={statsTarget}
          />
        </section>

        {/* 4. Subject-Wise Performance Section */}
        <section aria-labelledby="subjects-heading">
          <SubjectWisePerformanceSection
            subjects={subjects}
            electives={electives}
            activeExam={activeExam}
          />
        </section>

        {/* 5. Section Cohort Breakdown (Only if viewing All Sections) */}
        {activeSection === 'ALL' && (
          <section aria-labelledby="sections-heading">
            <SectionComparisonView sections={sections} />
          </section>
        )}

        {/* 6. Official CCWS FMS Strategic Benchmark Roadmap */}
        <section aria-labelledby="benchmark-heading">
          <FmsBenchmarkTable benchmarks={fmsBenchmark} />
        </section>

        {/* Footer Audit Line */}
        <div className="border-t border-beige-line pt-6 text-center text-xs font-mono text-ink/50 space-y-1">
          <p>
            {school.name} ({school.shortName}) · {school.affiliation} · Academic Session {school.session}
          </p>
          <p>
            Official Academic Record for Class IX. Data aggregated for institutional analysis and academic oversight.
          </p>
        </div>
      </main>
    </div>
  );
}
'''

# Write all files
for rel_path, content in files.items():
    full_path = os.path.join(DEST_DIR, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"[OK] Written {full_path}")

print("\\nAll CCWS Performance components generated successfully!")
