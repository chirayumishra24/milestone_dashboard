import React from 'react';
import Link from 'next/link';
import { ArrowLeft, type LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Small pills shown next to the title (session, sample data, …) */
  badges?: React.ReactNode;
  /** Buttons or links aligned to the right on wide screens */
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

/**
 * Standard banner at the top of every page: icon, title, description, badges and actions.
 */
export default function PageHeader({
  icon: Icon,
  title,
  description,
  badges,
  actions,
  backHref,
  backLabel = 'Back',
}: PageHeaderProps) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {backHref && (
          <Link
            href={backHref}
            aria-label={backLabel}
            title={backLabel}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Link>
        )}
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {badges}
          </div>
          {description && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 md:justify-end">{actions}</div>}
    </div>
  );
}

/** Shared button styles for header actions */
export const headerActionClass = {
  primary:
    'inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors',
  secondary:
    'inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors',
};
