'use client';
import React from 'react';
import { OverallHealthMetrics } from '@/types/academic';
import { Activity, ShieldCheck, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

interface OverallMilestoneHealthProps {
  metrics: OverallHealthMetrics;
  classId?: string;
}

export default function OverallMilestoneHealth({
  metrics,
  classId = 'IX',
}: OverallMilestoneHealthProps) {
  const score = metrics.healthScore || 78;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getHealthStatus = (val: number) => {
    if (val >= 80) return { label: 'Optimal Health', color: 'text-emerald-600', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (val >= 65) return { label: 'Good • On Track', color: 'text-blue-600', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (val >= 50) return { label: 'Moderate Watch', color: 'text-amber-600', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Critical Attention', color: 'text-rose-600', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const status = getHealthStatus(score);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Overall Milestone Health</h3>
              <p className="text-xs text-slate-500">Class {classId} Composite Index</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${status.bg}`}>
            {status.label}
          </span>
        </div>

        {/* Circular Gauge Center */}
        <div className="flex items-center justify-center my-3">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-slate-100"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-blue-600 transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {score}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                out of 100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Metrics Breakdown */}
      <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center justify-between text-slate-600">
          <span className="text-slate-500">Target Progress</span>
          <span className="font-bold text-slate-800">{metrics.targetProgress || 82}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${metrics.targetProgress || 82}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-slate-600 pt-1">
          <span className="text-slate-500">Students on Track</span>
          <span className="font-bold text-slate-800">{metrics.studentsOnTrackPct || 74}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${metrics.studentsOnTrackPct || 74}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-slate-600 pt-1">
          <span className="text-slate-500">FMS Governance Sync</span>
          <span className="font-bold text-slate-800">{metrics.fmsCompletionPct || 86}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full"
            style={{ width: `${metrics.fmsCompletionPct || 86}%` }}
          />
        </div>
      </div>
    </div>
  );
}
