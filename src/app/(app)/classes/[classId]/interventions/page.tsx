'use client';
import React from 'react';
import { useClassId } from '@/hooks/useClassId';
import PageHeader from '@/components/ui/PageHeader';
import InterventionKanban from '@/components/dashboard/InterventionKanban';
import { LifeBuoy } from 'lucide-react';

export default function ClassInterventionsPage() {
  const classId = useClassId();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LifeBuoy}
        title={`Class ${classId} Interventions`}
        description="Remedial assignments that close student learning gaps before the next assessment"
      />
      <InterventionKanban classId={classId} />
    </div>
  );
}
