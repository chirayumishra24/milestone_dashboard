'use client';
import React from 'react';
import { Filter, Users, Layers, Award, AlertTriangle, Flame, Compass, Box } from 'lucide-react';

export type SectionFilter = 'ALL' | string;
export type StatusFilter = 'ALL' | 'ACHIEVED' | 'ON_TRACK' | 'WATCH' | 'CRITICAL';
export type ViewTab = 'OVERVIEW' | 'KANBAN';

interface GlobalFilterBarProps {
  selectedSection: SectionFilter;
  onSectionChange: (sec: SectionFilter) => void;
  selectedStatus: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  classId: string;
  totalCount: number;
  /** Section names for the class with their student counts */
  sectionCounts: { id: string; count: number }[];
}

export default function GlobalFilterBar({
  selectedSection,
  onSectionChange,
  selectedStatus,
  onStatusChange,
  activeTab,
  onTabChange,
  classId,
  totalCount,
  sectionCounts,
}: GlobalFilterBarProps) {
  const sections: { id: SectionFilter; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Sections', count: totalCount },
    ...sectionCounts.map((sec) => ({ id: sec.id, label: `${classId} ${sec.id}`, count: sec.count })),
  ];

  const statuses: { id: StatusFilter; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'ALL', label: 'All Tiers', icon: Layers, color: 'text-slate-600' },
    { id: 'ACHIEVED', label: 'Target Met', icon: Award, color: 'text-emerald-600' },
    { id: 'ON_TRACK', label: 'On Track', icon: Flame, color: 'text-blue-600' },
    { id: 'WATCH', label: 'At Risk', icon: AlertTriangle, color: 'text-amber-600' },
    { id: 'CRITICAL', label: 'Critical', icon: AlertTriangle, color: 'text-rose-600' },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-sm space-y-3">
      {/* Top row: Section Pills + View Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Section Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 mr-1.5 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Cohort:</span>
          </div>
          {sections.map((sec) => {
            const isSelected = selectedSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => onSectionChange(sec.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <span>{sec.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-blue-700 text-blue-100' : 'bg-white text-slate-500 shadow-2xs'
                  }`}
                >
                  {sec.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Tabs Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => onTabChange('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'OVERVIEW'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => onTabChange('KANBAN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'KANBAN'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Intervention Board</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Status Filter */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-500" /> Filter:
          </span>
          {statuses.map((st) => {
            const isSelected = selectedStatus === st.id;
            return (
              <button
                key={st.id}
                onClick={() => onStatusChange(st.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
