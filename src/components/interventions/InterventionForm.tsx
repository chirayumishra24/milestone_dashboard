'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { InterventionRecord, StudentRecord } from '@/types/academic';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { useApiData } from '@/hooks/useApiData';
import { useModalDialog } from '@/hooks/useModalDialog';
import { useToast } from '@/components/ui/Toast';
import { extractNumericValue, getStudentTarget } from '@/utils/statusEngine';
import { daysUntil, parseDate, startOfToday, toIsoDate } from '@/utils/dates';

export const INTERVENTION_SUBJECTS = [
  { label: 'English', key: 'english' },
  { label: '2nd Language', key: 'secondLanguage' },
  { label: 'Mathematics', key: 'maths' },
  { label: 'Science', key: 'science' },
  { label: 'Social Science', key: 'socialScience' },
  { label: 'Computer / IT', key: 'it' },
  { label: 'All Core Subjects', key: null },
] as const;

export const INTERVENTION_STATUSES: InterventionRecord['status'][] = ['Pending', 'In Progress', 'Completed'];

interface InterventionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (record: InterventionRecord) => void;
  onDeleted?: (id: string) => void;
  classId: string;
  /** Record to edit; omit to create a new one */
  existing?: InterventionRecord | null;
  /** Pre-selected student (and subject) when opened from a student's profile */
  prefill?: { studentId: string; subject?: string };
}

interface FormState {
  studentId: string;
  subject: string;
  currentPerformance: string;
  target: string;
  assignedTeacher: string;
  reviewDate: string;
  reason: string;
  strategy: string;
  status: InterventionRecord['status'];
  remarks: string;
}

const emptyState = (): FormState => {
  const due = startOfToday();
  due.setDate(due.getDate() + 14);
  return {
    studentId: '',
    subject: '',
    currentPerformance: '',
    target: '',
    assignedTeacher: '',
    reviewDate: toIsoDate(due),
    reason: '',
    strategy: '',
    status: 'Pending',
    remarks: '',
  };
};

const FIELD_LABELS: Partial<Record<keyof FormState, string>> = {
  subject: 'subject',
  currentPerformance: 'current score',
  target: 'target',
  assignedTeacher: 'teacher',
  reviewDate: 'review date',
  reason: 'reason',
  strategy: 'strategy',
  status: 'status',
  remarks: 'remarks',
};

function subjectScore(student: StudentRecord | undefined, subjectLabel: string): number | null {
  if (!student) return null;
  const def = INTERVENTION_SUBJECTS.find((s) => s.label === subjectLabel);
  if (!def) return null;
  if (!def.key) return extractNumericValue(student.currentPerformance?.overall);
  return extractNumericValue(student.currentPerformance?.subjects?.[def.key]);
}

export default function InterventionForm({
  isOpen,
  onClose,
  onSaved,
  onDeleted,
  classId,
  existing,
  prefill,
}: InterventionFormProps) {
  const panelRef = useModalDialog<HTMLDivElement>(isOpen, onClose);
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(emptyState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data } = useApiData(
    () => Promise.all([schoolMilestoneApi.getStudentsByClass(classId), schoolMilestoneApi.getInterventions()]),
    [classId]
  );
  const [students, allInterventions] = data ?? [[], []];
  const teacherSuggestions = useMemo(
    () => Array.from(new Set(allInterventions.map((i) => i.assignedTeacher))).sort(),
    [allInterventions]
  );
  const sortedStudents = useMemo(() => [...students].sort((a, b) => a.name.localeCompare(b.name)), [students]);

  // Reset the form each time it opens
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    if (existing) {
      const review = parseDate(existing.reviewDate);
      setForm({
        studentId: existing.studentId,
        subject: existing.subject,
        currentPerformance: String(existing.currentPerformance),
        target: String(existing.target),
        assignedTeacher: existing.assignedTeacher,
        reviewDate: review ? toIsoDate(review) : '',
        reason: existing.reason,
        strategy: existing.strategy,
        status: existing.status,
        remarks: existing.remarks,
      });
    } else {
      setForm({ ...emptyState(), studentId: prefill?.studentId ?? '', subject: prefill?.subject ?? '' });
    }
    // Keyed on values, not object identity, so a parent re-render doesn't wipe the user's input
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, existing?.id, prefill?.studentId, prefill?.subject]);

  const selectedStudent = students.find((s) => s.studentId === form.studentId);

  // Fill score and target from the student's record when student or subject changes (new records only)
  useEffect(() => {
    if (existing || !selectedStudent) return;
    const score = subjectScore(selectedStudent, form.subject);
    setForm((prev) => ({
      ...prev,
      currentPerformance: score !== null ? String(score) : prev.currentPerformance,
      target: String(getStudentTarget(selectedStudent)),
    }));
  }, [existing, selectedStudent, form.subject]);

  if (!isOpen) return null;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.studentId) next.studentId = 'Choose a student.';
    if (!form.subject) next.subject = 'Choose a subject.';
    if (!form.assignedTeacher.trim()) next.assignedTeacher = 'Enter the teacher responsible.';
    if (!form.reviewDate) next.reviewDate = 'Choose a review date.';
    if (!form.reason.trim()) next.reason = 'Describe the learning gap.';
    for (const key of ['currentPerformance', 'target'] as const) {
      const n = Number(form[key]);
      if (form[key] === '' || !Number.isFinite(n) || n < 0 || n > 100) next[key] = 'Enter a number from 0 to 100.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSaving) return;
    setIsSaving(true);

    const currentPerformance = Number(form.currentPerformance);
    const target = Number(form.target);
    const fields = {
      classId,
      studentId: form.studentId,
      studentName: selectedStudent?.name ?? existing?.studentName ?? '',
      section: selectedStudent?.section || selectedStudent?.group || existing?.section || '',
      subject: form.subject,
      currentPerformance,
      target,
      gap: Math.round((currentPerformance - target) * 10) / 10,
      reason: form.reason.trim(),
      assignedTeacher: form.assignedTeacher.trim(),
      strategy: form.strategy.trim(),
      reviewDate: form.reviewDate,
      status: form.status,
      remarks: form.remarks.trim(),
    };

    try {
      let saved: InterventionRecord;
      if (existing) {
        const original = emptyState();
        const review = parseDate(existing.reviewDate);
        Object.assign(original, {
          subject: existing.subject,
          currentPerformance: String(existing.currentPerformance),
          target: String(existing.target),
          assignedTeacher: existing.assignedTeacher,
          reviewDate: review ? toIsoDate(review) : '',
          reason: existing.reason,
          strategy: existing.strategy,
          status: existing.status,
          remarks: existing.remarks,
        });
        const changed = (Object.keys(FIELD_LABELS) as (keyof FormState)[])
          .filter((key) => String(original[key]).trim() !== String(form[key]).trim())
          .map((key) => FIELD_LABELS[key]);
        saved = await schoolMilestoneApi.saveIntervention(
          { ...existing, ...fields },
          changed.length ? `Edited ${changed.join(', ')}` : undefined
        );
        showToast(`Updated intervention for ${saved.studentName}`);
      } else {
        saved = await schoolMilestoneApi.createIntervention(fields);
        showToast(`Intervention created for ${saved.studentName}`);
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      console.error('Failed saving intervention:', err);
      showToast('Could not save the intervention. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    if (!window.confirm(`Delete the ${existing.subject} intervention for ${existing.studentName}? This cannot be undone.`)) return;
    await schoolMilestoneApi.deleteIntervention(existing.id);
    showToast(`Deleted intervention for ${existing.studentName}`);
    onDeleted?.(existing.id);
    onClose();
  };

  const subjectOptions: string[] = INTERVENTION_SUBJECTS.map((s) => s.label);
  if (form.subject && !subjectOptions.includes(form.subject)) subjectOptions.push(form.subject);

  const reviewDays = form.reviewDate ? daysUntil(parseDate(form.reviewDate) ?? startOfToday()) : null;

  const inputClass = (field: keyof FormState) =>
    `w-full px-3 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
      errors[field] ? 'border-rose-400' : 'border-slate-300 focus:border-blue-500'
    }`;

  const fieldError = (field: keyof FormState) =>
    errors[field] ? (
      <p id={`${field}-error`} className="mt-1 text-xs font-medium text-rose-700">
        {errors[field]}
      </p>
    ) : null;

  const describedBy = (field: keyof FormState) => (errors[field] ? `${field}-error` : undefined);

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="intervention-form-title"
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl focus:outline-none"
      >
        <div className="sticky top-0 z-10 bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 id="intervention-form-title" className="text-base font-bold text-slate-900">
            {existing ? 'Edit intervention' : 'New intervention'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="if-student" className="block text-xs font-semibold text-slate-700 mb-1">
                Student <span className="text-rose-600">*</span>
              </label>
              <select
                id="if-student"
                value={form.studentId}
                onChange={(e) => update('studentId', e.target.value)}
                disabled={!!existing}
                aria-invalid={!!errors.studentId}
                aria-describedby={describedBy('studentId')}
                className={`${inputClass('studentId')} disabled:bg-slate-100`}
              >
                <option value="">Select a student…</option>
                {existing && !selectedStudent && <option value={existing.studentId}>{existing.studentName}</option>}
                {sortedStudents.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.name} ({classId} {s.section || s.group})
                  </option>
                ))}
              </select>
              {fieldError('studentId')}
            </div>

            <div>
              <label htmlFor="if-subject" className="block text-xs font-semibold text-slate-700 mb-1">
                Subject <span className="text-rose-600">*</span>
              </label>
              <select
                id="if-subject"
                value={form.subject}
                onChange={(e) => update('subject', e.target.value)}
                aria-invalid={!!errors.subject}
                aria-describedby={describedBy('subject')}
                className={inputClass('subject')}
              >
                <option value="">Select a subject…</option>
                {subjectOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {fieldError('subject')}
            </div>

            <div>
              <label htmlFor="if-teacher" className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned teacher <span className="text-rose-600">*</span>
              </label>
              <input
                id="if-teacher"
                list="if-teacher-options"
                value={form.assignedTeacher}
                onChange={(e) => update('assignedTeacher', e.target.value)}
                aria-invalid={!!errors.assignedTeacher}
                aria-describedby={describedBy('assignedTeacher')}
                className={inputClass('assignedTeacher')}
              />
              <datalist id="if-teacher-options">
                {teacherSuggestions.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              {fieldError('assignedTeacher')}
            </div>

            <div>
              <label htmlFor="if-current" className="block text-xs font-semibold text-slate-700 mb-1">
                Current score (%) <span className="text-rose-600">*</span>
              </label>
              <input
                id="if-current"
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={form.currentPerformance}
                onChange={(e) => update('currentPerformance', e.target.value)}
                aria-invalid={!!errors.currentPerformance}
                aria-describedby={describedBy('currentPerformance')}
                className={`${inputClass('currentPerformance')} font-mono`}
              />
              {fieldError('currentPerformance')}
            </div>

            <div>
              <label htmlFor="if-target" className="block text-xs font-semibold text-slate-700 mb-1">
                Target (%) <span className="text-rose-600">*</span>
              </label>
              <input
                id="if-target"
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={form.target}
                onChange={(e) => update('target', e.target.value)}
                aria-invalid={!!errors.target}
                aria-describedby={describedBy('target')}
                className={`${inputClass('target')} font-mono`}
              />
              {fieldError('target')}
            </div>

            <div>
              <label htmlFor="if-review" className="block text-xs font-semibold text-slate-700 mb-1">
                Review by <span className="text-rose-600">*</span>
              </label>
              <input
                id="if-review"
                type="date"
                value={form.reviewDate}
                onChange={(e) => update('reviewDate', e.target.value)}
                aria-invalid={!!errors.reviewDate}
                aria-describedby={describedBy('reviewDate') ?? 'if-review-hint'}
                className={inputClass('reviewDate')}
              />
              {fieldError('reviewDate') ??
                (reviewDays !== null && (
                  <p id="if-review-hint" className={`mt-1 text-xs ${reviewDays < 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                    {reviewDays < 0 ? `${Math.abs(reviewDays)} days ago` : reviewDays === 0 ? 'Today' : `In ${reviewDays} days`}
                  </p>
                ))}
            </div>

            <div>
              <label htmlFor="if-status" className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                id="if-status"
                value={form.status}
                onChange={(e) => update('status', e.target.value as InterventionRecord['status'])}
                className={inputClass('status')}
              >
                {INTERVENTION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="if-reason" className="block text-xs font-semibold text-slate-700 mb-1">
                Learning gap / reason <span className="text-rose-600">*</span>
              </label>
              <textarea
                id="if-reason"
                rows={2}
                value={form.reason}
                onChange={(e) => update('reason', e.target.value)}
                aria-invalid={!!errors.reason}
                aria-describedby={describedBy('reason')}
                className={inputClass('reason')}
              />
              {fieldError('reason')}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="if-strategy" className="block text-xs font-semibold text-slate-700 mb-1">
                Remedial strategy
              </label>
              <textarea
                id="if-strategy"
                rows={2}
                value={form.strategy}
                onChange={(e) => update('strategy', e.target.value)}
                className={inputClass('strategy')}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="if-remarks" className="block text-xs font-semibold text-slate-700 mb-1">
                Remarks
              </label>
              <textarea
                id="if-remarks"
                rows={2}
                value={form.remarks}
                onChange={(e) => update('remarks', e.target.value)}
                className={inputClass('remarks')}
              />
            </div>
          </div>

          {existing?.history && existing.history.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <h3 className="text-xs font-bold text-slate-700 mb-2">History</h3>
              <ol className="space-y-1 text-xs text-slate-600">
                {[...existing.history].reverse().map((event, idx) => (
                  <li key={`${event.at}-${idx}`} className="flex justify-between gap-3">
                    <span>{event.description}</span>
                    <time dateTime={event.at} className="text-slate-500 whitespace-nowrap">
                      {new Date(event.at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-100">
            {existing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" /> Delete
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-60"
              >
                {isSaving ? 'Saving…' : existing ? 'Save changes' : 'Create intervention'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
