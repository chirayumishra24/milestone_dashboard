'use client';
import React from 'react';
import { useApiData } from '@/hooks/useApiData';
import { ErrorState, LoadingState, SampleDataBadge } from '@/components/ui/PageStatus';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { downloadCsv } from '@/utils/csv';
import {
  StudentRecord,
  ClassSummary,
} from '@/types/academic';
import {
  calculateClassSummary,
  calculateSubjectSummary,
  SubjectMetric,
} from '@/utils/academicCalculations';
import {
  Loader2,
  Printer,
  Download,
  ArrowLeft,
  GraduationCap,
  Award,
  AlertTriangle,
  TrendingUp,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { getStudentScore, getStudentStatus, getStudentTarget } from '@/utils/statusEngine';

export default function ClassReportPage() {
  const params = useParams();
  const classId = ((params?.classId as string) || 'IX').toUpperCase();


  const { data, isLoading, error, reload } = useApiData(
    () =>
      Promise.all([
        schoolMilestoneApi.getClassSummary(classId),
        schoolMilestoneApi.getStudentsByClass(classId),
      ]),
    [classId]
  );
  const [classInfo, students] = data ?? [null, []];

  if (error) return <ErrorState onRetry={reload} />;
  if (isLoading) return <LoadingState message={`Generating Class ${classId} Report Card...`} />;
  if (!classInfo) {
    return (
      <ErrorState
        title={`Class ${classId} not found`}
        message="There is no grade with this code. Choose a class from the sidebar."
      />
    );
  }

  const summary = calculateClassSummary(students);
  const subjects: SubjectMetric[] = calculateSubjectSummary(students);

  // Section breakdown
  const sections = classInfo?.sections || ['AURA', 'ZEN', 'NEO'];
  const sectionStats = sections.map((sec) => {
    const secStudents = students.filter((s) => (s.section || s.group) === sec);
    const secSum = calculateClassSummary(secStudents);
    return {
      section: sec,
      total: secStudents.length,
      average: secSum.classAverage || 0,
      onTrack: secSum.onTrackCount || 0,
      critical: secSum.criticalCount || 0,
    };
  });

  // Top Performers and Attention
  const sortedStudents = [...students].sort(
    (a, b) => (b.currentPerformance?.overall?.value ?? 0) - (a.currentPerformance?.overall?.value ?? 0)
  );
  const topPerformers = sortedStudents.slice(0, 5);
  const criticalScholars = sortedStudents
    .filter((s) => getStudentStatus(s).status === 'CRITICAL')
    .slice(0, 5);

  const handleExportCSV = () => {
    const headers = ['Roll No', 'Name', 'Section', 'Overall Score (%)', 'Target (%)', 'Status'];
    const rows = students.map((s) => {
      const val = getStudentScore(s);
      const tgt = getStudentTarget(s);
      const status = getStudentStatus(s).label;
      return [
        s.studentId,
        s.name,
        s.section || s.group || '-',
        val,
        tgt,
        status,
      ];
    });
    downloadCsv(`Class_${classId}_Academic_Report.csv`, headers, rows);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 print:p-0 print:m-0 print:max-w-none">
      {/* Top Action Bar (hidden in print) */}
      <div className="print:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <Link
          href={`/classes/${classId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Class {classId} Overview
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Formal Header Card */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs print:border-none print:shadow-none">
        <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                CPS
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Central Public School
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">Affiliated to CBSE, New Delhi • Academic Directorate</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200">
              OFFICIAL ACADEMIC AUDIT
            </span>
            <p className="text-xs text-slate-400 mt-1 font-mono">Date: 23 Sep 2026</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Class {classId} Milestone Assessment Report
              </h1>
              {classInfo.dataSource === 'sample' && <SampleDataBadge />}
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Curricular Stage: <strong>{classInfo?.label || `Class ${classId}`}</strong> • Faculty Coordinator: <strong>{classInfo?.coordinator}</strong>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Enrolled Scholars</span>
              <span className="text-2xl font-black text-slate-900 font-mono">{students.length}</span>
            </div>
            <div className="border-l border-slate-200 pl-6">
              <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Class Average</span>
              <span className="text-2xl font-black text-blue-600 font-mono">{summary.classAverage}%</span>
            </div>
            <div className="border-l border-slate-200 pl-6">
              <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Target Benchmark</span>
              <span className="text-2xl font-black text-slate-700 font-mono">{classInfo?.targetAvg}%</span>
            </div>
          </div>
        </div>

        {/* Section Breakdown Grid */}
        <div className="mt-8">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Section Cohort Analytics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sectionStats.map((sec) => (
              <div key={sec.section} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">Section {sec.section}</span>
                  <span className="text-xs text-slate-500 font-mono">{sec.total} Scholars</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900 font-mono">{sec.average}%</span>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-emerald-600 block">{sec.onTrack} On Track</span>
                    <span className="text-[11px] font-semibold text-rose-500 block">{sec.critical} Critical</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject-Wise Mastery Table */}
        <div className="mt-8">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Subject Proficiency Ledger</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Subject</th>
                  <th className="p-3 text-center">Average Score</th>
                  <th className="p-3 text-center">Target</th>
                  <th className="p-3 text-center">Variance</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjects.map((sub) => {
                  const variance = Number((sub.average - sub.targetAvg).toFixed(1));
                  const isPositive = variance >= 0;
                  return (
                    <tr key={sub.code} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{sub.name}</td>
                      <td className="p-3 text-center font-mono font-bold">{sub.average}%</td>
                      <td className="p-3 text-center font-mono text-slate-500">{sub.targetAvg}%</td>
                      <td className={`p-3 text-center font-mono font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive ? `+${variance}%` : `${variance}%`}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                          isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isPositive ? 'On Track' : 'Needs Reinforcement'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Honor Roll & Remedial Lists */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Academic Honor Roll (Top 5)</h4>
            </div>
            <div className="space-y-2">
              {topPerformers.map((s, idx) => (
                <div key={s.studentId} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-emerald-700">#{idx + 1}</span>
                    <span className="font-semibold text-slate-800">{s.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({s.section || s.group})</span>
                  </div>
                  <span className="font-bold font-mono text-emerald-600">
                    {s.currentPerformance?.overall?.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/40">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">Targeted Remedial Support</h4>
            </div>
            <div className="space-y-2">
              {criticalScholars.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 italic bg-white rounded-lg border border-rose-100">
                  Zero scholars below 60% threshold in Class {classId}.
                </div>
              ) : (
                criticalScholars.map((s) => (
                  <div key={s.studentId} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-rose-100">
                    <div>
                      <span className="font-semibold text-slate-800">{s.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-2">({s.section || s.group})</span>
                    </div>
                    <span className="font-bold font-mono text-rose-600">
                      {s.currentPerformance?.overall?.value}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Signatures & Accreditation Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="text-center sm:text-left">
            <div className="w-36 border-b border-slate-300 pb-1 mb-1 font-semibold text-slate-700">
              {classInfo?.coordinator}
            </div>
            <p className="text-[11px]">Academic Coordinator</p>
          </div>

          <div className="text-center sm:text-right">
            <div className="w-36 border-b border-slate-300 pb-1 mb-1 font-semibold text-slate-700">
              Dr. R. K. Sharma
            </div>
            <p className="text-[11px]">Principal & Head of School</p>
          </div>
        </div>
      </div>
    </div>
  );
}
