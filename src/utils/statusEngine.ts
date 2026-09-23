import { StudentStatus, PriorityLevel, NormalizedValue, StudentRecord } from '@/types/academic';

/**
 * Single source of truth for how a student's status is decided.
 *
 * Score bands (all cutoffs editable in Settings):
 * - Score >= student's own target            → ACHIEVED  (Target met)
 * - Score >= onTrackCutoff (default 70%)     → ON_TRACK
 * - Score >= criticalCutoff (default 60%)    → WATCH     (At risk)
 * - Score <  criticalCutoff                  → CRITICAL
 *
 * Students without a recorded target are measured against defaultTarget.
 */
export interface StatusThresholds {
  defaultTarget: number;
  onTrackCutoff: number;
  criticalCutoff: number;
}

export const DEFAULT_THRESHOLDS: StatusThresholds = {
  defaultTarget: 80,
  onTrackCutoff: 70,
  criticalCutoff: 60,
};

const THRESHOLDS_STORAGE_KEY = 'school_milestone_thresholds_v1';

let activeThresholds: StatusThresholds | null = null;

export function validateThresholds(t: StatusThresholds): string | null {
  const values = [t.defaultTarget, t.onTrackCutoff, t.criticalCutoff];
  if (values.some((v) => !Number.isFinite(v) || v < 0 || v > 100)) {
    return 'All values must be numbers between 0 and 100.';
  }
  if (t.criticalCutoff >= t.onTrackCutoff) {
    return 'The critical cutoff must be lower than the on-track cutoff.';
  }
  return null;
}

export function getStatusThresholds(): StatusThresholds {
  if (activeThresholds) return activeThresholds;
  activeThresholds = DEFAULT_THRESHOLDS;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(THRESHOLDS_STORAGE_KEY);
      if (stored) {
        const parsed = { ...DEFAULT_THRESHOLDS, ...JSON.parse(stored) } as StatusThresholds;
        if (!validateThresholds(parsed)) activeThresholds = parsed;
      }
    } catch (err) {
      console.warn('LocalStorage read error:', err);
    }
  }
  return activeThresholds;
}

export function saveStatusThresholds(thresholds: StatusThresholds): void {
  const error = validateThresholds(thresholds);
  if (error) throw new Error(error);
  activeThresholds = thresholds;
  if (typeof window !== 'undefined') {
    localStorage.setItem(THRESHOLDS_STORAGE_KEY, JSON.stringify(thresholds));
  }
}

export function resetStatusThresholds(): StatusThresholds {
  activeThresholds = DEFAULT_THRESHOLDS;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(THRESHOLDS_STORAGE_KEY);
  }
  return activeThresholds;
}

/** Display metadata shared by badges, filters and exports */
export const STATUS_META: Record<
  Exclude<StudentStatus, 'INTERVENTION'>,
  { label: string; badgeBg: string; badgeColor: string; textColor: string; priority: PriorityLevel }
> = {
  ACHIEVED: {
    label: 'Target Met',
    badgeBg: 'bg-indigo-50 text-indigo-700',
    badgeColor: 'border-indigo-300',
    textColor: 'text-indigo-700',
    priority: 'LOW',
  },
  ON_TRACK: {
    label: 'On Track',
    badgeBg: 'bg-emerald-50 text-emerald-700',
    badgeColor: 'border-emerald-300',
    textColor: 'text-emerald-700',
    priority: 'LOW',
  },
  WATCH: {
    label: 'At Risk',
    badgeBg: 'bg-amber-50 text-amber-700',
    badgeColor: 'border-amber-300',
    textColor: 'text-amber-700',
    priority: 'MEDIUM',
  },
  CRITICAL: {
    label: 'Critical',
    badgeBg: 'bg-rose-50 text-rose-700',
    badgeColor: 'border-rose-300',
    textColor: 'text-rose-700',
    priority: 'CRITICAL',
  },
};

export interface StatusEvaluation {
  status: StudentStatus;
  label: string;
  gap: number;
  gapFormatted: string;
  priority: PriorityLevel;
  badgeColor: string;
  badgeBg: string;
  textColor: string;
  description: string;
}

export function calculateStudentStatus(
  currentScore: number | NormalizedValue | null | undefined,
  targetScore: number | NormalizedValue | null | undefined,
  thresholds: StatusThresholds = getStatusThresholds()
): StatusEvaluation {
  const currentVal = extractNumericValue(currentScore);
  const targetVal = extractNumericValue(targetScore) ?? thresholds.defaultTarget;

  if (currentVal === null) {
    return {
      status: 'WATCH',
      label: 'Pending',
      gap: 0,
      gapFormatted: 'N/A',
      priority: 'LOW',
      badgeColor: 'border-slate-300',
      badgeBg: 'bg-slate-100',
      textColor: 'text-slate-700',
      description: 'Pending assessment consolidation',
    };
  }

  const gap = Math.round((currentVal - targetVal) * 10) / 10;
  const gapFormatted = gap > 0 ? `+${gap}%` : `${gap}%`;

  let status: Exclude<StudentStatus, 'INTERVENTION'>;
  let description: string;
  if (currentVal >= targetVal) {
    status = 'ACHIEVED';
    description = 'At or above the school target';
  } else if (currentVal >= thresholds.onTrackCutoff) {
    status = 'ON_TRACK';
    description = `Scoring ${thresholds.onTrackCutoff}% or above, still short of target`;
  } else if (currentVal >= thresholds.criticalCutoff) {
    status = 'WATCH';
    description = `Scoring between ${thresholds.criticalCutoff}% and ${thresholds.onTrackCutoff}%, under observation`;
  } else {
    status = 'CRITICAL';
    description = `Scoring below ${thresholds.criticalCutoff}%, urgent intervention required`;
  }

  const meta = STATUS_META[status];
  return {
    status,
    label: meta.label,
    gap,
    gapFormatted,
    priority: meta.priority,
    badgeColor: meta.badgeColor,
    badgeBg: meta.badgeBg,
    textColor: meta.textColor,
    description,
  };
}

export function getStudentScore(student: StudentRecord): number {
  return student.currentPerformance?.overall?.value ?? 0;
}

export function getStudentTarget(student: StudentRecord): number {
  return student.schoolTarget?.overall?.value ?? getStatusThresholds().defaultTarget;
}

export function getStudentStatus(student: StudentRecord): StatusEvaluation {
  return calculateStudentStatus(student.currentPerformance?.overall, getStudentTarget(student));
}

export type StatusFilterValue = 'ALL' | 'ACHIEVED' | 'ON_TRACK' | 'WATCH' | 'CRITICAL';

export function matchesStatusFilter(student: StudentRecord, filter: StatusFilterValue): boolean {
  return filter === 'ALL' || getStudentStatus(student).status === filter;
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
