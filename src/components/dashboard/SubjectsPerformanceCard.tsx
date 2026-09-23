'use client';
import React from 'react';
import { SubjectMetric } from '@/utils/academicCalculations';
import { BookOpen, Award, ArrowUp, ArrowDown } from 'lucide-react';

interface SubjectsPerformanceCardProps {
  subjects: SubjectMetric[];
}

export default function SubjectsPerformanceCard({
  subjects,
}: SubjectsPerformanceCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Subject Diagnostics</h3>
              <p className="text-[11px] text-slate-400">Class IX Core Curriculum</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            6 Subjects
          </span>
        </div>

        {/* Subjects 2x3 Grid */}
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((subj) => {
            const gap = Math.round((subj.average - subj.targetAvg) * 10) / 10;
            const isAhead = gap >= 0;

            return (
              <div
                key={subj.key}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: subj.color || '#3B82F6' }}
                  >
                    {subj.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      isAhead ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isAhead ? `+${gap}%` : `${gap}%`}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800 truncate mb-1">
                  {subj.name}
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {subj.average}%
                  </span>
                  <span className="text-[11px] text-slate-400">Tgt: {subj.targetAvg}%</span>
                </div>

                {/* Min / Max Range */}
                <div className="mt-2 pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="text-emerald-700 font-medium">Max: {subj.highest}%</span>
                  <span className="text-rose-600 font-medium">Min: {subj.lowest}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Highest Class Average: Social Science</span>
        <span>Curriculum Paced</span>
      </div>
    </div>
  );
}
