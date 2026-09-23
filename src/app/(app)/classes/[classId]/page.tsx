'use client';
import React from 'react';
import Link from 'next/link';
import { useApiData } from '@/hooks/useApiData';
import { useClassId } from '@/hooks/useClassId';
import { useQueryParams } from '@/hooks/useQueryParams';
import { ErrorState, LoadingState, SampleDataBadge } from '@/components/ui/PageStatus';
import PageHeader, { headerActionClass } from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { StatusFilterValue, matchesStatusFilter } from '@/utils/statusEngine';
import {
  calculateClassSummary,
  calculatePerformanceDistribution,
  calculateSubjectSummary,
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
import GlobalFilterBar from '@/components/dashboard/GlobalFilterBar';
import { GraduationCap, Users, FileText, Compass } from 'lucide-react';

export default function ClassDashboardPage() {
  const classId = useClassId();
  const [query, setQuery] = useQueryParams({ section: 'ALL', status: 'ALL' });
  const statusFilter = query.status as StatusFilterValue;

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

  if (error) return <ErrorState onRetry={reload} />;
  if (isLoading || !data) return <LoadingState message={`Loading Class ${classId} dashboard...`} />;

  const [classInfo, students, milestones, fmsSteps, healthMetrics] = data;
  if (!classInfo) {
    return (
      <ErrorState
        title={`Class ${classId} not found`}
        message="There is no grade with this code. Choose a class from the sidebar."
      />
    );
  }

  const sectionCounts = classInfo.sections.map((sec) => ({
    id: sec,
    count: students.filter((s) => (s.section || s.group) === sec).length,
  }));

  const filteredStudents = students.filter((s) => {
    const sec = s.section || s.group;
    if (query.section !== 'ALL' && sec !== query.section) return false;
    return matchesStatusFilter(s, statusFilter);
  });

  const summary = calculateClassSummary(filteredStudents);
  const buckets = calculatePerformanceDistribution(filteredStudents);
  const subjectMetrics = calculateSubjectSummary(filteredStudents);
  const hasProgramme = classInfo.hasMilestoneProgramme;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        title={`${classInfo.label} Dashboard`}
        description={
          <>
            Coordinator: <strong className="text-slate-700">{classInfo.coordinator}</strong> • {students.length} students
            across {classInfo.sections.join(', ')}
          </>
        }
        badges={classInfo.dataSource === 'sample' ? <SampleDataBadge /> : undefined}
        actions={
          <>
            <Link href={`/classes/${classId}/students`} className={headerActionClass.secondary}>
              <Users className="w-4 h-4" aria-hidden="true" /> Directory
            </Link>
            <Link href={`/classes/${classId}/reports`} className={headerActionClass.primary}>
              <FileText className="w-4 h-4" aria-hidden="true" /> Report Card
            </Link>
          </>
        }
      />

      <GlobalFilterBar
        classId={classId}
        totalCount={students.length}
        sectionCounts={sectionCounts}
        selectedSection={query.section}
        onSectionChange={(section) => setQuery({ section })}
        selectedStatus={statusFilter}
        onStatusChange={(status) => setQuery({ status })}
      />

      <KpiCards
        totalStudents={summary.totalStudents}
        onTrackCount={summary.onTrackCount}
        onTrackPct={summary.onTrackPct}
        atRiskCount={summary.atRiskCount}
        atRiskPct={summary.atRiskPct}
        criticalCount={summary.criticalCount}
        criticalPct={summary.criticalPct}
        targetAchievedCount={summary.targetAchievedCount}
        targetAchievedPct={summary.targetAchievedPct}
        classId={classId}
        activeStatus={statusFilter}
        onSelectStatus={(status) => setQuery({ status })}
      />

      {hasProgramme ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MilestoneJourney milestones={milestones} />
          </div>
          <div>{healthMetrics && <OverallMilestoneHealth metrics={healthMetrics} classId={classId} />}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StudentsRequiringAttentionTable students={filteredStudents} classId={classId} />
          </div>
          <div>{healthMetrics && <OverallMilestoneHealth metrics={healthMetrics} classId={classId} />}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PerformanceDistributionChart buckets={buckets} classId={classId} />
        <TargetVsActualChart students={filteredStudents} />
        <SubjectsPerformanceCard subjects={subjectMetrics} classId={classId} />
      </div>

      {hasProgramme ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StudentsRequiringAttentionTable students={filteredStudents} classId={classId} />
            </div>
            <UpcomingMilestoneCard
              startDate="2026-11-05"
              title="Mid Term Examination"
              dateRange="5 Nov 2026 – 15 Nov 2026"
              targetAvg={summary.targetAverage}
              currentAvg={summary.classAverage}
              studentsOnTrack={summary.onTrackCount + summary.targetAchievedCount}
              needAttention={summary.atRiskCount + summary.criticalCount}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FmsWorkflowProgressCard steps={fmsSteps} />
            </div>
            <QuickActionsCard classId={classId} />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EmptyState
              compact
              icon={Compass}
              title="Milestone journey and exam workflow"
              message={`These are tracked for Class IX only so far. Class ${classId} will show them once its exam gates are configured.`}
            />
          </div>
          <QuickActionsCard classId={classId} />
        </div>
      )}
    </div>
  );
}
