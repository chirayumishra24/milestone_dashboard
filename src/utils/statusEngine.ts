import { StudentStatus, PriorityLevel, NormalizedValue } from '@/types/academic';

export interface StatusEvaluation {
  status: StudentStatus;
  gap: number;
  gapFormatted: string;
  priority: PriorityLevel;
  badgeColor: string;
  badgeBg: string;
  textColor: string;
  description: string;
}

/**
 * Requirement #12: Centralized status calculation engine
 * Gap = Current Overall % - Target Overall %
 * 
 * - Gap >= 0%: ON TRACK (or ACHIEVED if current meets/exceeds target)
 * - Gap -1% to -5%: WATCH (Minor deficit)
 * - Gap -5.1% to -10%: INTERVENTION (At risk, requires academic plan)
 * - Gap < -10%: CRITICAL (Severe deficit, urgent management intervention)
 */
export function calculateStudentStatus(
  currentScore: number | NormalizedValue | null | undefined,
  targetScore: number | NormalizedValue | null | undefined
): StatusEvaluation {
  const currentVal = extractNumericValue(currentScore);
  const targetVal = extractNumericValue(targetScore);

  if (currentVal === null || targetVal === null) {
    return {
      status: 'WATCH',
      gap: 0,
      gapFormatted: 'N/A',
      priority: 'LOW',
      badgeColor: 'border-slate-300',
      badgeBg: 'bg-slate-100',
      textColor: 'text-slate-700',
      description: 'Pending assessment consolidation',
    };
  }

  // Calculate deviation gap (Current - Target)
  const rawGap = currentVal - targetVal;
  const gap = Math.round(rawGap * 10) / 10;
  const gapFormatted = gap > 0 ? `+${gap}%` : `${gap}%`;

  if (gap >= 0) {
    return {
      status: 'ON_TRACK',
      gap,
      gapFormatted,
      priority: 'LOW',
      badgeColor: 'border-emerald-300',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      textColor: 'text-emerald-700',
      description: 'Pacing at or exceeding target benchmark',
    };
  }

  if (gap >= -5.0) {
    return {
      status: 'WATCH',
      gap,
      gapFormatted,
      priority: 'MEDIUM',
      badgeColor: 'border-amber-300',
      badgeBg: 'bg-amber-50 text-amber-700',
      textColor: 'text-amber-700',
      description: 'Minor deviation from target, under observation',
    };
  }

  if (gap >= -10.0) {
    return {
      status: 'INTERVENTION',
      gap,
      gapFormatted,
      priority: 'HIGH',
      badgeColor: 'border-orange-300',
      badgeBg: 'bg-orange-50 text-orange-700',
      textColor: 'text-orange-700',
      description: 'Academic intervention needed in deficit subjects',
    };
  }

  return {
    status: 'CRITICAL',
    gap,
    gapFormatted,
    priority: 'CRITICAL',
    badgeColor: 'border-rose-300',
    badgeBg: 'bg-rose-50 text-rose-700',
    textColor: 'text-rose-700',
    description: 'Urgent intervention required (deficit > 10%)',
  };
}

export function extractNumericValue(val: number | NormalizedValue | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  if (typeof val === 'object') {
    if (val.type === 'exact' && val.value !== undefined) return val.value;
    if (val.type === 'range' && val.min !== undefined && val.max !== undefined) {
      return (val.min + val.max) / 2;
    }
  }
  return null;
}
