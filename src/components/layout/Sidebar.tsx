'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building,
  FileText,
  Users,
  Compass,
  LifeBuoy,
  GitMerge,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Layers,
} from 'lucide-react';

const CLASSES = ['VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Extract active class from pathname if applicable
  const classMatch = pathname?.match(/\/classes\/([A-Za-z0-9]+)/);
  const activeClass = classMatch ? classMatch[1].toUpperCase() : 'IX';

  return (
    <aside
      className={`sticky top-0 h-screen bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 z-30 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Milestone <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h1>
              <p className="text-[11px] text-slate-400 font-medium truncate">Central Public School</p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            collapsed ? 'hidden' : 'block'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {/* Section 1: Executive Cockpit */}
        <div>
          {!collapsed && (
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              School Executive
            </p>
          )}
          <div className="space-y-1">
            <Link
              href="/overview"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative ${
                pathname === '/overview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={collapsed ? 'Whole-School Overview' : undefined}
            >
              <Building className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate flex-1">Whole-School Cockpit</span>}
              {!collapsed && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  All
                </span>
              )}
            </Link>

            <Link
              href="/reports/consolidated"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative ${
                pathname === '/reports/consolidated'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={collapsed ? 'Consolidated Report' : undefined}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate flex-1">Consolidated Report</span>}
            </Link>
          </div>
        </div>

        {/* Section 2: Grade Cohorts */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-1.5 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Grade Cohorts
              </p>
              <span className="text-[10px] text-slate-400 font-mono">VI–XII</span>
            </div>
          )}
          {!collapsed ? (
            <div className="grid grid-cols-4 gap-1.5 px-1">
              {CLASSES.map((cls) => {
                const isClsActive = activeClass === cls && (pathname?.startsWith(`/classes/${cls}`) || (cls === 'IX' && pathname?.startsWith('/student-milestone')));
                return (
                  <Link
                    key={cls}
                    href={`/classes/${cls}`}
                    className={`py-1.5 text-center rounded-lg text-xs font-bold transition-all ${
                      isClsActive
                        ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                        : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {cls}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Link
                href={`/classes/${activeClass}`}
                className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center text-xs font-bold"
                title={`Active: Class ${activeClass}`}
              >
                {activeClass}
              </Link>
            </div>
          )}
        </div>

        {/* Section 3: Active Class Tools */}
        <div>
          {!collapsed && (
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Class {activeClass} Tools
            </p>
          )}
          <div className="space-y-1">
            <Link
              href={`/classes/${activeClass}`}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative ${
                pathname === `/classes/${activeClass}` || pathname === '/student-milestone/dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={collapsed ? `Class ${activeClass} Overview` : undefined}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate flex-1">Overview</span>}
            </Link>

            <Link
              href={`/classes/${activeClass}/students`}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative ${
                pathname?.includes('/students')
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={collapsed ? 'Class Directory' : undefined}
            >
              <Users className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate flex-1">Class Directory</span>}
              {!collapsed && activeClass === 'IX' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  160
                </span>
              )}
            </Link>

            <Link
              href={`/classes/${activeClass}/reports`}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative ${
                pathname?.includes(`/classes/${activeClass}/reports`)
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={collapsed ? 'Class Report' : undefined}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate flex-1">Class Report</span>}
            </Link>

            <Link
              href="/student-milestone/milestones"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative ${
                pathname === '/student-milestone/milestones'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={collapsed ? 'Milestones' : undefined}
            >
              <Compass className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate flex-1">Milestone Journey</span>}
            </Link>

            <Link
              href="/student-milestone/interventions"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative ${
                pathname === '/student-milestone/interventions'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={collapsed ? 'Interventions' : undefined}
            >
              <LifeBuoy className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate flex-1">Interventions</span>}
            </Link>

            <Link
              href="/student-milestone/workflow"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative ${
                pathname === '/student-milestone/workflow'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={collapsed ? 'FMS Workflow' : undefined}
            >
              <GitMerge className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate flex-1">FMS Workflow</span>}
            </Link>

            <Link
              href="/student-milestone/settings"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative ${
                pathname === '/student-milestone/settings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={collapsed ? 'Settings' : undefined}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate flex-1">Settings</span>}
            </Link>
          </div>
        </div>
      </nav>

      {/* Collapse button on collapsed view */}
      {collapsed && (
        <div className="p-3 border-t border-slate-800 flex justify-center">
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Database sync status pill */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-400">Live Academic Ledger</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">1,170 Scholars • Grades VI–XII</p>
          <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-400" /> CBSE Compliant
            </span>
            <span>AY 26–27</span>
          </div>
        </div>
      )}
    </aside>
  );
}
