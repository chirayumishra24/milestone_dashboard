'use client';
import React, { useState } from 'react';
import { StudentRecord } from '@/types/academic';
import { calculateSubjectSummary, SubjectMetric } from '@/utils/academicCalculations';
import { Target, TrendingUp, TrendingDown, Info, HelpCircle } from 'lucide-react';

interface TargetVsActualChartProps {
  students: StudentRecord[];
}

export default function TargetVsActualChart({ students }: TargetVsActualChartProps) {
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);
  const subjects: SubjectMetric[] = calculateSubjectSummary(students);
  const assessed = subjects.filter((s) => s.average > 0);
  const highest = assessed.reduce<SubjectMetric | null>((best, s) => (!best || s.average > best.average ? s : best), null);
  const largestGap = assessed.reduce<SubjectMetric | null>((worst, s) => (!worst || s.gap < worst.gap ? s : worst), null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Target vs Actual Delta</h3>
              <p className="text-xs text-slate-500">Class Average vs School Benchmark</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            Dumbbell Metric
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-500 my-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
            <span>Class Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-amber-500 bg-white"></span>
            <span>Target Benchmark</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto text-xs text-slate-500">
            <span>Scale: 0 – 100%</span>
          </div>
        </div>

        {/* Dumbbell Chart Rows */}
        <div className="space-y-4 pt-1">
          {subjects.map((subj) => {
            const gap = Math.round((subj.average - subj.targetAvg) * 10) / 10;
            const isAhead = gap >= 0;
            const isHovered = hoveredSubject === subj.key;

            return (
              <div
                key={subj.key}
                onMouseEnter={() => setHoveredSubject(subj.key)}
                onMouseLeave={() => setHoveredSubject(null)}
                className={`p-2 rounded-xl transition-all ${
                  isHovered ? 'bg-slate-50 ring-1 ring-slate-200' : ''
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: subj.color }}
                    />
                    {subj.name}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-600 font-semibold">{subj.average}%</span>
                    <span className="text-slate-500 font-normal">/ {subj.targetAvg}%</span>
                    <span
                      className={`text-xs font-bold px-1.5 py-0.2 rounded ${
                        isAhead
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isAhead ? `+${gap}%` : `${gap}%`}
                    </span>
                  </div>
                </div>

                {/* Dumbbell Graphic Track */}
                <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-visible flex items-center">
                  {/* Actual filled bar */}
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(subj.average, 100)}%`,
                      backgroundColor: isAhead ? '#10B981' : '#3B82F6',
                      opacity: 0.85,
                    }}
                  />

                  {/* Target Goal Marker (Dumbbell Dot) */}
                  <div
                    className="absolute -translate-x-1/2 w-4 h-4 rounded-full border-2 border-amber-500 bg-white shadow-sm z-10 flex items-center justify-center transition-all"
                    style={{ left: `${Math.min(subj.targetAvg, 100)}%` }}
                    title={`Target: ${subj.targetAvg}%`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
        <span>{highest ? `Highest: ${highest.name} (${highest.average}%)` : 'No subject scores yet'}</span>
        {largestGap && largestGap.gap < 0 && (
          <span className="text-rose-600 font-semibold">
            Priority Gap: {largestGap.name} ({largestGap.gap}%)
          </span>
        )}
      </div>
    </div>
  );
}
