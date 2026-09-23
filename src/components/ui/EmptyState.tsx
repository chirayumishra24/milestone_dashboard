import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message?: React.ReactNode;
  action?: React.ReactNode;
  /** Compact variant for use inside cards */
  compact?: boolean;
}

export default function EmptyState({ icon: Icon, title, message, action, compact = false }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-3 bg-white rounded-2xl border border-dashed border-slate-300 ${
        compact ? 'p-6' : 'p-10 min-h-[40vh]'
      }`}
    >
      <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        {message && <p className="text-sm text-slate-500 mt-1 max-w-md">{message}</p>}
      </div>
      {action}
    </div>
  );
}
