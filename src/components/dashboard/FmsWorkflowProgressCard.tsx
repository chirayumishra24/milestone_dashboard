'use client';
import React from 'react';
import { FMSWorkflowStep } from '@/types/academic';
import { GitMerge, CheckCircle2, Clock, AlertTriangle, UserCheck } from 'lucide-react';

interface FmsWorkflowProgressCardProps {
  steps: FMSWorkflowStep[];
}

export default function FmsWorkflowProgressCard({
  steps,
}: FmsWorkflowProgressCardProps) {
  const completedCount = steps.filter((s) => s.status === 'Completed').length;
  const completionPct = Math.round((completedCount / (steps.length || 1)) * 100);

  const getStatusBadge = (status: FMSWorkflowStep['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Delayed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <GitMerge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">FMS Exam Lifecycle Governance</h3>
              <p className="text-xs text-slate-500">Class IX Mid-Term Operational Milestones</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 font-mono">
              {completedCount} / {steps.length} Steps
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {completionPct}%
            </span>
          </div>
        </div>

        {/* Steps List */}
        <div className="divide-y divide-slate-100">
          {steps.map((step) => {
            const isCompleted = step.status === 'Completed';
            const isInProgress = step.status === 'In Progress';

            return (
              <div
                key={step.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isInProgress
                        ? 'bg-blue-600 text-white ring-2 ring-blue-200 animate-pulse'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.stepNumber}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      {step.stepName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>Target: {step.date}</span>
                      <span>•</span>
                      <span className="text-slate-600 font-medium flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-slate-500" />
                        Owner: {step.owner}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center ml-9 sm:ml-0">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                      step.status
                    )}`}
                  >
                    {step.status}
                  </span>
                  {step.remarks && (
                    <span className="text-xs text-slate-500 italic max-w-[140px] truncate hidden md:inline">
                      {step.remarks}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>ISO 9001 Academic Standard</span>
        <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
          View Audit History →
        </span>
      </div>
    </div>
  );
}
