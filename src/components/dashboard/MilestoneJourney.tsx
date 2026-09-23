'use client';
import React, { useState } from 'react';
import { Milestone } from '@/types/academic';
import { CheckCircle2, Clock, Calendar, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';

interface MilestoneJourneyProps {
  milestones: Milestone[];
  onSelectMilestone?: (milestone: Milestone) => void;
}

export default function MilestoneJourney({
  milestones,
  onSelectMilestone,
}: MilestoneJourneyProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Academic Milestone Journey
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              CBSE Annual Timeline
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Progressive target tracking across Class IX exam gates (2026–27)
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span> Active Gate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Upcoming
          </span>
        </div>
      </div>

      {/* Stepper Grid (3 columns x 2 rows for 6 milestones) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {milestones.map((m, idx) => {
          const isCompleted = m.status === 'completed';
          const isCurrent = m.status === 'current';
          const isSelected = selectedId === m.id;

          return (
            <div
              key={m.id}
              onClick={() => {
                setSelectedId(m.id);
                if (onSelectMilestone) onSelectMilestone(m);
              }}
              className={`rounded-xl p-4 cursor-pointer transition-all duration-300 border flex flex-col justify-between ${
                isSelected
                  ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-50/50 shadow-md'
                  : isCurrent
                  ? 'border-blue-300 bg-gradient-to-b from-blue-50/70 to-white shadow-sm ring-1 ring-blue-200'
                  : isCompleted
                  ? 'border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/60'
              }`}
            >
              <div>
                {/* Node badge & stage label */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/40 animate-pulse'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap truncate">
                      {m.stageLabel}
                    </span>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs flex items-center gap-1 flex-shrink-0">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" /> Active
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex-shrink-0">
                      Vetted
                    </span>
                  )}
                </div>

                {/* Milestone Title */}
                <h3 className="text-sm font-bold text-slate-800 truncate mb-1">
                  {m.name}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-3 truncate">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{m.dateRange}</span>
                </div>
              </div>

              {/* Target vs Actual Stats */}
              <div className="bg-white/90 rounded-lg p-2.5 border border-slate-200/70 text-xs space-y-1.5 shadow-2xs mt-auto">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">School Target</span>
                  <span className="font-bold text-slate-800">{m.targetAvg}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Class Actual</span>
                  {m.actualAvg !== undefined ? (
                    <span className={`font-bold ${m.actualAvg >= m.targetAvg ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {m.actualAvg}% ({m.actualAvg >= m.targetAvg ? `+${(m.actualAvg - m.targetAvg).toFixed(1)}%` : `${(m.actualAvg - m.targetAvg).toFixed(1)}%`})
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium italic">Pending Exam</span>
                  )}
                </div>

                {/* Students on track pill */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">On Track:</span>
                  <span className="font-semibold text-blue-700">
                    {m.studentsOnTrackCount} / {m.totalStudents} ({Math.round((m.studentsOnTrackCount / (m.totalStudents || 1)) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
