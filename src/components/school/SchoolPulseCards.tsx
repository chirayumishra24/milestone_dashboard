'use client';
import React from 'react';
import { SchoolOverviewMetrics } from '@/types/academic';
import {
  GraduationCap,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  Award,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface SchoolPulseCardsProps {
  overview: SchoolOverviewMetrics;
}

export default function SchoolPulseCards({ overview }: SchoolPulseCardsProps) {
  const cards = [
    {
      title: 'Total School Enrollment',
      value: overview.totalSchoolStudents,
      subtext: 'Grades VI – XII • 21 Sections',
      pct: 100,
      icon: Building2,
      trend: 'CBSE Affiliated',
      trendPositive: true,
      cardBg: 'from-blue-500/10 via-slate-50 to-white',
      borderColor: 'border-blue-100',
      iconBg: 'bg-blue-600 text-white',
      accentColor: 'bg-blue-600',
    },
    {
      title: 'School-Wide Average',
      value: `${overview.overallSchoolAverage}%`,
      subtext: `Target: ${overview.schoolTargetAverage}% (-0.7% Gap)`,
      pct: Math.round((overview.overallSchoolAverage / overview.schoolTargetAverage) * 100),
      icon: Award,
      trend: '+2.4% vs Last Year',
      trendPositive: true,
      cardBg: 'from-indigo-500/10 via-slate-50 to-white',
      borderColor: 'border-indigo-100',
      iconBg: 'bg-indigo-600 text-white',
      accentColor: 'bg-indigo-600',
    },
    {
      title: 'On-Track Scholars',
      value: overview.studentsOnTrackCount,
      subtext: `${overview.studentsOnTrackPct}% Meeting Grade Goals`,
      pct: overview.studentsOnTrackPct,
      icon: CheckCircle2,
      trend: 'Above 70% Cutoff',
      trendPositive: true,
      cardBg: 'from-emerald-500/10 via-slate-50 to-white',
      borderColor: 'border-emerald-100',
      iconBg: 'bg-emerald-600 text-white',
      accentColor: 'bg-emerald-500',
    },
    {
      title: 'Critical Triage (All Grades)',
      value: overview.totalCriticalCount,
      subtext: `${overview.totalCriticalPct}% Requiring Remedial`,
      pct: overview.totalCriticalPct,
      icon: AlertTriangle,
      trend: 'Active Interventions',
      trendPositive: false,
      cardBg: 'from-rose-500/10 via-slate-50 to-white',
      borderColor: 'border-rose-100',
      iconBg: 'bg-rose-600 text-white',
      accentColor: 'bg-rose-500',
    },
    {
      title: 'School Milestone Health',
      value: `${overview.schoolHealthIndex}/100`,
      subtext: 'Composite Academic Index',
      pct: overview.schoolHealthIndex,
      icon: ShieldCheck,
      trend: 'Optimal Standard',
      trendPositive: true,
      cardBg: 'from-purple-500/10 via-slate-50 to-white',
      borderColor: 'border-purple-100',
      iconBg: 'bg-purple-600 text-white',
      accentColor: 'bg-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.cardBg} p-4 border ${c.borderColor} shadow-xs hover:shadow-md transition-all duration-300 group`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {c.title}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {c.value}
                  </span>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-xl ${c.iconBg} flex items-center justify-center shadow-md shadow-slate-200`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${c.accentColor} transition-all duration-700 ease-out`}
                style={{ width: `${Math.min(c.pct, 100)}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 truncate">{c.subtext}</span>
              <span
                className={`font-semibold ${
                  c.trendPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {c.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
