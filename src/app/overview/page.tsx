'use client';
import React, { useEffect, useState } from 'react';
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
  const [overview, setOverview] = useState<SchoolOverviewMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await schoolMilestoneApi.getSchoolOverview();
        setOverview(data);
      } catch (err) {
        console.error('Failed loading school overview:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading || !overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Consolidating School-Wide Master Ledger...</p>
      </div>
    );
  }

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
