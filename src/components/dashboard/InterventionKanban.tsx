'use client';
import React, { useState } from 'react';
import { InterventionRecord } from '@/types/academic';
import {
  LifeBuoy,
  UserCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Plus,
} from 'lucide-react';

interface InterventionKanbanProps {
  initialInterventions?: InterventionRecord[];
}

const DEFAULT_INTERVENTIONS: InterventionRecord[] = [
  {
    id: 'INT-01',
    studentId: 'STU-042',
    studentName: 'Aarav Patel',
    section: 'AURA',
    subject: 'Mathematics',
    currentPerformance: 54.5,
    target: 80,
    gap: -25.5,
    reason: 'Algebra & Quadratic Foundations deficit',
    assignedTeacher: 'Mrs. S. Sharma',
    strategy: 'Twice-weekly remedial drills',
    createdDate: '12 Sep 2026',
    reviewDate: '15 Oct 2026',
    status: 'Pending',
    remarks: 'Parent consent received',
  },
  {
    id: 'INT-02',
    studentId: 'STU-088',
    studentName: 'Diya Sharma',
    section: 'ZEN',
    subject: 'Science',
    currentPerformance: 58.0,
    target: 78,
    gap: -20.0,
    reason: 'Physics Numerical Problem Solving',
    assignedTeacher: 'Mr. R. Verma',
    strategy: 'Peer study buddy + Formula flashcards',
    createdDate: '15 Sep 2026',
    reviewDate: '18 Oct 2026',
    status: 'In Progress',
    remarks: 'Session 3 completed',
  },
  {
    id: 'INT-03',
    studentId: 'STU-115',
    studentName: 'Kabir Mehta',
    section: 'NEO',
    subject: 'Social Science',
    currentPerformance: 56.5,
    target: 75,
    gap: -18.5,
    reason: 'Map work & History source-based questions',
    assignedTeacher: 'Ms. A. Iyer',
    strategy: 'Visual timeline mapping worksheets',
    createdDate: '18 Sep 2026',
    reviewDate: '20 Oct 2026',
    status: 'In Progress',
    remarks: 'Score improved by +8% in practice quiz',
  },
  {
    id: 'INT-04',
    studentId: 'STU-019',
    studentName: 'Ananya Roy',
    section: 'AURA',
    subject: 'English',
    currentPerformance: 62.0,
    target: 75,
    gap: -13.0,
    reason: 'Grammar editing & Letter writing structure',
    assignedTeacher: 'Mrs. M. Sen',
    strategy: 'Writing template masterclasses',
    createdDate: '05 Sep 2026',
    reviewDate: '02 Oct 2026',
    status: 'Completed',
    remarks: 'Achieved 76% in Mid-Term review',
  },
];

export default function InterventionKanban({
  initialInterventions = DEFAULT_INTERVENTIONS,
}: InterventionKanbanProps) {
  const [items, setItems] = useState<InterventionRecord[]>(initialInterventions);
  const [selectedSection, setSelectedSection] = useState<'ALL' | 'AURA' | 'ZEN' | 'NEO'>('ALL');

  const filtered = items.filter((item) => {
    if (selectedSection === 'ALL') return true;
    return item.section === selectedSection;
  });

  const columns: { id: 'Pending' | 'In Progress' | 'Completed'; title: string; color: string; bg: string }[] = [
    { id: 'Pending', title: 'Identified (Pending Remedial)', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
    { id: 'In Progress', title: 'Active Remedial Tutoring', color: 'text-blue-800', bg: 'bg-blue-50 border-blue-200' },
    { id: 'Completed', title: 'Target Deficit Closed', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
  ];

  const handleMoveStatus = (id: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
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
          <span className="text-xs text-slate-400 font-medium">Cohort:</span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            {(['ALL', 'AURA', 'ZEN', 'NEO'] as const).map((sec) => (
              <button
                key={sec}
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

      {/* Kanban 3-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-2xs">
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
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        IX {item.section}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-700">{item.subject}</span>
                      <span className="font-bold text-rose-600 font-mono">
                        Gap: {item.gap}%
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                      <p className="text-slate-600 italic">"{item.reason}"</p>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-blue-600" />
                          {item.assignedTeacher}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {item.reviewDate}
                        </span>
                      </div>
                    </div>

                    {/* Move buttons */}
                    <div className="pt-1 flex items-center justify-between gap-1 border-t border-slate-100 text-[10px]">
                      {col.id !== 'Pending' && (
                        <button
                          onClick={() => handleMoveStatus(item.id, 'Pending')}
                          className="text-slate-500 hover:text-slate-800"
                        >
                          ← Pending
                        </button>
                      )}
                      {col.id !== 'In Progress' && (
                        <button
                          onClick={() => handleMoveStatus(item.id, 'In Progress')}
                          className="text-blue-600 hover:underline font-semibold ml-auto"
                        >
                          {col.id === 'Pending' ? 'Start Remedial →' : '← Reopen'}
                        </button>
                      )}
                      {col.id !== 'Completed' && (
                        <button
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
                  <div className="text-center py-8 text-xs text-slate-400 italic">
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
