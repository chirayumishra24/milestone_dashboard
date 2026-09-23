'use client';
import { DependencyList, useCallback, useEffect, useState } from 'react';

export interface ApiDataState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  /** Re-runs the loader, e.g. from a "Try again" button */
  reload: () => void;
}

/**
 * Runs an async loader on mount and whenever `deps` change, tracking loading and error
 * state. Results from a superseded run (deps changed mid-flight) are ignored.
 */
export function useApiData<T>(loader: () => Promise<T>, deps: DependencyList): ApiDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    loader()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        console.error('Data load failed:', err);
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // The loader is re-created every render; callers list what it depends on in `deps`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { data, isLoading, error, reload };
}
