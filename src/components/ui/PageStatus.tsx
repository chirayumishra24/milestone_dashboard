'use client';
import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { PageSkeleton } from './Skeleton';

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{message}</span>
      <PageSkeleton />
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'The data for this page could not be loaded.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-sm text-slate-500 mt-1 max-w-md">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Try again
        </button>
      )}
    </div>
  );
}

/** Marks pages whose roster is generated placeholder data rather than school records */
export function SampleDataBadge() {
  return (
    <span
      className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
      title="This grade has no official records yet. Students and scores are generated placeholders."
    >
      Sample data
    </span>
  );
}
