'use client';
import React, { useState } from 'react';
import { Settings, Save, Check, RefreshCw, Database, Shield, Sliders } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [minTarget, setMinTarget] = useState(80);
  const [criticalThreshold, setCriticalThreshold] = useState(60);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Academic Milestone Configuration
            </h1>
            <p className="text-xs text-slate-500">
              Configure baseline thresholds, CBSE pass criteria, and cloud synchronization
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved!' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" /> Performance Thresholds
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                School Benchmark Target Overall (%)
              </label>
              <input
                type="number"
                value={minTarget}
                onChange={(e) => setMinTarget(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400">Class IX default is 80%</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Critical Alert Cutoff (%)
              </label>
              <input
                type="number"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400">Students below this trigger critical priority flags</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" /> Data Source Integration
          </h3>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block">Master FMS Excel & Google Sheet</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                New Class IX FMS CCWS 26-27.xlsx • 160 records synced
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Firebase Firestore Cloud Sync</span>
                <span className="text-[11px] text-emerald-600 font-semibold block">Connected & Polling</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
