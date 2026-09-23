'use client';
import React from 'react';
import { useApiData } from '@/hooks/useApiData';
import { ErrorState, LoadingState } from '@/components/ui/PageStatus';
import Link from 'next/link';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { SchoolOverviewMetrics } from '@/types/academic';
import PageHeader, { headerActionClass } from '@/components/ui/PageHeader';
import SchoolPulseCards from '@/components/school/SchoolPulseCards';
import ClassComparisonHeatmap from '@/components/school/ClassComparisonHeatmap';
import SchoolFmsTimeline from '@/components/school/SchoolFmsTimeline';
import { Building2, FileText } from 'lucide-react';

export default function SchoolOverviewPage() {
  const { data: overview, isLoading, error, reload } = useApiData(() => schoolMilestoneApi.getSchoolOverview(), []);

  if (error) return <ErrorState onRetry={reload} />;
  if (isLoading || !overview) return <LoadingState message="Consolidating School-Wide Master Ledger..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Building2}
        title={overview.schoolName}
        description="Academic performance, targets and exam governance across Grades VI–XII"
        badges={
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Executive Cockpit
          </span>
        }
        actions={
          <Link href="/reports/consolidated" className={headerActionClass.primary}>
            <FileText className="w-4 h-4" aria-hidden="true" /> Consolidated Report Card
          </Link>
        }
      />

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
