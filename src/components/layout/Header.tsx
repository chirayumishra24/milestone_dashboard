'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Calendar, ChevronRight, GraduationCap, Building, Menu } from 'lucide-react';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { StudentRecord } from '@/types/academic';
import StudentProfileDrawer from '@/components/dashboard/StudentProfileDrawer';
import StatusBadge from '@/components/ui/StatusBadge';
import { getStudentStatus } from '@/utils/statusEngine';
import { CLASSES } from './Sidebar';

const CLASS_PAGE_LABELS: Record<string, string> = {
  students: 'Student Directory',
  reports: 'Class Report',
  milestones: 'Milestone Journey',
  interventions: 'Interventions',
  workflow: 'Exam Workflow',
};

interface Crumb {
  label: string;
  href?: string;
}

function buildBreadcrumbs(pathname: string): Crumb[] {
  if (pathname === '/overview') return [{ label: 'Whole-School Cockpit' }];
  if (pathname === '/reports/consolidated') return [{ label: 'Consolidated Report' }];
  if (pathname === '/settings') return [{ label: 'Settings' }];

  const [, , classId, page, studentId] = pathname.split('/');
  if (pathname.startsWith('/classes/') && classId) {
    const crumbs: Crumb[] = [{ label: `Class ${classId.toUpperCase()}`, href: page ? `/classes/${classId}` : undefined }];
    if (page) crumbs.push({ label: CLASS_PAGE_LABELS[page] ?? page, href: studentId ? `/classes/${classId}/${page}` : undefined });
    if (studentId) crumbs.push({ label: 'Profile' });
    return crumbs;
  }
  return [];
}

interface HeaderProps {
  onOpenNav: () => void;
}

export default function Header({ onOpenNav }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const [query, setQuery] = useState('');
  const [searchPool, setSearchPool] = useState<StudentRecord[]>([]);
  const [searchResults, setSearchResults] = useState<StudentRecord[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load every roster through the API service so search covers all grades and sees saved edits
  const loadSearchPool = async (): Promise<StudentRecord[]> => {
    if (searchPool.length) return searchPool;
    const students = await schoolMilestoneApi.getAllStudents();
    setSearchPool(students);
    return students;
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setHighlighted(0);

    if (val.trim().length > 0) {
      const q = val.toLowerCase();
      const pool = await loadSearchPool();
      const matches = pool
        .filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            (s.enrollmentNumber || '').toLowerCase().includes(q) ||
            (s.section || s.group || '').toLowerCase().includes(q)
        )
        .slice(0, 8);
      setSearchResults(matches);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelectStudent = (s: StudentRecord) => {
    setSelectedStudent(s);
    setShowDropdown(false);
    setQuery('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || searchResults.length === 0) {
      if (e.key === 'Escape') setShowDropdown(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => (i - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelectStudent(searchResults[highlighted]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const classMatch = pathname.match(/^\/classes\/([A-Za-z0-9]+)(?:\/([a-z]+))?/);
  const activeGrade = classMatch ? classMatch[1].toUpperCase() : 'ALL';
  const classSubPage = classMatch?.[2];

  // Switching grade keeps the current class page (e.g. directory → directory)
  const switchGrade = (grade: string) => {
    if (grade === 'ALL') router.push('/overview');
    else router.push(classSubPage ? `/classes/${grade}/${classSubPage}` : `/classes/${grade}`);
  };

  const crumbs = buildBreadcrumbs(pathname);
  const listboxId = 'global-search-results';

  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 print:hidden">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={onOpenNav}
            className="lg:hidden p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          <nav aria-label="Breadcrumb" className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 font-medium whitespace-nowrap">
            <Link href="/overview" className="hover:text-blue-700 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>CPS</span>
            </Link>
            {crumbs.map((crumb, idx) => (
              <React.Fragment key={`${crumb.label}-${idx}`}>
                <ChevronRight className="w-3 h-3 text-slate-300" aria-hidden="true" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-blue-700">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-slate-800" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>

          <div ref={searchContainerRef} className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              ref={inputRef}
              id="global-search-input"
              type="text"
              role="combobox"
              aria-label="Search students across all grades"
              aria-expanded={showDropdown}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={showDropdown && searchResults.length ? `search-option-${highlighted}` : undefined}
              value={query}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => {
                if (query.trim().length > 0) setShowDropdown(true);
              }}
              placeholder="Search students…"
              className="w-full pl-9 pr-12 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-500 text-slate-800"
            />
            <kbd className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 bg-slate-100 px-1.5 rounded border border-slate-300">
              ⌘K
            </kbd>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-[26rem] mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50">
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>{searchResults.length ? `${searchResults.length} matching students` : 'No matches'}</span>
                  <span className="hidden sm:inline">↑↓ to move • Enter to open • Esc to close</span>
                </div>
                <ul id={listboxId} role="listbox" aria-label="Matching students" className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.map((s, idx) => (
                    <li
                      key={s.studentId}
                      id={`search-option-${idx}`}
                      role="option"
                      aria-selected={idx === highlighted}
                      onMouseEnter={() => setHighlighted(idx)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectStudent(s)}
                      className={`px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer ${
                        idx === highlighted ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-800 truncate">{s.name}</div>
                        <div className="text-xs text-slate-500 font-mono truncate">
                          Class {s.class} {s.section || s.group} • {s.enrollmentNumber || s.studentId}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold font-mono text-slate-700">
                          {s.currentPerformance?.overall?.value ?? 0}%
                        </span>
                        <StatusBadge status={getStudentStatus(s).status} />
                      </div>
                    </li>
                  ))}
                  {searchResults.length === 0 && (
                    <li className="p-4 text-center text-sm text-slate-500">No students match “{query}”.</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 bg-blue-50/80 px-2.5 py-1.5 rounded-xl border border-blue-200/80">
            <GraduationCap className="w-4 h-4 text-blue-700" aria-hidden="true" />
            <span className="sr-only">Grade</span>
            <select
              value={activeGrade}
              onChange={(e) => switchGrade(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-blue-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Whole School</option>
              {CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </label>

          <div className="hidden md:flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>AY 2026 – 27</span>
          </div>
        </div>
      </div>

      <StudentProfileDrawer
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </header>
  );
}
