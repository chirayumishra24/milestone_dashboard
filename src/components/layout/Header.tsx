'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Calendar,
  ChevronRight,
  GraduationCap,
  Building,
} from 'lucide-react';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { StudentRecord } from '@/types/academic';
import StudentProfileDrawer from '@/components/dashboard/StudentProfileDrawer';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [searchPool, setSearchPool] = useState<StudentRecord[]>([]);
  const [searchResults, setSearchResults] = useState<StudentRecord[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

    if (val.trim().length > 0) {
      const q = val.toLowerCase();
      const pool = await loadSearchPool();
      const matches = pool.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.enrollmentNumber || '').toLowerCase().includes(q) ||
          (s.section || s.group || '').toLowerCase().includes(q)
      ).slice(0, 6);
      setSearchResults(matches);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelectStudent = (s: StudentRecord) => {
    setSelectedStudent(s);
    setDrawerOpen(true);
    setShowDropdown(false);
    setQuery('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('global-search-input');
        input?.focus();
      }
      if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
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

  const classMatch = pathname?.match(/\/classes\/([A-Za-z0-9]+)/);
  const activeGrade =
    pathname === '/overview' || pathname === '/reports/consolidated'
      ? 'ALL'
      : classMatch
      ? classMatch[1].toUpperCase()
      : 'IX';

  let breadcrumbTitle = 'Whole-School Cockpit';
  if (pathname === '/overview') breadcrumbTitle = 'Whole-School Cockpit';
  else if (pathname === '/reports/consolidated') breadcrumbTitle = 'Consolidated Report Card';
  else if (pathname?.includes('/students')) breadcrumbTitle = `Class ${activeGrade} > Student Directory`;
  else if (pathname?.includes('/reports')) breadcrumbTitle = `Class ${activeGrade} > Report Card`;
  else if (pathname?.startsWith('/classes/')) breadcrumbTitle = `Class ${activeGrade} > Overview`;
  else if (pathname?.startsWith('/student-milestone/')) breadcrumbTitle = `Class IX > ${pathname.split('/').pop()?.toUpperCase()}`;

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 transition-shadow">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Breadcrumbs & Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium whitespace-nowrap">
            <Link href="/overview" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>CPS</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="font-semibold text-slate-800">{breadcrumbTitle}</span>
          </div>

          <div ref={searchContainerRef} className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="global-search-input"
              type="text"
              value={query}
              onChange={handleSearchChange}
              onFocus={() => {
                if (query.trim().length > 0) setShowDropdown(true);
              }}
              placeholder="Search student, enrollment, or section (Press ⌘K)..."
              className="w-full pl-9 pr-14 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200/80 px-1.5 py-0.5 rounded border border-slate-300">
              ⌘K
            </kbd>

            {/* Floating Live Autocomplete Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  <span>Matching Students ({searchResults.length})</span>
                  <span>ESC to close</span>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {searchResults.map((s) => {
                    const score = s.currentPerformance?.overall?.value ?? 0;
                    return (
                      <button
                        key={s.studentId}
                        onClick={() => handleSelectStudent(s)}
                        className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-blue-50/50 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {s.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {s.enrollmentNumber || s.studentId} • {s.class} {s.section || s.group}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-slate-700">
                            {score}%
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </button>
                    );
                  })}

                  {searchResults.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-400 italic">
                      No matching students found for "{query}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Grade Cohort Switcher, Academic Session, Sync Button & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Grade / Cohort Selector */}
          <div className="flex items-center gap-1.5 bg-blue-50/80 px-2.5 py-1.5 rounded-xl border border-blue-200/80 text-xs font-medium text-blue-900">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={activeGrade}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'ALL') router.push('/overview');
                else router.push(`/classes/${val}`);
              }}
              aria-label="Select Grade Cohort"
              className="bg-transparent border-none text-xs font-bold text-blue-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Grades (Whole School)</option>
              <option value="VI">Class VI Cohort</option>
              <option value="VII">Class VII Cohort</option>
              <option value="VIII">Class VIII Cohort</option>
              <option value="IX">Class IX Cohort (Live)</option>
              <option value="X">Class X Cohort</option>
              <option value="XI">Class XI Cohort</option>
              <option value="XII">Class XII Cohort</option>
            </select>
          </div>

          {/* Academic Session (only the active session has data) */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>AY 2026 – 27</span>
          </div>
        </div>
      </div>

      {/* Slide-over Profile Drawer triggered from Search */}
      <StudentProfileDrawer
        student={selectedStudent}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </header>
  );
}
