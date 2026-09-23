'use client';
import React, { useEffect, useState } from 'react';
import { Settings, Save, RotateCcw, Database, Sliders, AlertCircle } from 'lucide-react';
import PageHeader, { headerActionClass } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/Toast';
import {
  DEFAULT_THRESHOLDS,
  StatusThresholds,
  getStatusThresholds,
  resetStatusThresholds,
  saveStatusThresholds,
  validateThresholds,
} from '@/utils/statusEngine';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';

const FIELDS: { key: keyof StatusThresholds; label: string; hint: string }[] = [
  {
    key: 'defaultTarget',
    label: 'Default Target (%)',
    hint: 'Used for students who have no individual target recorded',
  },
  {
    key: 'onTrackCutoff',
    label: 'On-Track Cutoff (%)',
    hint: 'Students scoring at or above this, but below their target, are On Track',
  },
  {
    key: 'criticalCutoff',
    label: 'Critical Cutoff (%)',
    hint: 'Students scoring below this are Critical; between the two cutoffs is At Risk',
  },
];

export default function SettingsPage() {
  const [values, setValues] = useState<StatusThresholds>(DEFAULT_THRESHOLDS);
  const { showToast } = useToast();

  // Thresholds live in localStorage, so read them after mount
  useEffect(() => {
    setValues(getStatusThresholds());
  }, []);

  const error = validateThresholds(values);

  const updateField = (key: keyof StatusThresholds, raw: string) => {
    setValues((prev) => ({ ...prev, [key]: raw === '' ? NaN : Number(raw) }));
  };

  const handleSave = () => {
    if (error) return;
    saveStatusThresholds(values);
    showToast('Settings saved. Dashboards now use the new cutoffs.');
  };

  const handleResetThresholds = () => {
    setValues(resetStatusThresholds());
    showToast('Cutoffs restored to their defaults');
  };

  const handleResetData = () => {
    const confirmed = window.confirm(
      'Discard all changes saved in this browser (intervention moves, workflow updates) and restore the original data?'
    );
    if (!confirmed) return;
    schoolMilestoneApi.resetLocalData();
    showToast('Local changes discarded. Original data restored.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Status cutoffs used by every dashboard, filter, report and export"
        actions={
          <button
            type="button"
            onClick={handleSave}
            disabled={!!error}
            className={`${headerActionClass.primary} disabled:bg-slate-300 disabled:cursor-not-allowed`}
          >
            <Save className="w-4 h-4" aria-hidden="true" /> Save Settings
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" /> Status Cutoffs
            </h2>
            <button
              onClick={handleResetThresholds}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restore defaults
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {FIELDS.map((field) => (
              <div key={field.key}>
                <label htmlFor={`setting-${field.key}`} className="font-semibold text-slate-700 block mb-1">
                  {field.label}
                </label>
                <input
                  id={`setting-${field.key}`}
                  type="number"
                  min={0}
                  max={100}
                  value={Number.isNaN(values[field.key]) ? '' : values[field.key]}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-xs text-slate-500">
                  {field.hint} (default {DEFAULT_THRESHOLDS[field.key]}%)
                </span>
              </div>
            ))}
          </div>

          {error && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <p className="text-xs text-slate-500 border-t border-slate-100 pt-3">
            A student who reaches their own target is always counted as Target Met, whatever the cutoffs.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" /> Data Source
          </h2>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block">Master FMS Excel</span>
              <span className="text-xs text-slate-500 block mt-0.5">
                New Class IX FMS CCWS 26-27.xlsx • 160 records bundled with the app
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-800 block">Changes saved in this browser</span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Intervention moves, workflow updates and these settings are stored on this device only.
                </span>
              </div>
              <button
                onClick={handleResetData}
                className="px-3 py-1.5 rounded-lg border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 font-semibold whitespace-nowrap"
              >
                Reset data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
