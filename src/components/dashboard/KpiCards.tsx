'use client';
import React from 'react';
import { Users, CheckCircle2, AlertTriangle, AlertOctagon, Award, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiCardsProps {
  totalStudents: number;
  onTrackCount: number;
  onTrackPct: number;
  atRiskCount: number;
  atRiskPct: number;
  criticalCount: number;
  criticalPct: number;
  targetAchievedCount: number;
  targetAchievedPct: number;
  currentDate?: string;
  activeStatus?: 'ALL' | 'ACHIEVED' | 'ON_TRACK' | 'WATCH' | 'CRITICAL';
  onSelectStatus?: (status: 'ALL' | 'ACHIEVED' | 'ON_TRACK' | 'WATCH' | 'CRITICAL') => void;
}

export default function KpiCards({
  totalStudents,
  onTrackCount,
  onTrackPct,
  atRiskCount,
  atRiskPct,
  criticalCount,
  criticalPct,
  targetAchievedCount,
  targetAchievedPct,
  currentDate = '12 Oct 2026',
  activeStatus = 'ALL',
  onSelectStatus,
}: KpiCardsProps) {
  const cards = [
    {
      title: 'Total Class IX Cohort',
      value: totalStudents,
      subtext: 'Active Enrolled',
      pct: 100,
      icon: Users,
      trend: '+100% CBSE Validated',
      trendPositive: true,
      cardBg: 'from-blue-500/10 via-slate-50 to-white',
      borderColor: 'border-blue-100',
      iconBg: 'bg-blue-600 text-white',
      accentColor: 'bg-blue-600',
      badge: 'Cohort IX',
      statusKey: 'ALL' as const,
    },
    {
      title: 'On-Track Students',
      value: onTrackCount,
      subtext: `${onTrackPct}% of total cohort`,
      pct: onTrackPct,
      icon: CheckCircle2,
      trend: '+4.2% vs PT-1',
      trendPositive: true,
      cardBg: 'from-emerald-500/10 via-slate-50 to-white',
      borderColor: 'border-emerald-100',
      iconBg: 'bg-emerald-600 text-white',
      accentColor: 'bg-emerald-500',
      badge: '70%–84%',
      statusKey: 'ON_TRACK' as const,
    },
    {
      title: 'At Risk (Watchlist)',
      value: atRiskCount,
      subtext: `${atRiskPct}% within ±5% of target`,
      pct: atRiskPct,
      icon: AlertTriangle,
      trend: '-1.8% improving',
      trendPositive: true,
      cardBg: 'from-amber-500/10 via-slate-50 to-white',
      borderColor: 'border-amber-100',
      iconBg: 'bg-amber-500 text-white',
      accentColor: 'bg-amber-500',
      badge: '60%–69%',
      statusKey: 'WATCH' as const,
    },
    {
      title: 'Critical Attention',
      value: criticalCount,
      subtext: `${criticalPct}% below 60% mark`,
      pct: criticalPct,
      icon: AlertOctagon,
      trend: 'Requires Action Plan',
      trendPositive: false,
      cardBg: 'from-rose-500/10 via-slate-50 to-white',
      borderColor: 'border-rose-100',
      iconBg: 'bg-rose-600 text-white',
      accentColor: 'bg-rose-500',
      badge: '<60%',
      statusKey: 'CRITICAL' as const,
    },
    {
      title: 'Target Achieved',
      value: targetAchievedCount,
      subtext: `${targetAchievedPct}% exceeded school target`,
      pct: targetAchievedPct,
      icon: Award,
      trend: 'Top Quartile',
      trendPositive: true,
      cardBg: 'from-indigo-500/10 via-slate-50 to-white',
      borderColor: 'border-indigo-100',
      iconBg: 'bg-indigo-600 text-white',
      accentColor: 'bg-indigo-500',
      badge: '85%+',
      statusKey: 'ACHIEVED' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const isSelected = activeStatus === c.statusKey;

        return (
          <div
            key={c.title}
            onClick={() => onSelectStatus && onSelectStatus(c.statusKey)}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.cardBg} p-4 border transition-all duration-300 group ${
              onSelectStatus ? 'cursor-pointer active:scale-[0.98]' : ''
            } ${
              isSelected
                ? 'ring-2 ring-blue-600 border-blue-600 shadow-md scale-[1.02]'
                : `${c.borderColor} shadow-xs hover:shadow-md hover:border-slate-300`
            }`}
          >
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {c.title}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {c.value}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    ({c.pct}%)
                  </span>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-xl ${c.iconBg} flex items-center justify-center shadow-md shadow-slate-200`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Micro progress bar */}
            <div className="mt-3 w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${c.accentColor} transition-all duration-700 ease-out`}
                style={{ width: `${Math.min(c.pct, 100)}%` }}
              />
            </div>

            {/* Subtext and trend */}
            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 truncate">{c.subtext}</span>
              <span
                className={`font-semibold flex items-center gap-0.5 ${
                  c.trendPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {c.trendPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {c.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
