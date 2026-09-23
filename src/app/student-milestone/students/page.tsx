'use client';
import React, { useEffect, useState } from 'react';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { StudentRecord } from '@/types/academic';
import {
  Users,
  Search,
  Filter,
  ChevronRight,
  Download,
  Award,
  AlertTriangle,
  Flame,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import StudentProfileDrawer from '@/components/dashboard/StudentProfileDrawer';

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<'ALL' | 'AURA' | 'ZEN' | 'NEO'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACHIEVED' | 'ON_TRACK' | 'WATCH' | 'CRITICAL'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await schoolMilestoneApi.getStudents();
        setStudents(data);
      } catch (err) {
        console.error('Failed loading students:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = students.filter((s) => {
    const sec = s.section || s.group;
    if (selectedSection !== 'ALL' && sec !== selectedSection) return false;

    const val = s.currentPerformance?.overall?.value ?? 0;
    const tgt = s.schoolTarget?.overall?.value ?? 80;

    if (selectedStatus === 'ACHIEVED' && val < tgt) return false;
    if (selectedStatus === 'ON_TRACK' && (val < 70 || val >= tgt)) return false;
    if (selectedStatus === 'WATCH' && (val < 60 || val >= 70)) return false;
    if (selectedStatus === 'CRITICAL' && val >= 60) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.enrollmentNumber || '').toLowerCase().includes(q) ||
      (sec || '').toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (val: number, tgt: number) => {
    if (val >= tgt) return { label: 'Target Met', color: 'bg-emerald-100 text-emerald-800' };
    if (val >= 70) return { label: 'On Track', color: 'bg-blue-100 text-blue-800' };
    if (val >= 60) return { label: 'Watch', color: 'bg-amber-100 text-amber-800' };
    return { label: 'Critical', color: 'bg-rose-100 text-rose-800' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Class IX Student Cohort Directory
              </h1>
              <p className="text-xs text-slate-500">
                Full academic registry across AURA, ZEN, and NEO sections ({filtered.length} of {students.length} students)
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or roll..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Section Pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold mr-1">Section:</span>
          {(['ALL', 'AURA', 'ZEN', 'NEO'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                selectedSection === sec
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold mr-1">Status:</span>
          {(['ALL', 'ACHIEVED', 'ON_TRACK', 'WATCH', 'CRITICAL'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1.5 rounded-xl font-medium transition-all ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student & ID</th>
                <th className="py-3 px-3">Section</th>
                <th className="py-3 px-2 text-center">ENG</th>
                <th className="py-3 px-2 text-center">LANG</th>
                <th className="py-3 px-2 text-center">MATH</th>
                <th className="py-3 px-2 text-center">SCI</th>
                <th className="py-3 px-2 text-center">SST</th>
                <th className="py-3 px-2 text-center">IT</th>
                <th className="py-3 px-3">Mid-Term</th>
                <th className="py-3 px-3">Target</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">360° Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => {
                const current = s.currentPerformance?.overall?.value ?? 0;
                const target = s.schoolTarget?.overall?.value ?? 80;
                const gap = Math.round((current - target) * 10) / 10;
                const badge = getStatusBadge(current, target);
                const subjs = s.currentPerformance?.subjects;

                return (
                  <tr
                    key={s.studentId}
                    onClick={() => {
                      setSelectedStudent(s);
                      setDrawerOpen(true);
                    }}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {s.enrollmentNumber || s.studentId}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-[10px] text-slate-700">
                        {s.section || s.group}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-center font-mono font-medium text-slate-700">
                      {subjs?.english?.value ?? '-'}
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-medium text-slate-700">
                      {subjs?.secondLanguage?.value ?? '-'}
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-medium text-slate-700">
                      {subjs?.maths?.value ?? '-'}
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-medium text-slate-700">
                      {subjs?.science?.value ?? '-'}
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-medium text-slate-700">
                      {subjs?.socialScience?.value ?? '-'}
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-medium text-slate-700">
                      {subjs?.it?.value ?? '-'}
                    </td>

                    <td className="py-3 px-3 font-bold font-mono text-slate-900">
                      {current}%
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-500">
                      {target}%
                    </td>

                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(s);
                          setDrawerOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    No students match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
