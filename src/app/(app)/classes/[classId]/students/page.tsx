'use client';
import React, { useState } from 'react';
import { useApiData } from '@/hooks/useApiData';
import { ErrorState, LoadingState, SampleDataBadge } from '@/components/ui/PageStatus';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { downloadCsv } from '@/utils/csv';
import { StudentRecord, ClassSummary } from '@/types/academic';
import {
  Users,
  Search,
  Download,
  ArrowLeft,
  ArrowUpDown,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import StudentProfileDrawer from '@/components/dashboard/StudentProfileDrawer';
import { getStudentTarget } from '@/utils/statusEngine';

type SortField = 'name' | 'section' | 'midTerm' | 'target' | 'gap';

export default function DynamicClassStudentsPage() {
  const params = useParams();
  const classId = ((params?.classId as string) || 'IX').toUpperCase();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const { data, isLoading, error, reload } = useApiData(
    () =>
      Promise.all([
        schoolMilestoneApi.getClassSummary(classId),
        schoolMilestoneApi.getStudentsByClass(classId),
      ]),
    [classId]
  );
  const [classInfo, students] = data ?? [null, []];

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
      const aTgt = getStudentTarget(a);
      const bTgt = getStudentTarget(b);

      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'section') cmp = (a.section || a.group || '').localeCompare(b.section || b.group || '');
      else if (sortField === 'midTerm') cmp = aVal - bVal;
      else if (sortField === 'target') cmp = aTgt - bTgt;
      else if (sortField === 'gap') cmp = (aVal - aTgt) - (bVal - bTgt);

      return sortAsc ? cmp : -cmp;
    });

  const exportCSV = () => {
    const headers = ['Roll No', 'Name', 'Section', 'Mid-Term %', 'Target %', 'Gap %'];
    const rows = filtered.map((s) => [
      s.enrollmentNumber || s.studentId,
      s.name,
      s.section || s.group,
      s.currentPerformance?.overall?.value ?? '',
      s.schoolTarget?.overall?.value ?? '',
      Math.round(((s.currentPerformance?.overall?.value ?? 0) - (getStudentTarget(s))) * 10) / 10,
    ]);

    downloadCsv(`Class_${classId}_Roster_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  if (error) return <ErrorState onRetry={reload} />;
  if (isLoading) return <LoadingState message={`Loading ${classId} Student Directory...`} />;
  if (!classInfo) {
    return (
      <ErrorState
        title={`Class ${classId} not found`}
        message="There is no grade with this code. Choose a class from the sidebar."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href={`/classes/${classId}`}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                {classInfo?.label || `Class ${classId}`} Student Directory
              </h1>
              {classInfo.dataSource === 'sample' && <SampleDataBadge />}
            </div>
            <p className="text-xs text-slate-500">
              {filtered.length} of {students.length} Scholars Enrolled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholar..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
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
                  className="py-3 px-4 cursor-pointer hover:text-blue-600 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Student & ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('section')}
                  className="py-3 px-3 cursor-pointer hover:text-blue-600 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Section</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('midTerm')}
                  className="py-3 px-3 cursor-pointer hover:text-blue-600 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Mid-Term Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('target')}
                  className="py-3 px-3 cursor-pointer hover:text-blue-600 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>School Target</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('gap')}
                  className="py-3 px-3 cursor-pointer hover:text-blue-600 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Gap Benchmark</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">360° Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => {
                const current = s.currentPerformance?.overall?.value ?? 0;
                const target = getStudentTarget(s);
                const gap = Math.round((current - target) * 10) / 10;
                const isAhead = gap >= 0;

                return (
                  <tr
                    key={s.studentId}
                    onClick={() => {
                      setSelectedStudent(s);
                      setDrawerOpen(true);
                    }}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {s.name}
                      <span className="block text-[10px] text-slate-400 font-mono font-normal">
                        {s.enrollmentNumber || s.studentId}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px]">
                        {s.section || s.group}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-bold font-mono text-slate-900">
                      {current}%
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-500">
                      {target}%
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAhead ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isAhead ? `+${gap}%` : `${gap}%`}
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
            </tbody>
          </table>
        </div>
      </div>

      <StudentProfileDrawer
        student={selectedStudent}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
