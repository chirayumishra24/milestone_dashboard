'use client';
import React, { useEffect, useState } from 'react';
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
  X,
  type LucideIcon,
} from 'lucide-react';

export const CLASSES = ['VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Exact match only (for index routes like /classes/IX) */
  exact?: boolean;
}

const SCHOOL_NAV: NavItem[] = [
  { href: '/overview', label: 'Whole-School Cockpit', icon: Building, exact: true },
  { href: '/reports/consolidated', label: 'Consolidated Report', icon: FileText, exact: true },
];

const classNav = (classId: string): NavItem[] => [
  { href: `/classes/${classId}`, label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: `/classes/${classId}/students`, label: 'Student Directory', icon: Users },
  { href: `/classes/${classId}/reports`, label: 'Class Report', icon: FileText },
  { href: `/classes/${classId}/milestones`, label: 'Milestone Journey', icon: Compass },
  { href: `/classes/${classId}/interventions`, label: 'Interventions', icon: LifeBuoy },
  { href: `/classes/${classId}/workflow`, label: 'Exam Workflow', icon: GitMerge },
];

const SYSTEM_NAV: NavItem[] = [{ href: '/settings', label: 'Settings', icon: Settings, exact: true }];

interface SidebarProps {
  /** Mobile drawer state, owned by the app shell */
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname() || '';
  const [collapsed, setCollapsed] = useState(false);

  const classMatch = pathname.match(/^\/classes\/([A-Za-z0-9]+)/);
  const activeClass = classMatch ? classMatch[1].toUpperCase() : 'IX';

  // Close the mobile drawer after navigating, and on Escape
  useEffect(() => {
    onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onMobileClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, onMobileClose]);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  // The mobile drawer always shows labels; only the desktop rail collapses
  const renderNav = (showLabels: boolean) => {
    const renderItem = (item: NavItem) => {
      const active = isActive(item);
      const Icon = item.icon;
      return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active ? 'page' : undefined}
          title={showLabels ? undefined : item.label}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            active
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
          } ${showLabels ? '' : 'justify-center'}`}
        >
          <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {showLabels ? <span className="truncate">{item.label}</span> : <span className="sr-only">{item.label}</span>}
        </Link>
      );
    };

    const sectionTitle = (text: string) =>
      showLabels ? (
        <p className="px-3 pb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">{text}</p>
      ) : null;

    return (
      <nav aria-label="Main" className="flex-1 p-3 space-y-5 overflow-y-auto">
        <div>
          {sectionTitle('School')}
          <div className="space-y-1">{SCHOOL_NAV.map(renderItem)}</div>
        </div>

        <div>
          {sectionTitle('Grades')}
          {showLabels ? (
            <div className="grid grid-cols-4 gap-1.5 px-1">
              {CLASSES.map((cls) => {
                const active = activeClass === cls && pathname.startsWith(`/classes/${cls}`);
                return (
                  <Link
                    key={cls}
                    href={`/classes/${cls}`}
                    aria-current={active ? 'page' : undefined}
                    aria-label={`Class ${cls}`}
                    className={`py-1.5 text-center rounded-lg text-xs font-bold transition-colors ${
                      active
                        ? 'bg-indigo-600 text-white ring-1 ring-indigo-400'
                        : 'bg-slate-800/70 text-slate-200 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {cls}
                  </Link>
                );
              })}
            </div>
          ) : (
            <Link
              href={`/classes/${activeClass}`}
              title={`Class ${activeClass}`}
              className="mx-auto w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 flex items-center justify-center text-xs font-bold"
            >
              {activeClass}
            </Link>
          )}
        </div>

        <div>
          {sectionTitle(`Class ${activeClass}`)}
          <div className="space-y-1">{classNav(activeClass).map(renderItem)}</div>
        </div>

        <div>
          {sectionTitle('System')}
          <div className="space-y-1">{SYSTEM_NAV.map(renderItem)}</div>
        </div>
      </nav>
    );
  };

  const brand = (showLabels: boolean) => (
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
        <GraduationCap className="w-5 h-5" aria-hidden="true" />
      </div>
      {showLabels && (
        <div className="truncate">
          <p className="text-sm font-bold tracking-tight text-white">Milestone</p>
          <p className="text-xs text-slate-400 font-medium truncate">Central Public School</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={`hidden lg:flex sticky top-0 h-screen bg-slate-900 text-slate-200 border-r border-slate-800 transition-[width] duration-300 z-30 flex-col print:hidden ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`h-16 px-4 flex items-center border-b border-slate-800 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {brand(!collapsed)}
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
        {renderNav(!collapsed)}
        {collapsed && (
          <div className="p-3 border-t border-slate-800 flex justify-center">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
        {!collapsed && (
          <p className="m-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400">
            Grades VI–XII • AY 2026–27
          </p>
        )}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 print:hidden">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onMobileClose} aria-hidden="true" />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 text-slate-200 flex flex-col shadow-2xl"
          >
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
              {brand(true)}
              <button
                type="button"
                onClick={onMobileClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Close navigation"
                autoFocus
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            {renderNav(true)}
          </aside>
        </div>
      )}
    </>
  );
}
