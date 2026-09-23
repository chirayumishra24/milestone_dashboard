'use client';
import React, { useEffect, useState } from 'react';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { FMSWorkflowStep } from '@/types/academic';
import FmsWorkflowProgressCard from '@/components/dashboard/FmsWorkflowProgressCard';
import { GitMerge, ShieldCheck, CheckCircle2, Calendar, FileText } from 'lucide-react';

export default function WorkflowPage() {
  const [steps, setSteps] = useState<FMSWorkflowStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await schoolMilestoneApi.getFmsWorkflow();
        setSteps(data);
      } catch (err) {
        console.error('Failed loading workflow:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <GitMerge className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              FMS Exam Lifecycle Governance Workflow
            </h1>
            <p className="text-xs text-slate-500">
              Standard operating procedure tracking paper setting, vetting, conduct, and marks consolidation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>FMS Standard Audited</span>
        </div>
      </div>

      <FmsWorkflowProgressCard steps={steps} />
    </div>
  );
}
