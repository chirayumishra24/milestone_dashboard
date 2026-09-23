'use client';
import React from 'react';
import { GitMerge, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function SchoolFmsTimeline() {
  const wings = [
    {
      wing: 'Middle School Wing (Grades VI – VIII)',
      students: '585 Scholars • 9 Sections',
      currentExam: 'Half-Yearly Examination',
      status: 'Marks Reconciled & Published',
      progress: 100,
      badge: 'Completed',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      owner: 'Mrs. Rekha Joshi (Middle Coordinator)',
      nextGate: 'PT-3 Cycle (Dec 2026)',
    },
    {
      wing: 'Secondary Wing (Grades IX & X)',
      students: '315 Scholars • 6 Sections',
      currentExam: 'Mid-Term Gate 4 & Pre-Board 1',
      status: 'Question Papers Vetted • Seating Matrix Issued',
      progress: 72,
      badge: 'In Progress (Active Gate)',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      owner: 'Mr. Rajesh K. Sharma & Dr. Sunita Sen',
      nextGate: 'Exam Conduct: 5 Nov – 15 Nov 2026',
    },
    {
      wing: 'Senior Secondary Wing (Grades XI & XII)',
      students: '270 Scholars • 6 Sections',
      currentExam: 'Term 1 Final & Mock Pre-Board Series',
      status: 'Practical Assessments Underway',
      progress: 60,
      badge: 'In Progress',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      owner: 'Mrs. Ananya Mukherji (Senior Head)',
      nextGate: 'CBSE Sample Paper Drills (Nov 2026)',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <GitMerge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">School-Wide Exam Lifecycle Governance</h3>
              <p className="text-xs text-slate-500">Multi-wing FMS process pipeline (AY 2026–27)</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FMS Central Ledger</span>
          </div>
        </div>

        <div className="space-y-3.5">
          {wings.map((w) => (
            <div
              key={w.wing}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900">{w.wing}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{w.students}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${w.badgeColor}`}>
                  {w.badge}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{w.currentExam}</span>
                  <span className="font-mono font-bold text-slate-800">{w.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    style={{ width: `${w.progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 italic mt-1">"{w.status}"</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Coordinator: {w.owner}</span>
                <span className="text-blue-700 font-semibold">{w.nextGate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 text-center">
        Synchronized with School Examination Committee (SEC) • CBSE Examination Byelaws
      </div>
    </div>
  );
}
