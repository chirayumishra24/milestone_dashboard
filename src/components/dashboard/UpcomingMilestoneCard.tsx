'use client';
import React from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface UpcomingMilestoneCardProps {
  /** ISO date (YYYY-MM-DD) the milestone starts; the countdown is calculated from it */
  startDate: string;
  title: string;
  dateRange: string;
  targetAvg: number;
  currentAvg: number;
  studentsOnTrack: number;
  needAttention: number;
}

export default function UpcomingMilestoneCard({
  startDate,
  title,
  dateRange,
  targetAvg,
  currentAvg,
  studentsOnTrack,
  needAttention,
}: UpcomingMilestoneCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((new Date(`${startDate}T00:00:00`).getTime() - today.getTime()) / 86_400_000);
  const gap = Math.round((currentAvg - targetAvg) * 10) / 10;
  const isAhead = gap >= 0;

  return (
    <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between h-full relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" /> Next Critical Gate
          </span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
            {daysLeft > 0 ? `${daysLeft} Days Remaining` : 'Underway'}
          </span>
        </div>

        <h3 className="text-lg font-bold tracking-tight text-white mb-1">
          {title}
        </h3>
        <p className="text-xs text-slate-300 flex items-center gap-1.5 mb-5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {dateRange}
        </p>

        {/* Readiness Targets */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Cohort Target Benchmark</span>
            <span className="font-bold text-white font-mono text-sm">{targetAvg}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Current Pacing Average</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white font-mono text-sm">{currentAvg}%</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  isAhead ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {isAhead ? `+${gap}%` : `${gap}%`}
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"
              style={{ width: `${Math.min((currentAvg / (targetAvg || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cohort breakdown footer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span><strong>{studentsOnTrack}</strong> On Track</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-300">
          <AlertCircle className="w-4 h-4" />
          <span><strong>{needAttention}</strong> Remedial Needed</span>
        </div>
      </div>
    </div>
  );
}
