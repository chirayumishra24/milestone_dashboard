'use client';
import React, { useRef, useState } from 'react';
import { Download, FileUp, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { schoolMilestoneApi } from '@/services/schoolMilestoneApi';
import { useToast } from '@/components/ui/Toast';
import { downloadCsv } from '@/utils/csv';
import { ROSTER_CSV_HEADERS, RosterImportResult, parseRosterCsv, rosterCsvRow } from '@/utils/rosterCsv';

/** Only Class IX has an official roster; other grades use generated sample data */
const IMPORT_CLASS = 'IX';
const MAX_LISTED = 8;

interface Preview extends RosterImportResult {
  fileName: string;
  matchedCount: number;
}

export default function RosterImportCard() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const downloadTemplate = async () => {
    const students = await schoolMilestoneApi.getStudentsByClass(IMPORT_CLASS);
    downloadCsv(
      `Class_${IMPORT_CLASS}_Roster_Template.csv`,
      ROSTER_CSV_HEADERS,
      students.map((s) => rosterCsvRow(s, IMPORT_CLASS))
    );
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setIsWorking(true);
    try {
      const [text, existing, classInfo] = await Promise.all([
        file.text(),
        schoolMilestoneApi.getStudentsByClass(IMPORT_CLASS),
        schoolMilestoneApi.getClassSummary(IMPORT_CLASS),
      ]);
      const result = parseRosterCsv(text, IMPORT_CLASS, classInfo?.sections ?? [], existing, existing[0]?.school ?? '');
      const existingIds = new Set(existing.map((s) => s.studentId));
      setPreview({
        ...result,
        fileName: file.name,
        matchedCount: result.students.filter((s) => existingIds.has(s.studentId)).length,
      });
    } catch (err) {
      console.error('Failed reading roster file:', err);
      showToast('Could not read that file. Make sure it is a CSV.', 'error');
    } finally {
      setIsWorking(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmImport = async () => {
    if (!preview || preview.errors.length || !preview.students.length) return;
    const ok = window.confirm(
      `Replace the Class ${IMPORT_CLASS} roster with ${preview.students.length} students from ${preview.fileName}? ` +
        'This is saved in this browser; "Reset data" restores the original roster.'
    );
    if (!ok) return;
    await schoolMilestoneApi.replaceStudents(preview.students);
    showToast(`Imported ${preview.students.length} students into Class ${IMPORT_CLASS}`);
    setPreview(null);
  };

  const renderList = (items: string[], tone: 'error' | 'warning') => (
    <ul className={`space-y-0.5 text-xs ${tone === 'error' ? 'text-rose-800' : 'text-amber-900'}`}>
      {items.slice(0, MAX_LISTED).map((item, i) => (
        <li key={i}>{item}</li>
      ))}
      {items.length > MAX_LISTED && <li className="font-semibold">…and {items.length - MAX_LISTED} more</li>}
    </ul>
  );

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileUp className="w-4 h-4 text-blue-600" aria-hidden="true" /> Import Class {IMPORT_CLASS} Roster (CSV)
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Use the same columns as the directory export: Name, Section and Score % are required; Roll / Enrollment, Target % and
            subject columns are optional. Students are matched to existing records by roll number, then name, so their interventions
            stay linked.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50"
          >
            <Download className="w-4 h-4" aria-hidden="true" /> Current roster as template
          </button>
          <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer focus-within:ring-2 focus-within:ring-blue-500/40">
            <FileUp className="w-4 h-4" aria-hidden="true" />
            {isWorking ? 'Reading…' : 'Choose CSV file'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
        </div>
      </div>

      {preview && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3" aria-live="polite">
          <p className="text-sm text-slate-800">
            <strong>{preview.fileName}</strong>: {preview.students.length} students read ({preview.matchedCount} update
            existing records, {preview.students.length - preview.matchedCount} new).
          </p>

          {preview.errors.length > 0 && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
              <p className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-1">
                <AlertCircle className="w-4 h-4" aria-hidden="true" /> {preview.errors.length} error(s) must be fixed before importing
              </p>
              {renderList(preview.errors, 'error')}
            </div>
          )}

          {preview.warnings.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                <AlertTriangle className="w-4 h-4" aria-hidden="true" /> {preview.warnings.length} warning(s)
              </p>
              {renderList(preview.warnings, 'warning')}
            </div>
          )}

          {preview.errors.length === 0 && preview.students.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Ready to import.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmImport}
              disabled={preview.errors.length > 0 || preview.students.length === 0}
              className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Import {preview.students.length} students
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
