'use client';
import React from 'react';
import Link from 'next/link';
import { useApiData } from '@/hooks/useApiData';
import { useClassId } from '@/hooks/useClassId';
import { ErrorState, LoadingState } from '@/components/ui/PageStatus';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import FmsWorkflowProgressCard from '@/components/dashboard/FmsWorkflowProgressCard';
import { GitMerge } from 'lucide-react';

export default function ClassWorkflowPage() {
  const classId = useClassId();
  const { data, isLoading, error, reload } = useApiData(
    () => Promise.all([schoolMilestoneApi.getClassSummary(classId), schoolMilestoneApi.getFmsWorkflow()]),
    [classId]
  );

  if (error) return <ErrorState onRetry={reload} />;
  if (isLoading || !data) return <LoadingState message="Loading exam workflow..." />;

  const [classInfo, steps] = data;
  if (!classInfo) return <ErrorState title={`Class ${classId} not found`} message="Choose a class from the sidebar." />;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GitMerge}
        title={`Class ${classId} Exam Workflow (FMS)`}
        description="Standard operating procedure for paper setting, vetting, conduct and marks consolidation"
      />

      {classInfo.hasMilestoneProgramme ? (
        <FmsWorkflowProgressCard steps={steps} />
      ) : (
        <EmptyState
          icon={GitMerge}
          title={`No exam workflow is tracked for Class ${classId} yet`}
          message="The FMS exam workflow is currently run for Class IX only."
          action={
            <Link href="/classes/IX/workflow" className="text-sm font-semibold text-blue-600 hover:underline">
              View the Class IX workflow
            </Link>
          }
        />
      )}
    </div>
  );
}
