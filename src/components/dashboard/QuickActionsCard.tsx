'use client';
import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  PlusCircle,
  RefreshCw,
  Sparkles,
  LifeBuoy,
  Check,
} from 'lucide-react';

export default function QuickActionsCard() {
  const [downloaded, setDownloaded] = useState(false);
  const [synced, setSynced] = useState(false);

  const handleExport = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleSync = () => {
    setSynced(true);
    setTimeout(() => setSynced(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Executive Quick Actions</h3>
            <p className="text-[11px] text-slate-400">Ledger Management & Tools</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                  Export Class IX Report Card
                </h4>
                <p className="text-[11px] text-slate-400">160 Students • All 6 Subjects</p>
              </div>
            </div>
            {downloaded ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Downloaded
              </span>
            ) : (
              <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            )}
          </button>

          <button
            onClick={handleSync}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <RefreshCw className={`w-4 h-4 ${synced ? 'animate-spin text-blue-600' : ''}`} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                  Re-sync Master FMS Sheet
                </h4>
                <p className="text-[11px] text-slate-400">Connect Google Sheets v4 API</p>
              </div>
            </div>
            {synced ? (
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Synced
              </span>
            ) : (
              <RefreshCw className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            )}
          </button>

          <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50 hover:bg-purple-50/50 transition-all text-left group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                  Trigger Remedial Notification
                </h4>
                <p className="text-[11px] text-slate-400">Notify 27 Subject Mentors</p>
              </div>
            </div>
            <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </button>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        Encrypted Ledger • CBSE Reg 2026-27
      </div>
    </div>
  );
}
