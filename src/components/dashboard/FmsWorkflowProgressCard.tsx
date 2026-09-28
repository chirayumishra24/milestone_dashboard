'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FMSWorkflowStep } from '@/types/academic';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { useToast } from '@/components/ui/Toast';
import { GitMerge, CheckCircle2, UserCheck, Pencil, AlertTriangle } from 'lucide-react';

const STEP_STATUSES: FMSWorkflowStep['status'][] = ['Upcoming', 'In Progress', 'Completed', 'Delayed'];

interface FmsWorkflowProgressCardProps {
  steps: FMSWorkflowStep[];
  /** Enables inline editing of status and remarks, and the owner filter */
  editable?: boolean;
  /** Link to the full workflow page, shown when not editable */
  manageHref?: string;
}

const statusBadge = (status: FMSWorkflowStep['status']) => {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'In Progress':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'Delayed':
      return 'bg-rose-50 text-rose-800 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export default function FmsWorkflowProgressCard({ steps: initialSteps, editable = false, manageHref }: FmsWorkflowProgressCardProps) {
  const { showToast } = useToast();
  const [steps, setSteps] = useState(initialSteps);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ status: FMSWorkflowStep['status']; remarks: string }>({ status: 'Upcoming', remarks: '' });
  const [ownerFilter, setOwnerFilter] = useState('ALL');
  const [isSaving, setIsSaving] = useState(false);

  const completedCount = steps.filter((s) => s.status === 'Completed').length;
  const delayedCount = steps.filter((s) => s.status === 'Delayed').length;
  const completionPct = Math.round((completedCount / (steps.length || 1)) * 100);
  const owners = Array.from(new Set(steps.map((s) => s.owner))).sort();
  const visibleSteps = ownerFilter === 'ALL' ? steps : steps.filter((s) => s.owner === ownerFilter);

  const startEdit = (step: FMSWorkflowStep) => {
    setEditingId(step.id);
    setDraft({ status: step.status, remarks: step.remarks });
  };

  const saveEdit = async (step: FMSWorkflowStep) => {
    setIsSaving(true);
    try {
      const updated = await schoolMilestoneApi.updateFmsStep(step.id, draft.status, draft.remarks.trim());
      setSteps(updated);
      setEditingId(null);
      showToast(`Step ${step.stepNumber} updated: ${draft.status}`);
    } catch (err) {
      console.error('Failed updating workflow step:', err);
      showToast('Could not update the step. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
              <GitMerge className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">FMS Exam Workflow</h2>
              <p className="text-xs text-slate-500">Class IX Mid-Term operational steps</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {delayedCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                {delayedCount} delayed
              </span>
            )}
            <span className="text-xs font-bold text-slate-700 font-mono">
              {completedCount} / {steps.length} steps
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {completionPct}%
            </span>
          </div>
        </div>

        {editable && (
          <label className="flex items-center gap-2 text-xs text-slate-600 mb-3">
            <span>Owner</span>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700"
            >
              <option value="ALL">Everyone</option>
              {owners.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        )}

        <ol className="divide-y divide-slate-100">
          {visibleSteps.map((step) => {
            const isCompleted = step.status === 'Completed';
            const isInProgress = step.status === 'In Progress';
            const isDelayed = step.status === 'Delayed';
            const isEditing = editingId === step.id;

            return (
              <li
                key={step.id}
                className={`py-3 px-2 rounded-xl transition-colors ${isDelayed ? 'bg-rose-50/60' : 'hover:bg-slate-50/80'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isInProgress
                          ? 'bg-blue-600 text-white ring-2 ring-blue-200'
                          : isDelayed
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                      aria-hidden="true"
                    >
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : isDelayed ? <AlertTriangle className="w-3.5 h-3.5" /> : step.stepNumber}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">
                        <span className="sr-only">Step {step.stepNumber}: </span>
                        {step.stepName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                        <span>Target: {step.date}</span>
                        <span aria-hidden="true">•</span>
                        <span className="text-slate-600 font-medium flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-slate-500" aria-hidden="true" />
                          {step.owner}
                        </span>
                      </p>
                      {step.remarks && !isEditing && (
                        <p className={`text-xs text-slate-600 mt-1 ${editable ? '' : 'line-clamp-1'}`}>{step.remarks}</p>
                      )}
                      {editable && step.updatedAt && !isEditing && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Updated {new Date(step.updatedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center ml-9 sm:ml-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${statusBadge(step.status)}`}>
                      {step.status}
                    </span>
                    {editable && !isEditing && (
                      <button
                        type="button"
                        onClick={() => startEdit(step)}
                        aria-label={`Edit step ${step.stepNumber}: ${step.stepName}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      >
                        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-3 ml-9 grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-3">
                    <label className="text-xs font-semibold text-slate-700">
                      Status
                      <select
                        value={draft.status}
                        onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as FMSWorkflowStep['status'] }))}
                        className="mt-1 w-full px-2.5 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                        autoFocus
                      >
                        {STEP_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                      Remarks
                      <textarea
                        rows={2}
                        value={draft.remarks}
                        onChange={(e) => setDraft((d) => ({ ...d, remarks: e.target.value }))}
                        className="mt-1 w-full px-2.5 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                      />
                    </label>
                    <div className="sm:col-span-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(step)}
                        disabled={isSaving}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60"
                      >
                        {isSaving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {!editable && manageHref && (
        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-right">
          <Link href={manageHref} className="text-blue-700 font-semibold hover:underline">
            Update workflow steps →
          </Link>
        </div>
      )}
    </div>
  );
}
