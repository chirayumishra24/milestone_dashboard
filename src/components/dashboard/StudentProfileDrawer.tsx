'use client';
import React from 'react';
import { StudentRecord } from '@/types/academic';
import { extractNumericValue, getStudentStatus, getStudentTarget } from '@/utils/statusEngine';
import {
  X,
  User,
  GraduationCap,
  Award,
  AlertTriangle,
  TrendingUp,
  Calendar,
  BookOpen,
  CheckCircle2,
  Share2,
  Printer,
} from 'lucide-react';

interface StudentProfileDrawerProps {
  student: StudentRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentProfileDrawer({
  student,
  isOpen,
  onClose,
}: StudentProfileDrawerProps) {
  if (!isOpen || !student) return null;

  const currentOverall = student.currentPerformance?.overall?.value ?? 0;
  const targetOverall = getStudentTarget(student);
  const gap = Math.round((currentOverall - targetOverall) * 10) / 10;
  const isAhead = gap >= 0;

  const SUBJECT_DEFS = [
    { key: 'english', name: 'English', color: 'bg-blue-600' },
    { key: 'secondLanguage', name: 'Hindi / 2nd Lang', color: 'bg-purple-600' },
    { key: 'maths', name: 'Mathematics', color: 'bg-emerald-600' },
    { key: 'science', name: 'Science', color: 'bg-amber-600' },
    { key: 'socialScience', name: 'Social Science', color: 'bg-rose-600' },
    { key: 'it', name: 'Computer / IT', color: 'bg-cyan-600' },
  ] as const;

  // Per-subject targets are rarely recorded, so subjects default to the student's overall target
  const subjectScores = SUBJECT_DEFS.map((def) => ({
    ...def,
    score: extractNumericValue(student.currentPerformance?.subjects?.[def.key]),
    target: extractNumericValue(student.schoolTarget?.subjects?.[def.key]) ?? targetOverall,
  }));
  const subjects = subjectScores.map((subj) => ({ ...subj, actual: subj.score ?? 0 }));

  // Weakest assessed subject relative to its target, for the recommendation card
  const weakestSubject = subjectScores
    .filter((subj) => subj.score !== null)
    .map((subj) => ({ ...subj, gap: Math.round(((subj.score as number) - subj.target) * 10) / 10 }))
    .sort((a, b) => a.gap - b.gap)[0];

  const examHistory = (student.examOrder || [])
    .map((id) => student.exams?.[id])
    .filter((exam): exam is NonNullable<typeof exam> => !!exam);

  const evaluation = getStudentStatus(student);
  const status = { label: evaluation.label, bg: `${evaluation.badgeBg} ${evaluation.badgeColor}` };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-white font-bold text-lg">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">{student.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.bg}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Class {student.class} • Section <strong>{student.section || student.group}</strong> • Roll/ID: <span className="font-mono">{student.enrollmentNumber || student.studentId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Key Overall Stats Card */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Current Score</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{currentOverall}%</div>
              <span className="text-[10px] text-slate-500">Mid-Term Actual</span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">School Target</span>
              <div className="text-2xl font-black text-slate-700 mt-0.5">{targetOverall}%</div>
              <span className="text-[10px] text-slate-500">CBSE Objective</span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Target Gap</span>
              <div className={`text-2xl font-black mt-0.5 ${isAhead ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isAhead ? `+${gap}%` : `${gap}%`}
              </div>
              <span className="text-[10px] text-slate-500">{isAhead ? 'Ahead of Goal' : 'Deficit to Bridge'}</span>
            </div>
          </div>

          {/* Subject Breakdown with Target Bars */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Subject Diagnostics</span>
              <span className="text-[10px] text-slate-400 font-normal">Score / Target</span>
            </h4>

            <div className="space-y-3">
              {subjects.map((s) => {
                const subGap = Math.round((s.actual - s.target) * 10) / 10;
                const subAhead = subGap >= 0;

                return (
                  <div key={s.key} className="p-2.5 rounded-lg border border-slate-100 bg-white shadow-2xs">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{s.actual}%</span>
                        <span className="text-slate-400 text-[11px]">/ {s.target}%</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            subAhead ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {subAhead ? `+${subGap}%` : `${subGap}%`}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.color}`}
                        style={{ width: `${Math.min(s.actual, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exam History */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Exam History
            </h4>
            {examHistory.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {examHistory.map((exam, idx) => {
                  const isLatest = idx === examHistory.length - 1;
                  const score = extractNumericValue(exam.overall);
                  return (
                    <div
                      key={exam.id}
                      className={`p-2.5 rounded-lg border ${
                        isLatest ? 'border-blue-300 bg-blue-50/60 ring-1 ring-blue-200' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <span className={`text-[11px] font-semibold block ${isLatest ? 'text-blue-700' : 'text-slate-500'}`}>
                        {exam.label}
                      </span>
                      <span className={`text-sm font-bold block mt-1 ${isLatest ? 'text-blue-900' : 'text-slate-700'}`}>
                        {score !== null ? `${score}%` : exam.overall.displayValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-[11px] text-slate-500">
                Only the latest assessment ({currentOverall}%) is on record. Earlier exam results have not been imported yet.
              </p>
            )}
          </div>

          {/* Weakest-subject recommendation */}
          {weakestSubject && weakestSubject.gap < 0 ? (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Recommended Focus</span>
              </div>
              <p className="text-amber-800 text-[11px]">
                {weakestSubject.name} is {Math.abs(weakestSubject.gap)} points below target ({weakestSubject.score}% against{' '}
                {weakestSubject.target}%). Consider targeted remedial support in this subject before the next assessment.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Every assessed subject is at or above target.</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 active:scale-95"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Export Report (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
