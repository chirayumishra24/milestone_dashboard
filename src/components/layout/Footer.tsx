import React from 'react';
import { Database, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/50 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span>Academic Milestone Matrix v2.4 • Class IX (AURA, ZEN, NEO)</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            160 Validated Student Records
          </span>
          <span>•</span>
          <span>CBSE Standards</span>
          <span>•</span>
          <span>Last Reconciled 22 Sep 2026</span>
        </div>
      </div>
    </footer>
  );
}
