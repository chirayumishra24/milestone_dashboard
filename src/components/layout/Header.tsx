'use client';
import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Download,
  Bell,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  onSearchQueryChange?: (q: string) => void;
}

export default function Header({
  selectedYear,
  onYearChange,
  onSearchQueryChange,
}: HeaderProps) {
  const [query, setQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (onSearchQueryChange) {
      onSearchQueryChange(val);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('global-search-input');
        input?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 transition-shadow">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Global Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search student, enrollment, or subject (Press ⌘K)..."
            className="w-full pl-9 pr-14 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200/80 px-1.5 py-0.5 rounded border border-slate-300">
            ⌘K
          </kbd>
        </div>

        {/* Right: Academic Session, Sync Button & Actions */}
        <div className="flex items-center gap-3">
          {/* Academic Session Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="2026 – 27">AY 2026 – 27 (Class IX)</option>
              <option value="2025 – 26">AY 2025 – 26 (Archived)</option>
            </select>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
            title="Refresh Ledger Cache"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Notification Indicator */}
          <button className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200/70 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
