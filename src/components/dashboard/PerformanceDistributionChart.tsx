'use client';
import React, { useState } from 'react';
import { PerformanceBucket } from '@/utils/academicCalculations';
import { BarChart3, Users } from 'lucide-react';

interface PerformanceDistributionChartProps {
  buckets: PerformanceBucket[];
}

export default function PerformanceDistributionChart({
  buckets,
}: PerformanceDistributionChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Performance Distribution</h3>
              <p className="text-[11px] text-slate-400">Class IX Grade Bands</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
            Normalized
          </span>
        </div>

        {/* Visual Vertical Bars */}
        <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100">
          {buckets.map((b, idx) => {
            const heightPct = Math.round((b.count / maxCount) * 100);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={b.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Floating tooltip */}
                {isHovered && (
                  <div className="absolute -top-10 px-2 py-1 bg-slate-900 text-white text-[10px] font-semibold rounded-md shadow-lg z-20 whitespace-nowrap">
                    {b.count} Students ({b.percentage}%)
                  </div>
                )}

                {/* Percentage label above bar */}
                <span className="text-[10px] font-bold text-slate-600 mb-1 transition-transform group-hover:scale-110">
                  {b.count}
                </span>

                {/* Bar */}
                <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500 ease-out group-hover:opacity-90"
                    style={{
                      height: `${Math.max(heightPct, 4)}%`,
                      backgroundColor: b.color || '#3B82F6',
                    }}
                  />
                </div>

                {/* Label under bar */}
                <span className="text-[10px] font-semibold text-slate-500 mt-2 truncate w-full text-center">
                  {b.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary insights footer */}
      <div className="mt-3 pt-2 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-blue-600" />
          Median Range: <strong className="text-slate-700">80–89%</strong>
        </span>
        <span className="text-emerald-600 font-semibold">91% Passing Ratio</span>
      </div>
    </div>
  );
}
