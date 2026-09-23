'use client';
import React, { useState } from 'react';
import { useApiData } from '@/hooks/useApiData';
import { ErrorState, LoadingState, SampleDataBadge } from '@/components/ui/PageStatus';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { matchesStatusFilter } from '@/utils/statusEngine';
import {
  StudentRecord,
  Milestone,
  FMSWorkflowStep,
  OverallHealthMetrics,
  ClassSummary,
} from '@/types/academic';
import {
  calculateClassSummary,
  calculatePerformanceDistribution,
  calculateSubjectSummary,
  SubjectMetric,
  PerformanceBucket,
} from '@/utils/academicCalculations';
import KpiCards from '@/components/dashboard/KpiCards';
import MilestoneJourney from '@/components/dashboard/MilestoneJourney';
import OverallMilestoneHealth from '@/components/dashboard/OverallMilestoneHealth';
import PerformanceDistributionChart from '@/components/dashboard/PerformanceDistributionChart';
import TargetVsActualChart from '@/components/dashboard/TargetVsActualChart';
import SubjectsPerformanceCard from '@/components/dashboard/SubjectsPerformanceCard';
import StudentsRequiringAttentionTable from '@/components/dashboard/StudentsRequiringAttentionTable';
import UpcomingMilestoneCard from '@/components/dashboard/UpcomingMilestoneCard';
import FmsWorkflowProgressCard from '@/components/dashboard/FmsWorkflowProgressCard';
import QuickActionsCard from '@/components/dashboard/QuickActionsCard';
import GlobalFilterBar, { SectionFilter, StatusFilter, ViewTab } from '@/components/dashboard/GlobalFilterBar';
import InterventionKanban from '@/components/dashboard/InterventionKanban';
import {
  Loader2,
  GraduationCap,
  Users,
  Calendar,
  ChevronRight,
  ArrowLeft,
  FileText,
} from 'lucide-react';

export default function DynamicClassDashboard() {
  const params = useParams();
  const router = useRouter();
  const classId = ((params?.classId as string) || 'IX').toUpperCase();

  // Filter State
  const [selectedSection, setSelectedSection] = useState<SectionFilter>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');
  const [activeTab, setActiveTab] = useState<ViewTab>('OVERVIEW');

  const { data, isLoading, error, reload } = useApiData(
    () =>
      Promise.all([
        schoolMilestoneApi.getClassSummary(classId),
        schoolMilestoneApi.getStudentsByClass(classId),
        schoolMilestoneApi.getMilestones(),
        schoolMilestoneApi.getFmsWorkflow(),
        schoolMilestoneApi.getMilestoneHealth(classId),
      ]),
    [classId]
  );
  const [classInfo, students, milestones, fmsSteps, healthMetrics] = data ?? [null, [], [], [], null];

  if (error) return <ErrorState onRetry={reload} />;
  if (isLoading) return <LoadingState message={`Loading ${classId} Academic Ledger...`} />;
  if (!classInfo) {
    return (
      <ErrorState
        title={`Class ${classId} not found`}
        message="There is no grade with this code. Choose a class from the sidebar."
      />
    );
  }

  // Count sections
  const sectionCounts = (classInfo?.sections || []).map((sec) => ({
    id: sec,
    count: students.filter((s) => (s.section || s.group) === sec).length,
  }));

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const sec = s.section || s.group;
    if (selectedSection !== 'ALL' && sec !== selectedSection) return false;

    if (!matchesStatusFilter(s, selectedStatus)) return false;

    return true;
  });

  const summary = calculateClassSummary(filteredStudents);
  const buckets: PerformanceBucket[] = calculatePerformanceDistribution(filteredStudents);
  const subjectMetrics: SubjectMetric[] = calculateSubjectSummary(filteredStudents);

  return (
    <div className="space-y-6">
      {/* Grade Header Strip */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {classInfo?.label || `Class ${classId}`} Academic Milestone Matrix
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                AY 2026–27
              </span>
              {classInfo.dataSource === 'sample' && <SampleDataBadge />}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Coordinator: <strong>{classInfo?.coordinator || 'Faculty Head'}</strong> • {students.length} Scholars Enrolled across {classInfo?.sections.join(', ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href={`/classes/${classId}/students`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Class Directory</span>
          </Link>
          <Link
            href={`/classes/${classId}/reports`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Class Report Card</span>
          </Link>
        </div>
      </div>

      {/* Global Filter Bar */}
      <GlobalFilterBar
        selectedSection={selectedSection}
        onSectionChange={setSelectedSection}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        classId={classId}
        totalCount={students.length}
        sectionCounts={sectionCounts}
      />

      {/* Top KPI Cards Row (Clickable triage) */}
      <KpiCards
        totalStudents={summary.totalStudents || filteredStudents.length}
        onTrackCount={summary.onTrackCount}
        onTrackPct={summary.onTrackPct || 0}
        atRiskCount={summary.atRiskCount}
        atRiskPct={summary.atRiskPct || 0}
        criticalCount={summary.criticalCount}
        criticalPct={summary.criticalPct || 0}
        targetAchievedCount={summary.targetAchievedCount || 0}
        targetAchievedPct={summary.targetAchievedPct || 0}
        classId={classId}
        activeStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
      />

      {/* Tab 1: Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Milestone Stepper (Aligned 3x2 grid) & Overall Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MilestoneJourney milestones={milestones} />
            </div>
            <div className="lg:col-span-1">
              {healthMetrics && <OverallMilestoneHealth metrics={healthMetrics} />}
            </div>
          </div>

          {/* Performance Distribution, Target vs Actual, Subjects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PerformanceDistributionChart buckets={buckets} />
            <TargetVsActualChart students={filteredStudents} />
            <SubjectsPerformanceCard subjects={subjectMetrics} />
          </div>

          {/* Attention Table & Upcoming Milestone */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StudentsRequiringAttentionTable students={filteredStudents} />
            </div>
            <div className="lg:col-span-1">
              <UpcomingMilestoneCard
                startDate="2026-11-05"
                title="Mid Term Examination"
                dateRange="5 Nov 2026 – 15 Nov 2026"
                targetAvg={summary.targetAverage}
                currentAvg={summary.classAverage}
                studentsOnTrack={summary.onTrackCount}
                needAttention={summary.atRiskCount}
              />
            </div>
          </div>

          {/* FMS Workflow & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FmsWorkflowProgressCard steps={fmsSteps} />
            </div>
            <div className="lg:col-span-1">
              <QuickActionsCard classId={classId} onOpenInterventions={() => setActiveTab('KANBAN')} />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Kanban Action Board */}
      {activeTab === 'KANBAN' && (
        <div className="animate-in fade-in duration-300">
          <InterventionKanban classId={classId} />
        </div>
      )}
    </div>
  );
}
