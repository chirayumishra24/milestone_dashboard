'use client';
import React from 'react';
import { useApiData } from '@/hooks/useApiData';
import { ErrorState, LoadingState } from '@/components/ui/PageStatus';
import Link from 'next/link';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { downloadCsv } from '@/utils/csv';
import { SchoolConsolidatedReport } from '@/types/academic';
import {
  FileText,
  Printer,
  Download,
  Building2,
  ShieldCheck,
  Award,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function ConsolidatedReportPage() {
  const { data: report, isLoading, error, reload } = useApiData(() => schoolMilestoneApi.getSchoolConsolidatedReport(), []);

  if (error) return <ErrorState onRetry={reload} />;
  if (isLoading || !report) return <LoadingState message="Generating Consolidated School Report..." />;

  const exportCSV = () => {
    const headers = ['Grade', 'Coordinator', 'Students', 'Class Avg %', 'Target %', 'Gap %', 'On Track %', 'Critical Count', 'Status'];
    const rows = report.overview.classes.map((c) => [
      c.label,
      c.coordinator,
      c.totalStudents,
      c.classAverage,
      c.targetAvg,
      c.gap,
      c.onTrackPct,
      c.criticalCount,
      c.milestoneStatus,
    ]);

    downloadCsv(`School_Consolidated_Academic_Report_${report.academicSession.replace(/\s+/g, '_')}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Action Bar */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/overview"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to School Executive Cockpit
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Audit</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print School Dossier (PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Formal Document Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-800 flex items-center justify-center text-white shadow-lg">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {report.schoolName}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Annual Consolidated Academic Milestone Audit • CBSE Affiliation: <span className="font-mono text-slate-700">{report.affiliationNo}</span>
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div className="font-bold text-slate-900">{report.academicSession}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Issued: {report.generatedDate}</div>
          </div>
        </div>

        {/* Executive Narrative Summary */}
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-blue-900 font-bold uppercase tracking-wider text-[11px]">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Academic Committee Executive Assessment</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            {report.executiveSummary}
          </p>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase block">Total Scholars</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{report.overview.totalSchoolStudents}</span>
            <span className="text-[10px] text-slate-500">Grades VI – XII</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase block">School Average</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{report.overview.overallSchoolAverage}%</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Tgt: {report.overview.schoolTargetAverage}%</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase block">On-Track Compliance</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{report.overview.studentsOnTrackPct}%</span>
            <span className="text-[10px] text-slate-500">{report.overview.studentsOnTrackCount} Students</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase block">Composite Health</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block">{report.overview.schoolHealthIndex}</span>
            <span className="text-[10px] text-slate-500">Out of 100</span>
          </div>
        </div>

        {/* Grade-by-Grade Performance Audit Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
            <span>Grade-Wise Assessment Breakdown</span>
            <span className="text-[11px] text-slate-400 font-normal">7 Grade Cohorts</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Grade Level</th>
                  <th className="py-2.5 px-3">Enrolled</th>
                  <th className="py-2.5 px-3">Class Actual</th>
                  <th className="py-2.5 px-3">Target Benchmark</th>
                  <th className="py-2.5 px-3">Delta Gap</th>
                  <th className="py-2.5 px-3">On-Track Ratio</th>
                  <th className="py-2.5 px-3">Critical (&lt;60%)</th>
                  <th className="py-2.5 px-3">Faculty Coordinator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.overview.classes.map((c) => {
                  const isAhead = c.gap >= 0;
                  return (
                    <tr key={c.classId} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {c.label}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {c.totalStudents}
                      </td>
                      <td className="py-2.5 px-3 font-bold font-mono text-slate-900">
                        {c.classAverage}%
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {c.targetAvg}%
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-bold font-mono ${
                            isAhead ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isAhead ? `+${c.gap}%` : `${c.gap}%`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-800">
                        {c.onTrackPct}% ({c.onTrackCount})
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-rose-600">
                        {c.criticalCount} ({c.criticalPct}%)
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {c.coordinator}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority Intervention Areas */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Target Remedial Action Directives</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {report.priorityInterventionAreas.map((p) => (
              <div
                key={p.grade + p.subject}
                className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{p.grade}</span>
                  <span className="font-mono font-bold text-rose-600">{p.gap}% Gap</span>
                </div>
                <div className="font-semibold text-amber-900">{p.subject}</div>
                <p className="text-[11px] text-slate-600 leading-normal">{p.actionRequired}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Signatures & Certification Footer */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-8 text-center text-xs text-slate-500">
          <div>
            <div className="h-10 border-b border-dashed border-slate-300 mb-2"></div>
            <span className="font-bold text-slate-800 block">Head of Examination Committee</span>
            <span className="text-[10px]">Academic Records Wing</span>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-300 mb-2"></div>
            <span className="font-bold text-slate-800 block">Vice Principal</span>
            <span className="text-[10px]">Curriculum & Pedagogy</span>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-300 mb-2"></div>
            <span className="font-bold text-slate-800 block">Principal & Director</span>
            <span className="text-[10px]">Central City International School</span>
          </div>
        </div>
      </div>
    </div>
  );
}
