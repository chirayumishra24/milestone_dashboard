'use client';
import React from 'react';
import { useApiData } from '@/hooks/useApiData';
import { ErrorState, LoadingState } from '@/components/ui/PageStatus';
import Link from 'next/link';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { SchoolOverviewMetrics } from '@/types/academic';
import SchoolPulseCards from '@/components/school/SchoolPulseCards';
import ClassComparisonHeatmap from '@/components/school/ClassComparisonHeatmap';
import SchoolFmsTimeline from '@/components/school/SchoolFmsTimeline';
import {
  Building2,
  FileText,
  Download,
  Calendar,
  Sparkles,
  Loader2,
  TrendingUp,
} from 'lucide-react';

export default function SchoolOverviewPage() {
  const { data: overview, isLoading, error, reload } = useApiData(() => schoolMilestoneApi.getSchoolOverview(), []);

  if (error) return <ErrorState onRetry={reload} />;
  if (isLoading || !overview) return <LoadingState message="Consolidating School-Wide Master Ledger..." />;

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {overview.schoolName}
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Executive Cockpit
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Integrated Academic Performance, Benchmark Milestones & Governance across 7 Grades (VI–XII)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <Link
            href="/reports/consolidated"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>School Consolidated Report Card</span>
          </Link>
        </div>
      </div>

      {/* Whole-School Pulse KPI Cards */}
      <SchoolPulseCards overview={overview} />

      {/* Main Grid: Inter-Class Comparison & Exam Governance Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ClassComparisonHeatmap classes={overview.classes} />
        </div>
        <div className="lg:col-span-1">
          <SchoolFmsTimeline />
        </div>
      </div>
    </div>
  );
}
