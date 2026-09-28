'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { InterventionRecord } from '@/types/academic';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { useToast } from '@/components/ui/Toast';
import InterventionForm from '@/components/interventions/InterventionForm';
import { daysUntil, displayDate, parseDate } from '@/utils/dates';
import { LifeBuoy, UserCheck, Calendar, Plus, Pencil, AlertTriangle, GripVertical } from 'lucide-react';

interface InterventionKanbanProps {
  classId?: string;
}

type InterventionStatus = InterventionRecord['status'];

const COLUMNS: { id: InterventionStatus; title: string; color: string; bg: string; dropRing: string }[] = [
  { id: 'Pending', title: 'Identified (Pending Remedial)', color: 'text-amber-900', bg: 'bg-amber-50 border-amber-200', dropRing: 'ring-amber-400' },
  { id: 'In Progress', title: 'Active Remedial Tutoring', color: 'text-blue-900', bg: 'bg-blue-50 border-blue-200', dropRing: 'ring-blue-400' },
  { id: 'Completed', title: 'Target Deficit Closed', color: 'text-emerald-900', bg: 'bg-emerald-50 border-emerald-200', dropRing: 'ring-emerald-400' },
];

/** Days until review, or null when there is no parseable date or the work is finished */
function reviewCountdown(item: InterventionRecord): number | null {
  if (item.status === 'Completed') return null;
  const date = parseDate(item.reviewDate);
  return date ? daysUntil(date) : null;
}

export default function InterventionKanban({ classId = 'IX' }: InterventionKanbanProps) {
  const { showToast } = useToast();
  const [items, setItems] = useState<InterventionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ section: 'ALL', subject: 'ALL', teacher: 'ALL', overdueOnly: false });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InterventionRecord | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<InterventionStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    schoolMilestoneApi
      .getInterventions()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => console.error('Failed loading interventions:', err))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Records without a classId predate multi-class support and belong to Class IX
  const classItems = useMemo(() => items.filter((item) => (item.classId || 'IX') === classId), [items, classId]);

  const options = useMemo(() => {
    const unique = (values: string[]) => Array.from(new Set(values)).sort();
    return {
      section: unique(classItems.map((i) => i.section)),
      subject: unique(classItems.map((i) => i.subject)),
      teacher: unique(classItems.map((i) => i.assignedTeacher)),
    };
  }, [classItems]);

  const filtered = classItems.filter((item) => {
    if (filters.section !== 'ALL' && item.section !== filters.section) return false;
    if (filters.subject !== 'ALL' && item.subject !== filters.subject) return false;
    if (filters.teacher !== 'ALL' && item.assignedTeacher !== filters.teacher) return false;
    if (filters.overdueOnly) {
      const days = reviewCountdown(item);
      if (days === null || days >= 0) return false;
    }
    return true;
  });

  const overdueCount = classItems.filter((item) => (reviewCountdown(item) ?? 0) < 0).length;

  const handleMoveStatus = async (id: string, newStatus: InterventionStatus) => {
    const previous = items;
    const target = items.find((item) => item.id === id);
    if (!target || target.status === newStatus) return;
    const column = COLUMNS.find((c) => c.id === newStatus);

    // Optimistic update, rolled back if the save fails
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
    try {
      const saved = await schoolMilestoneApi.saveIntervention(
        { ...target, status: newStatus },
        `Moved to ${column?.title ?? newStatus}`
      );
      setItems((prev) => prev.map((item) => (item.id === id ? saved : item)));
      showToast(`${target.studentName} moved to ${column?.title ?? newStatus}`);
    } catch (err) {
      console.error('Failed saving intervention:', err);
      setItems(previous);
      showToast(`Could not update ${target.studentName}. Please try again.`, 'error');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item: InterventionRecord) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleSaved = (record: InterventionRecord) => {
    setItems((prev) =>
      prev.some((i) => i.id === record.id) ? prev.map((i) => (i.id === record.id ? record : i)) : [record, ...prev]
    );
  };

  const selectClass =
    'px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <LifeBuoy className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Intervention Board</h2>
            <p className="text-xs text-slate-500">
              {classItems.length} records
              {overdueCount > 0 && <span className="text-rose-700 font-semibold"> • {overdueCount} overdue</span>}
              {' • '}Drag cards between columns or use the buttons
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" aria-hidden="true" /> New intervention
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4" role="group" aria-label="Filter interventions">
        {(['section', 'subject', 'teacher'] as const).map((key) => (
          <label key={key} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="capitalize">{key}</span>
            <select
              value={filters[key]}
              onChange={(e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }))}
              className={selectClass}
            >
              <option value="ALL">All</option>
              {options[key].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ))}
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.overdueOnly}
            onChange={(e) => setFilters((prev) => ({ ...prev, overdueOnly: e.target.checked }))}
          />
          Overdue only
        </label>
      </div>

      {!isLoading && classItems.length === 0 && (
        <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          No interventions have been recorded for Class {classId} yet. Use “New intervention” to add one.
        </div>
      )}

      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        aria-busy={isLoading}
      >
        {COLUMNS.map((col) => {
          const colItems = filtered.filter((i) => i.status === col.id);
          const isDropTarget = dropTarget === col.id && draggingId !== null;

          return (
            <section
              key={col.id}
              aria-label={col.title}
              onDragOver={(e) => {
                if (!draggingId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dropTarget !== col.id) setDropTarget(col.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain') || draggingId;
                setDropTarget(null);
                setDraggingId(null);
                if (id) handleMoveStatus(id, col.id);
              }}
              className={`rounded-xl border p-3 flex flex-col min-h-[12rem] transition-shadow ${col.bg} ${
                isDropTarget ? `ring-2 ${col.dropRing}` : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className={`text-xs font-bold ${col.color}`}>{col.title}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-700">{colItems.length}</span>
              </div>

              <div className="space-y-3 flex-1">
                {colItems.map((item) => {
                  const days = reviewCountdown(item);
                  const isOverdue = days !== null && days < 0;
                  const isDueSoon = days !== null && days >= 0 && days <= 3;
                  return (
                    <article
                      key={item.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', item.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggingId(item.id);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDropTarget(null);
                      }}
                      className={`p-3.5 rounded-xl bg-white border shadow-xs hover:shadow-md transition-all text-xs space-y-2 cursor-grab active:cursor-grabbing ${
                        isOverdue ? 'border-rose-300' : 'border-slate-200/80'
                      } ${draggingId === item.id ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-1.5 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                          <span className="font-bold text-slate-900">{item.studentName}</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold whitespace-nowrap">
                          {classId} {item.section}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">{item.subject}</span>
                        <span className="font-bold text-rose-700 font-mono">Gap: {item.gap}%</span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                        <p className="text-slate-700">{item.reason}</p>
                        <div className="flex flex-wrap items-center justify-between gap-1 pt-1 text-slate-600">
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-blue-600" aria-hidden="true" />
                            {item.assignedTeacher}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" aria-hidden="true" />
                            Review {displayDate(item.reviewDate)}
                          </span>
                        </div>
                      </div>

                      {(isOverdue || isDueSoon) && (
                        <p className={`flex items-center gap-1 font-semibold ${isOverdue ? 'text-rose-700' : 'text-amber-800'}`}>
                          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                          {isOverdue
                            ? `Review overdue by ${Math.abs(days!)} day${Math.abs(days!) === 1 ? '' : 's'}`
                            : days === 0
                            ? 'Review due today'
                            : `Review due in ${days} day${days === 1 ? '' : 's'}`}
                        </p>
                      )}

                      <div className="pt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          aria-label={`Edit intervention for ${item.studentName}`}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold"
                        >
                          <Pencil className="w-3 h-3" aria-hidden="true" /> Edit
                        </button>
                        <span className="flex-1" />
                        {col.id !== 'Pending' && (
                          <button
                            type="button"
                            aria-label={`Move ${item.studentName} back to Pending`}
                            onClick={() => handleMoveStatus(item.id, 'Pending')}
                            className="text-slate-600 hover:text-slate-900"
                          >
                            ← Pending
                          </button>
                        )}
                        {col.id !== 'In Progress' && (
                          <button
                            type="button"
                            aria-label={`Move ${item.studentName} to Active Remedial Tutoring`}
                            onClick={() => handleMoveStatus(item.id, 'In Progress')}
                            className="text-blue-700 hover:underline font-semibold"
                          >
                            {col.id === 'Pending' ? 'Start →' : '← Reopen'}
                          </button>
                        )}
                        {col.id !== 'Completed' && (
                          <button
                            type="button"
                            aria-label={`Move ${item.studentName} to Target Deficit Closed`}
                            onClick={() => handleMoveStatus(item.id, 'Completed')}
                            className="text-emerald-700 hover:underline font-bold"
                          >
                            Close ✓
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}

                {colItems.length === 0 && (
                  <p className="text-center py-8 text-xs text-slate-500">{draggingId ? 'Drop here' : 'No records'}</p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <InterventionForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
        onDeleted={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
        classId={classId}
        existing={editing}
      />
    </div>
  );
}
