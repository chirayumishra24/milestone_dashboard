import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/50 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-4 print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
          <span>Milestone • Academic Progress & FMS Portal</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            Official records: Class IX (160 students)
          </span>
          <span aria-hidden="true">•</span>
          <span>Other grades use sample data</span>
          <span aria-hidden="true">•</span>
          <span>Last reconciled 22 Sep 2026</span>
        </div>
      </div>
    </footer>
  );
}
