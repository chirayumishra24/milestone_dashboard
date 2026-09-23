'use client';
import React from 'react';
import { StudentRecord } from '@/types/academic';
import {
  X,
  User,
  GraduationCap,
  Award,
  AlertTriangle,
  TrendingUp,
  PhoneCall,
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
  const targetOverall = student.schoolTarget?.overall?.value ?? 80;
  const gap = Math.round((currentOverall - targetOverall) * 10) / 10;
  const isAhead = gap >= 0;

  const subjects = [
    { key: 'english', name: 'English', actual: student.currentPerformance?.subjects?.english?.value ?? 0, target: student.schoolTarget?.subjects?.english?.value ?? 80, color: 'bg-blue-600' },
    { key: 'secondLanguage', name: 'Hindi / 2nd Lang', actual: student.currentPerformance?.subjects?.secondLanguage?.value ?? 0, target: student.schoolTarget?.subjects?.secondLanguage?.value ?? 80, color: 'bg-purple-600' },
    { key: 'maths', name: 'Mathematics', actual: student.currentPerformance?.subjects?.maths?.value ?? 0, target: student.schoolTarget?.subjects?.maths?.value ?? 85, color: 'bg-emerald-600' },
    { key: 'science', name: 'Science', actual: student.currentPerformance?.subjects?.science?.value ?? 0, target: student.schoolTarget?.subjects?.science?.value ?? 85, color: 'bg-amber-600' },
    { key: 'socialScience', name: 'Social Science', actual: student.currentPerformance?.subjects?.socialScience?.value ?? 0, target: student.schoolTarget?.subjects?.socialScience?.value ?? 80, color: 'bg-rose-600' },
    { key: 'it', name: 'Computer / IT', actual: student.currentPerformance?.subjects?.it?.value ?? 0, target: student.schoolTarget?.subjects?.it?.value ?? 85, color: 'bg-cyan-600' },
  ];

  const getStatusBadge = () => {
    if (currentOverall >= 85) return { label: 'Target Achieved', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (currentOverall >= 70) return { label: 'On Track', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (currentOverall >= 60) return { label: 'Watch / At Risk', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: 'Critical Attention', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
  };

  const status = getStatusBadge();

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
                Class IX • Section <strong>{student.section || student.group}</strong> • Roll/ID: <span className="font-mono">{student.enrollmentNumber || student.studentId}</span>
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

          {/* Multi-Exam Historical Trajectory */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Historical Progression (Class IX)
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] text-slate-400 font-semibold block">Baseline</span>
                <span className="text-sm font-bold text-slate-700 block mt-1">68.5%</span>
                <span className="text-[10px] text-slate-400">Apr 26</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] text-slate-400 font-semibold block">PT-1</span>
                <span className="text-sm font-bold text-slate-700 block mt-1">72.0%</span>
                <span className="text-[10px] text-slate-400">Jul 26</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[10px] text-slate-400 font-semibold block">PT-2</span>
                <span className="text-sm font-bold text-slate-700 block mt-1">75.5%</span>
                <span className="text-[10px] text-slate-400">Aug 26</span>
              </div>
              <div className="p-2.5 rounded-lg border border-blue-300 bg-blue-50/60 ring-1 ring-blue-200">
                <span className="text-[10px] text-blue-700 font-bold block">Mid Term</span>
                <span className="text-sm font-black text-blue-900 block mt-1">{currentOverall}%</span>
                <span className="text-[10px] text-blue-600 font-semibold">Latest</span>
              </div>
            </div>
          </div>

          {/* 1-Click Remedial Intervention Action */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Recommended Pedagogical Intervention</span>
            </div>
            <p className="text-amber-700 text-[11px]">
              Mathematics indicates a gap of -6.5%. Assigning 2 hours weekly remedial tutoring is recommended before the Annual Pre-Board.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <button className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors">
                Schedule Remedial Tutoring
              </button>
              <button className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 font-semibold rounded-lg text-xs hover:bg-amber-50 transition-colors flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" /> Call Parent
              </button>
            </div>
          </div>
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
