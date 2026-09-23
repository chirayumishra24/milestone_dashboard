'use client';
import React from 'react';
import { Filter, Users } from 'lucide-react';
import { StatusFilterValue } from '@/utils/statusEngine';

interface GlobalFilterBarProps {
  classId: string;
  totalCount: number;
  /** Section names for the class with their student counts */
  sectionCounts: { id: string; count: number }[];
  selectedSection: string;
  onSectionChange: (section: string) => void;
  selectedStatus: StatusFilterValue;
  onStatusChange: (status: StatusFilterValue) => void;
}

const STATUSES: { id: StatusFilterValue; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'ACHIEVED', label: 'Target Met' },
  { id: 'ON_TRACK', label: 'On Track' },
  { id: 'WATCH', label: 'At Risk' },
  { id: 'CRITICAL', label: 'Critical' },
];

export default function GlobalFilterBar({
  classId,
  totalCount,
  sectionCounts,
  selectedSection,
  onSectionChange,
  selectedStatus,
  onStatusChange,
}: GlobalFilterBarProps) {
  const sections = [
    { id: 'ALL', label: 'All Sections', count: totalCount },
    ...sectionCounts.map((sec) => ({ id: sec.id, label: `${classId} ${sec.id}`, count: sec.count })),
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      <div role="group" aria-label="Filter by section" className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
        <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 mr-1 whitespace-nowrap">
          <Users className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" /> Section
        </span>
        {sections.map((sec) => {
          const isSelected = selectedSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSectionChange(sec.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{sec.label}</span>
              <span
                className={`text-xs px-1.5 rounded-full ${isSelected ? 'bg-blue-700 text-blue-50' : 'bg-white text-slate-600'}`}
              >
                {sec.count}
              </span>
            </button>
          );
        })}
      </div>

      <div role="group" aria-label="Filter by status" className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
        <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 mr-1 whitespace-nowrap">
          <Filter className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" /> Status
        </span>
        {STATUSES.map((st) => {
          const isSelected = selectedStatus === st.id;
          return (
            <button
              key={st.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onStatusChange(st.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isSelected ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {st.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
