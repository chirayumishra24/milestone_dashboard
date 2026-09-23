'use client';
import React from 'react';
import Link from 'next/link';
import { useApiData } from '@/hooks/useApiData';
import { useClassId } from '@/hooks/useClassId';
import { ErrorState, LoadingState, SampleDataBadge } from '@/components/ui/PageStatus';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { calculateClassSummary } from '@/utils/academicCalculations';
import MilestoneJourney from '@/components/dashboard/MilestoneJourney';
import UpcomingMilestoneCard from '@/components/dashboard/UpcomingMilestoneCard';
import { Compass, Award } from 'lucide-react';

const CBSE_WEIGHTAGE = [
  { label: 'Periodic Tests (PT-1 & PT-2)', weight: '10%' },
  { label: 'Mid-Term Examination', weight: '30%' },
  { label: 'Annual Term-End Examination', weight: '50%' },
  { label: 'Portfolio & Subject Enrichment', weight: '10%' },
];

export default function ClassMilestonesPage() {
  const classId = useClassId();
  const { data, isLoading, error, reload } = useApiData(
    () =>
      Promise.all([
        schoolMilestoneApi.getClassSummary(classId),
        schoolMilestoneApi.getMilestones(),
        schoolMilestoneApi.getStudentsByClass(classId),
      ]),
    [classId]
  );

  if (error) return <ErrorState onRetry={reload} />;
  if (isLoading || !data) return <LoadingState message="Loading milestone journey..." />;

  const [classInfo, milestones, students] = data;
  if (!classInfo) return <ErrorState title={`Class ${classId} not found`} message="Choose a class from the sidebar." />;

  const header = (
    <PageHeader
      icon={Compass}
      title={`Class ${classId} Milestone Journey`}
      description="Progressive exam gates from the Class VIII baseline to the Class IX annual target"
      badges={classInfo.dataSource === 'sample' ? <SampleDataBadge /> : undefined}
    />
  );

  if (!classInfo.hasMilestoneProgramme) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          icon={Compass}
          title={`Class ${classId} is not on the milestone programme yet`}
          message="The milestone journey is currently tracked for Class IX only. Other grades will appear here once their exam gates are configured."
          action={
            <Link href="/classes/IX/milestones" className="text-sm font-semibold text-blue-600 hover:underline">
              View the Class IX journey
            </Link>
          }
        />
      </div>
    );
  }

  const summary = calculateClassSummary(students);

  return (
    <div className="space-y-6">
      {header}

      <MilestoneJourney milestones={milestones} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingMilestoneCard
          startDate="2026-11-05"
          title="Mid Term Examination"
          dateRange="5 Nov 2026 – 15 Nov 2026"
          targetAvg={summary.targetAverage}
          currentAvg={summary.classAverage}
          studentsOnTrack={summary.onTrackCount + summary.targetAchievedCount}
          needAttention={summary.atRiskCount + summary.criticalCount}
        />

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              <h2 className="text-sm font-bold text-slate-800">CBSE Milestone Criteria & Weightage</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Formal assessment weightage under the National Education Policy (NEP 2020) and CBSE evaluation framework:
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              {CBSE_WEIGHTAGE.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span>{item.label}</span>
                  <strong className="text-slate-900">{item.weight} Weightage</strong>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Reconciled with School Examination Committee (SEC)
          </div>
        </div>
      </div>
    </div>
  );
}
