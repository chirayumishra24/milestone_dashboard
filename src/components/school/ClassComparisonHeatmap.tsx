'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ClassSummary } from '@/types/academic';
import {
  Layers,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  User,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface ClassComparisonHeatmapProps {
  classes: ClassSummary[];
}

export default function ClassComparisonHeatmap({ classes }: ClassComparisonHeatmapProps) {
  const [sortField, setSortField] = useState<'class' | 'average' | 'gap' | 'onTrack'>('class');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default to highest first
    }
  };

  const sorted = [...classes].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'class') cmp = a.code.localeCompare(b.code);
    else if (sortField === 'average') cmp = a.classAverage - b.classAverage;
    else if (sortField === 'gap') cmp = a.gap - b.gap;
    else if (sortField === 'onTrack') cmp = a.onTrackPct - b.onTrackPct;
    return sortAsc ? cmp : -cmp;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">
                  Inter-Class Academic Comparison Heatmap
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Grades VI – XII
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Cross-grade target pacing and remedial deficit matrix
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Benchmark Met
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Deficit Watch
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/70">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('class')}
                  className="py-3 px-4 cursor-pointer hover:text-blue-600 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Grade Cohort</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3">Sections</th>
                <th className="py-3 px-3">Scholars</th>
                <th
                  onClick={() => handleSort('average')}
                  className="py-3 px-3 cursor-pointer hover:text-blue-600 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Class Avg</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3">Target</th>
                <th
                  onClick={() => handleSort('gap')}
                  className="py-3 px-3 cursor-pointer hover:text-blue-600 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Target Gap</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('onTrack')}
                  className="py-3 px-3 cursor-pointer hover:text-blue-600 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>On Track %</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3">Critical (&lt;60%)</th>
                <th className="py-3 px-3">Active Lifecycle Phase</th>
                <th className="py-3 px-4 text-right">Drill-Down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((c) => {
                const isAhead = c.gap >= 0;

                return (
                  <tr
                    key={c.classId}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        <span>{c.label}</span>
                        {c.dataSource === 'sample' && (
                          <span
                            className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200"
                            title="Generated placeholder roster; no official records imported yet"
                          >
                            Sample
                          </span>
                        )}
                        {c.classId === 'IX' && (
                          <span className="text-xs font-extrabold px-1.5 py-0.2 rounded bg-blue-600 text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3" />
                        {c.coordinator}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {c.sections.map((sec) => (
                          <span
                            key={sec}
                            className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-semibold"
                          >
                            {sec}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-700 font-mono">
                      {c.totalStudents}
                    </td>

                    <td className="py-3 px-3 font-bold font-mono text-slate-900 text-sm">
                      {c.classAverage}%
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-500">
                      {c.targetAvg}%
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          isAhead
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {isAhead ? `+${c.gap}%` : `${c.gap}%`}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 font-mono">
                          {c.onTrackPct}%
                        </span>
                        <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${c.onTrackPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-xs font-bold font-mono ${
                          c.criticalCount > 10 ? 'text-rose-600' : 'text-slate-600'
                        }`}
                      >
                        {c.criticalCount} students
                      </span>
                    </td>

                    <td className="py-3 px-3 text-xs text-slate-600 max-w-[170px] truncate">
                      {c.milestoneStatus}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/classes/${c.classId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold shadow-2xs transition-all group-hover:border-blue-300"
                      >
                        <span>Open</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Click 'Open' on any row to drill down into section breakdowns, individual rosters, and subject diagnostics</span>
        <span className="font-semibold text-slate-600">7 Active Grade Cohorts</span>
      </div>
    </div>
  );
}
