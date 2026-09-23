'use client';
import React, { useEffect, useState } from 'react';
import { InterventionRecord } from '@/types/academic';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { useToast } from '@/components/ui/Toast';
import { LifeBuoy, UserCheck, Calendar } from 'lucide-react';

interface InterventionKanbanProps {
  classId?: string;
}

type InterventionStatus = InterventionRecord['status'];

export default function InterventionKanban({ classId = 'IX' }: InterventionKanbanProps) {
  const [items, setItems] = useState<InterventionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const [selectedSection, setSelectedSection] = useState('ALL');

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
  const classItems = items.filter((item) => (item.classId || 'IX') === classId);

  const sectionOptions = ['ALL', ...Array.from(new Set(classItems.map((item) => item.section))).sort()];

  const filtered = classItems.filter((item) => {
    if (selectedSection === 'ALL') return true;
    return item.section === selectedSection;
  });

  const columns: { id: InterventionStatus; title: string; color: string; bg: string }[] = [
    { id: 'Pending', title: 'Identified (Pending Remedial)', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
    { id: 'In Progress', title: 'Active Remedial Tutoring', color: 'text-blue-800', bg: 'bg-blue-50 border-blue-200' },
    { id: 'Completed', title: 'Target Deficit Closed', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
  ];

  const handleMoveStatus = async (id: string, newStatus: InterventionStatus) => {
    const previous = items;
    const target = items.find((item) => item.id === id);
    if (!target) return;

    // Optimistic update, rolled back if the save fails
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
    try {
      await schoolMilestoneApi.saveIntervention({ ...target, status: newStatus });
      const column = columns.find((c) => c.id === newStatus);
      showToast(`${target.studentName} moved to ${column?.title ?? newStatus}`);
    } catch (err) {
      console.error('Failed saving intervention:', err);
      setItems(previous);
      showToast(`Could not update ${target.studentName}. Please try again.`, 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <LifeBuoy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">
              Academic Intervention Action Board
            </h3>
            <p className="text-xs text-slate-500">
              Accountability workflow for closing student learning deficits
            </p>
          </div>
        </div>

        {/* Section filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Section:</span>
          <div role="group" aria-label="Filter by section" className="flex items-center bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
            {sectionOptions.map((sec) => (
              <button
                key={sec}
                type="button"
                aria-pressed={selectedSection === sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedSection === sec
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!isLoading && classItems.length === 0 && (
        <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
          No interventions have been recorded for Class {classId} yet.
        </div>
      )}

      {/* Kanban 3-Column Layout */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`} aria-busy={isLoading}>
        {columns.map((col) => {
          const colItems = filtered.filter((i) => i.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-xl border p-3 flex flex-col ${col.bg}`}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className={`text-xs font-bold ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-2xs">
                  {colItems.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.studentName}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {classId} {item.section}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{item.subject}</span>
                      <span className="font-bold text-rose-600 font-mono">
                        Gap: {item.gap}%
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <p className="text-slate-600 italic">"{item.reason}"</p>
                      <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-blue-600" />
                          {item.assignedTeacher}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {item.reviewDate}
                        </span>
                      </div>
                    </div>

                    {/* Move buttons */}
                    <div className="pt-1 flex items-center justify-between gap-1 border-t border-slate-100 text-xs">
                      {col.id !== 'Pending' && (
                        <button
                          type="button"
                          aria-label={`Move ${item.studentName} back to Pending`}
                          onClick={() => handleMoveStatus(item.id, 'Pending')}
                          className="text-slate-500 hover:text-slate-800"
                        >
                          ← Pending
                        </button>
                      )}
                      {col.id !== 'In Progress' && (
                        <button
                          type="button"
                          aria-label={`Move ${item.studentName} to Active Remedial Tutoring`}
                          onClick={() => handleMoveStatus(item.id, 'In Progress')}
                          className="text-blue-600 hover:underline font-semibold ml-auto"
                        >
                          {col.id === 'Pending' ? 'Start Remedial →' : '← Reopen'}
                        </button>
                      )}
                      {col.id !== 'Completed' && (
                        <button
                          type="button"
                          aria-label={`Move ${item.studentName} to Target Deficit Closed`}
                          onClick={() => handleMoveStatus(item.id, 'Completed')}
                          className="text-emerald-600 hover:underline font-bold ml-auto"
                        >
                          Close Target ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {colItems.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-500 italic">
                    No active records
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
