'use client';
import React, { useState } from 'react';
import { StudentRecord } from '@/types/academic';
import {
  AlertTriangle,
  AlertOctagon,
  ChevronRight,
  Filter,
  Search,
  ArrowUpDown,
  User,
  Sparkles,
} from 'lucide-react';
import StudentProfileDrawer from './StudentProfileDrawer';
import { getStudentStatus, getStudentTarget } from '@/utils/statusEngine';

interface StudentsRequiringAttentionTableProps {
  students: StudentRecord[];
}

export default function StudentsRequiringAttentionTable({
  students,
}: StudentsRequiringAttentionTableProps) {
  const [filterMode, setFilterMode] = useState<'ALL_ATTENTION' | 'CRITICAL' | 'LARGE_GAP'>('ALL_ATTENTION');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Students who are At Risk or Critical, or more than 5 points short of their target
  const attentionStudents = students.filter((s) => {
    const { status, gap } = getStudentStatus(s);

    if (filterMode === 'CRITICAL') {
      return status === 'CRITICAL';
    }
    if (filterMode === 'LARGE_GAP') {
      return gap <= -10;
    }
    return status === 'WATCH' || status === 'CRITICAL' || gap < -5;
  });

  const searched = attentionStudents.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.enrollmentNumber || '').toLowerCase().includes(q) ||
      (s.section || s.group || '').toLowerCase().includes(q)
    );
  });

  const handleOpenStudent = (s: StudentRecord) => {
    setSelectedStudent(s);
    setDrawerOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">
                  Priority Intervention Cohort
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {searched.length} Students
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Action triage for students below 70% or with target deficit
              </p>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setFilterMode('ALL_ATTENTION')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterMode === 'ALL_ATTENTION'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Attention
            </button>
            <button
              onClick={() => setFilterMode('CRITICAL')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterMode === 'CRITICAL'
                  ? 'bg-white text-rose-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              Critical (&lt;60%)
            </button>
            <button
              onClick={() => setFilterMode('LARGE_GAP')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterMode === 'LARGE_GAP'
                  ? 'bg-white text-amber-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-amber-600'
              }`}
            >
              Deficit &gt;10%
            </button>
          </div>
        </div>

        {/* Search row inside table */}
        <div className="mb-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by student name or section..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/70">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-2">Cohort</th>
                <th className="py-2.5 px-2">Mid-Term</th>
                <th className="py-2.5 px-2">Target</th>
                <th className="py-2.5 px-2">Deficit Gap</th>
                <th className="py-2.5 px-2">Weakest Subject</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {searched.slice(0, 7).map((s) => {
                const current = s.currentPerformance?.overall?.value ?? 0;
                const target = getStudentTarget(s);
                const gap = Math.round((current - target) * 10) / 10;
                const isCritical = getStudentStatus(s).status === 'CRITICAL';

                // Identify weakest subject
                const subjEntries = Object.entries(s.currentPerformance?.subjects || {});
                let weakestName = 'Maths';
                let lowestScore = 100;
                subjEntries.forEach(([k, v]: [string, any]) => {
                  if (typeof v?.value === 'number' && v.value < lowestScore) {
                    lowestScore = v.value;
                    weakestName = k;
                  }
                });

                return (
                  <tr
                    key={s.studentId}
                    onClick={() => handleOpenStudent(s)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        <span>{s.name}</span>
                        {isCritical && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {s.enrollmentNumber || s.studentId}
                      </span>
                    </td>

                    <td className="py-2.5 px-2 font-semibold text-slate-600">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px]">
                        IX {s.section || s.group}
                      </span>
                    </td>

                    <td className="py-2.5 px-2 font-bold font-mono text-slate-900">
                      {current}%
                    </td>

                    <td className="py-2.5 px-2 font-mono text-slate-500">
                      {target}%
                    </td>

                    <td className="py-2.5 px-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          gap < -10
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {gap}%
                      </span>
                    </td>

                    <td className="py-2.5 px-2 text-slate-600 capitalize">
                      <span className="text-rose-700 font-semibold">{weakestName}</span> ({lowestScore}%)
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenStudent(s);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Open 360 Profile"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Showing top priority cases • Click any row for 360° Diagnostic</span>
        <button
          onClick={() => {
            if (searched.length > 0) handleOpenStudent(searched[0]);
          }}
          className="text-blue-600 font-semibold hover:underline"
        >
          View Full Intervention Ledger →
        </button>
      </div>

      {/* Slide-over Profile Drawer */}
      <StudentProfileDrawer
        student={selectedStudent}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
