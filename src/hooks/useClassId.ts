'use client';
import { useParams } from 'next/navigation';

/** Grade code from the `/classes/[classId]` route, normalised to upper case (e.g. 'IX') */
export function useClassId(): string {
  const params = useParams();
  return ((params?.classId as string) || 'IX').toUpperCase();
}
