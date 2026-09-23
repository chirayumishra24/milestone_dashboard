'use client';
import React from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  FileText,
  ChevronRight,
  Sparkles,
  LifeBuoy,
} from 'lucide-react';

interface QuickActionsCardProps {
  classId?: string;
}

export default function QuickActionsCard({ classId = 'IX' }: QuickActionsCardProps) {
  const actionClass =
    'w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/50 transition-all text-left group';

  const actions = [
    {
      key: 'roster',
      href: `/classes/${classId}/students`,
      icon: FileSpreadsheet,
      iconClass: 'bg-emerald-100 text-emerald-700',
      title: 'Export Class Roster',
      subtitle: 'Open the directory and download CSV',
    },
    {
      key: 'report',
      href: `/classes/${classId}/reports`,
      icon: FileText,
      iconClass: 'bg-blue-100 text-blue-700',
      title: `Class ${classId} Report Card`,
      subtitle: 'Printable audit and honour roll',
    },
    {
      key: 'interventions',
      href: `/classes/${classId}/interventions`,
      icon: LifeBuoy,
      iconClass: 'bg-purple-100 text-purple-700',
      title: 'Intervention Board',
      subtitle: 'Track remedial actions for this class',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
            <p className="text-xs text-slate-500">Reports, exports & remediation</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.key} href={a.href} className={actionClass}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.iconClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                      {a.title}
                    </h4>
                    <p className="text-xs text-slate-500">{a.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
              </Link>
            );
          })}

        </div>
      </div>
    </div>
  );
}
