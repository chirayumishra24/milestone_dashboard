import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} aria-hidden="true" />;
}

/**
 * Placeholder shaped like a typical page (header, KPI row, two content cards) shown
 * while data loads, so the layout does not jump when content arrives.
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-1.5 w-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3">
          <Skeleton className="h-4 w-1/4" />
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
