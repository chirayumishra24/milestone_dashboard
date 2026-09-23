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
  FileSpreadsheet,
} from 'lucide-react';
import StudentProfileDrawer from '@/components/dashboard/StudentProfileDrawer';

type SortField = 'name' | 'section' | 'midTerm' | 'target' | 'gap';

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<'ALL' | 'AURA' | 'ZEN' | 'NEO'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACHIEVED' | 'ON_TRACK' | 'WATCH' | 'CRITICAL'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filtered = students
    .filter((s) => {
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
    })
    .sort((a, b) => {
      let cmp = 0;
      const aVal = a.currentPerformance?.overall?.value ?? 0;
      const bVal = b.currentPerformance?.overall?.value ?? 0;
      const aTgt = a.schoolTarget?.overall?.value ?? 80;
      const bTgt = b.schoolTarget?.overall?.value ?? 80;

      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'section') cmp = (a.section || a.group || '').localeCompare(b.section || b.group || '');
      else if (sortField === 'midTerm') cmp = aVal - bVal;
      else if (sortField === 'target') cmp = aTgt - bTgt;
      else if (sortField === 'gap') cmp = (aVal - aTgt) - (bVal - bTgt);

      return sortAsc ? cmp : -cmp;
    });

  const exportToCSV = () => {
    const headers = [
      'Roll / Enrollment',
      'Name',
      'Section',
      'English',
      '2nd Lang',
      'Mathematics',
      'Science',
      'Social Science',
      'Computer / IT',
      'Mid-Term %',
      'Target %',
      'Gap %',
    ];

    const rows = filtered.map((s) => [
      `"${s.enrollmentNumber || s.studentId}"`,
      `"${s.name}"`,
      `"IX ${s.section || s.group}"`,
      s.currentPerformance?.subjects?.english?.value ?? '',
      s.currentPerformance?.subjects?.secondLanguage?.value ?? '',
      s.currentPerformance?.subjects?.maths?.value ?? '',
      s.currentPerformance?.subjects?.science?.value ?? '',
      s.currentPerformance?.subjects?.socialScience?.value ?? '',
      s.currentPerformance?.subjects?.it?.value ?? '',
      s.currentPerformance?.overall?.value ?? '',
      s.schoolTarget?.overall?.value ?? '',
      Math.round(((s.currentPerformance?.overall?.value ?? 0) - (s.schoolTarget?.overall?.value ?? 80)) * 10) / 10,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Class_IX_Roster_${selectedSection}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
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

        {/* Search & Export Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or roll..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors whitespace-nowrap active:scale-95"
            title="Download full roster as CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
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
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Student & ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('section')}
                  className="py-3 px-3 cursor-pointer hover:text-blue-600 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Section</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-2 text-center">ENG</th>
                <th className="py-3 px-2 text-center">LANG</th>
                <th className="py-3 px-2 text-center">MATH</th>
                <th className="py-3 px-2 text-center">SCI</th>
                <th className="py-3 px-2 text-center">SST</th>
                <th className="py-3 px-2 text-center">IT</th>
                <th
                  onClick={() => handleSort('midTerm')}
                  className="py-3 px-3 cursor-pointer hover:text-blue-600 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Mid-Term</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('target')}
                  className="py-3 px-3 cursor-pointer hover:text-blue-600 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Target</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('gap')}
                  className="py-3 px-3 cursor-pointer hover:text-blue-600 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Gap / Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
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
                        IX {s.section || s.group}
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
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className={`text-[10px] font-bold font-mono ${gap >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          ({gap >= 0 ? `+${gap}` : gap}%)
                        </span>
                      </div>
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
