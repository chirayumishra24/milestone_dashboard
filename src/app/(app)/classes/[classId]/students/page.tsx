'use client';
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useApiData } from '@/hooks/useApiData';
import { useClassId } from '@/hooks/useClassId';
import { useQueryParams } from '@/hooks/useQueryParams';
import { ErrorState, LoadingState, SampleDataBadge } from '@/components/ui/PageStatus';
import PageHeader, { headerActionClass } from '@/components/ui/PageHeader';
import DataTable, { Column, SortDirection } from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import StudentProfileDrawer from '@/components/dashboard/StudentProfileDrawer';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { downloadCsv } from '@/utils/csv';
import {
  StatusFilterValue,
  extractNumericValue,
  getStudentScore,
  getStudentStatus,
  getStudentTarget,
  matchesStatusFilter,
} from '@/utils/statusEngine';
import { StudentRecord } from '@/types/academic';
import { Users, Search, Download, ChevronRight } from 'lucide-react';

const SUBJECT_COLUMNS = [
  { key: 'english', short: 'ENG', label: 'English' },
  { key: 'secondLanguage', short: 'LANG', label: '2nd Language' },
  { key: 'maths', short: 'MATH', label: 'Mathematics' },
  { key: 'science', short: 'SCI', label: 'Science' },
  { key: 'socialScience', short: 'SST', label: 'Social Science' },
  { key: 'it', short: 'IT', label: 'Computer / IT' },
] as const;

const STATUS_FILTERS: { id: StatusFilterValue; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'ACHIEVED', label: 'Target Met' },
  { id: 'ON_TRACK', label: 'On Track' },
  { id: 'WATCH', label: 'At Risk' },
  { id: 'CRITICAL', label: 'Critical' },
];

const subjectScore = (s: StudentRecord, key: (typeof SUBJECT_COLUMNS)[number]['key']) =>
  extractNumericValue(s.currentPerformance?.subjects?.[key]);

const gapOf = (s: StudentRecord) => Math.round((getStudentScore(s) - getStudentTarget(s)) * 10) / 10;

export default function ClassStudentsPage() {
  const classId = useClassId();
  const { showToast } = useToast();
  const [query, setQuery] = useQueryParams({ q: '', section: 'ALL', status: 'ALL', sort: 'name', dir: 'asc' });
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  const { data, isLoading, error, reload } = useApiData(
    () => Promise.all([schoolMilestoneApi.getClassSummary(classId), schoolMilestoneApi.getStudentsByClass(classId)]),
    [classId]
  );
  const [classInfo, students] = data ?? [null, []];

  const filtered = useMemo(() => {
    const q = query.q.trim().toLowerCase();
    return students.filter((s) => {
      const sec = s.section || s.group;
      if (query.section !== 'ALL' && sec !== query.section) return false;
      if (!matchesStatusFilter(s, query.status as StatusFilterValue)) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.enrollmentNumber || '').toLowerCase().includes(q) ||
        sec.toLowerCase().includes(q)
      );
    });
  }, [students, query.q, query.section, query.status]);

  const columns: Column<StudentRecord>[] = [
    {
      key: 'name',
      header: 'Student',
      sortValue: (s) => s.name,
      render: (s) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStudent(s);
          }}
          className="text-left"
        >
          <span className="block font-bold text-slate-900 group-hover:text-blue-700">{s.name}</span>
          <span className="block text-xs text-slate-500 font-mono">{s.enrollmentNumber || s.studentId}</span>
        </button>
      ),
    },
    {
      key: 'section',
      header: 'Section',
      sortValue: (s) => s.section || s.group,
      render: (s) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 whitespace-nowrap">
          {s.section || s.group}
        </span>
      ),
    },
    ...SUBJECT_COLUMNS.map<Column<StudentRecord>>((subj) => ({
      key: subj.key,
      header: <abbr title={subj.label} className="no-underline">{subj.short}</abbr>,
      align: 'center',
      responsiveClassName: 'hidden lg:table-cell',
      className: 'font-mono text-slate-700',
      sortValue: (s) => subjectScore(s, subj.key) ?? -1,
      render: (s) => subjectScore(s, subj.key) ?? '–',
    })),
    {
      key: 'score',
      header: 'Score',
      align: 'right',
      className: 'font-mono font-bold text-slate-900',
      sortValue: getStudentScore,
      render: (s) => `${getStudentScore(s)}%`,
    },
    {
      key: 'target',
      header: 'Target',
      align: 'right',
      responsiveClassName: 'hidden sm:table-cell',
      className: 'font-mono text-slate-600',
      sortValue: getStudentTarget,
      render: (s) => `${getStudentTarget(s)}%`,
    },
    {
      key: 'gap',
      header: 'Gap',
      align: 'right',
      responsiveClassName: 'hidden sm:table-cell',
      sortValue: gapOf,
      render: (s) => {
        const gap = gapOf(s);
        return (
          <span className={`font-mono font-bold ${gap >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {gap > 0 ? `+${gap}` : gap}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (s) => ['CRITICAL', 'WATCH', 'ON_TRACK', 'ACHIEVED'].indexOf(getStudentStatus(s).status),
      render: (s) => <StatusBadge status={getStudentStatus(s).status} />,
    },
    {
      key: 'profile',
      header: <span className="sr-only">Profile</span>,
      align: 'right',
      render: (s) => (
        <Link
          href={`/classes/${classId}/students/${encodeURIComponent(s.studentId)}`}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Open full profile for ${s.name}`}
          className="inline-flex p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      ),
    },
  ];

  if (error) return <ErrorState onRetry={reload} />;
  if (isLoading) return <LoadingState message={`Loading Class ${classId} directory...`} />;
  if (!classInfo) return <ErrorState title={`Class ${classId} not found`} message="Choose a class from the sidebar." />;

  const exportCsv = () => {
    const headers = ['Roll / Enrollment', 'Name', 'Section', ...SUBJECT_COLUMNS.map((c) => c.label), 'Score %', 'Target %', 'Gap', 'Status'];
    const rows = filtered.map((s) => [
      s.enrollmentNumber || s.studentId,
      s.name,
      `${classId} ${s.section || s.group}`,
      ...SUBJECT_COLUMNS.map((c) => subjectScore(s, c.key) ?? ''),
      getStudentScore(s),
      getStudentTarget(s),
      gapOf(s),
      getStudentStatus(s).label,
    ]);
    downloadCsv(`Class_${classId}_Roster_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast(`Exported ${rows.length} students to CSV`);
  };

  const sectionOptions = ['ALL', ...classInfo.sections];
  const chipClass = (active: boolean) =>
    `px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
      active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
    }`;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title={`${classInfo.label} Student Directory`}
        description={`${filtered.length} of ${students.length} students shown`}
        badges={classInfo.dataSource === 'sample' ? <SampleDataBadge /> : undefined}
        actions={
          <button type="button" onClick={exportCsv} className={headerActionClass.primary}>
            <Download className="w-4 h-4" aria-hidden="true" /> Export CSV
          </button>
        }
      />

      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <label htmlFor="roster-search" className="sr-only">
            Search students
          </label>
          <input
            id="roster-search"
            type="search"
            value={query.q}
            onChange={(e) => setQuery({ q: e.target.value })}
            placeholder="Search by name, roll number or section"
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
          <div role="group" aria-label="Filter by section" className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-semibold text-slate-500 mr-1">Section</span>
            {sectionOptions.map((sec) => (
              <button
                key={sec}
                type="button"
                aria-pressed={query.section === sec}
                onClick={() => setQuery({ section: sec })}
                className={chipClass(query.section === sec)}
              >
                {sec === 'ALL' ? 'All' : sec}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Filter by status" className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-semibold text-slate-500 mr-1">Status</span>
            {STATUS_FILTERS.map((st) => (
              <button
                key={st.id}
                type="button"
                aria-pressed={query.status === st.id}
                onClick={() => setQuery({ status: st.id })}
                className={chipClass(query.status === st.id)}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DataTable
        caption={`${classInfo.label} students`}
        rows={filtered}
        columns={columns}
        getRowKey={(s) => s.studentId}
        sortKey={query.sort}
        sortDirection={query.dir as SortDirection}
        onSortChange={(sort, dir) => setQuery({ sort, dir })}
        onRowClick={setSelectedStudent}
        emptyMessage="No students match these filters."
      />

      <StudentProfileDrawer
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}
