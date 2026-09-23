'use client';
import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Keeps a small set of string view settings (filters, sort, tab) in the URL query so views
 * can be shared by link and survive reloads. Values equal to their default are left out of
 * the URL to keep it short. Updates use `replace`, so filtering does not flood history.
 */
export function useQueryParams<T extends Record<string, string>>(
  defaults: T
): [T, (patch: Partial<T>) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = useMemo(() => {
    const result = { ...defaults };
    (Object.keys(defaults) as (keyof T)[]).forEach((key) => {
      const fromUrl = searchParams?.get(key as string);
      if (fromUrl !== null && fromUrl !== undefined) result[key] = fromUrl as T[keyof T];
    });
    return result;
    // `defaults` is a literal at each call site; its contents never change between renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const update = useCallback(
    (patch: Partial<T>) => {
      const next = new URLSearchParams(searchParams?.toString() ?? '');
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === '' || value === defaults[key]) next.delete(key);
        else next.set(key, value as string);
      });
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, pathname, searchParams]
  );

  return [values, update];
}
