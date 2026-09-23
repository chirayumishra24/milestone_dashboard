import { NormalizedValue, EXAM_WEIGHTS, EXAM_ORDER, StudentRecord, ExamEntry } from './academicNormalizer';

export interface RequiredScoreInput {
  currentWeightedScore: number;
  targetScore: number;
  remainingWeight: number; // e.g. 0.30 or 30
}

export type RequiredScoreStatus =
  | 'TARGET_ACHIEVED'
  | 'REQUIRED_SCORE_CALCULATED'
  | 'TARGET_NOT_REACHABLE'
  | 'INSUFFICIENT_DATA';

export interface RequiredScoreResult {
  status: RequiredScoreStatus;
  requiredScore?: number;
  message: string;
}

/**
 * Formula: Required Score = (Target Final Score - Current Weighted Contribution) / Remaining Weight
 */
export function calculateRequiredScore(input: RequiredScoreInput): RequiredScoreResult {
  const { currentWeightedScore, targetScore, remainingWeight } = input;

  if (
    currentWeightedScore === undefined ||
    targetScore === undefined ||
    remainingWeight === undefined ||
    isNaN(currentWeightedScore) ||
    isNaN(targetScore) ||
    isNaN(remainingWeight)
  ) {
    return {
      status: 'INSUFFICIENT_DATA',
      message: 'Insufficient assessment weightage or performance data.',
    };
  }

  // Normalize weight if passed as percentage (e.g. 30 -> 0.30)
  const weightFraction = remainingWeight > 1 ? remainingWeight / 100 : remainingWeight;

  if (weightFraction <= 0 || weightFraction > 1) {
    return {
      status: 'INSUFFICIENT_DATA',
      message: 'Remaining assessment weight must be greater than 0 and up to 100%.',
    };
  }

  // If already at or above target
  if (currentWeightedScore >= targetScore) {
    return {
      status: 'TARGET_ACHIEVED',
      requiredScore: 0,
      message: 'Target has already been achieved with current weighted contribution.',
    };
  }

  const deficit = targetScore - currentWeightedScore;
  const required = deficit / weightFraction;
  const roundedRequired = Math.round(required * 10) / 10;

  if (roundedRequired > 100) {
    return {
      status: 'TARGET_NOT_REACHABLE',
      requiredScore: roundedRequired,
      message: `Mathematically requires ${roundedRequired}% in upcoming assessments, which exceeds 100%.`,
    };
  }

  return {
    status: 'REQUIRED_SCORE_CALCULATED',
    requiredScore: roundedRequired,
    message: `Need to score ${roundedRequired}% in remaining assessments to achieve ${targetScore}% final target.`,
  };
}

export interface TargetAnalysis {
  status: 'NOT_ASSIGNED' | 'ACHIEVED' | 'IN_PROGRESS' | 'RANGE_UNCERTAIN';
  gapPercentagePoints?: number;
  description: string;
}

export function evaluateTargetGap(
  current: NormalizedValue,
  target: NormalizedValue
): TargetAnalysis {
  if (target.type === 'empty' || target.type === 'invalid') {
    return {
      status: 'NOT_ASSIGNED',
      description: 'School target has not been assigned yet.',
    };
  }

  if (current.type === 'empty' || current.type === 'invalid') {
    return {
      status: 'IN_PROGRESS',
      description: 'Current performance pending assessment consolidation.',
    };
  }

  // Case 1: Both exact
  if (current.type === 'exact' && target.type === 'exact' && current.value !== undefined && target.value !== undefined) {
    const diff = target.value - current.value;
    const gap = Math.round(diff * 100) / 100;

    if (gap <= 0) {
      return {
        status: 'ACHIEVED',
        gapPercentagePoints: 0,
        description: `Target achieved (${Math.abs(gap).toFixed(1)} percentage points above target)`,
      };
    }

    return {
      status: 'IN_PROGRESS',
      gapPercentagePoints: gap,
      description: `${gap.toFixed(1)} percentage points to target`,
    };
  }

  // Case 2: Current is a range, Target is exact
  if (current.type === 'range' && target.type === 'exact' && current.min !== undefined && current.max !== undefined && target.value !== undefined) {
    if (current.min >= target.value) {
      return {
        status: 'ACHIEVED',
        description: `Target achieved (Current range ${current.displayValue} meets or exceeds ${target.displayValue})`,
      };
    }

    if (current.max < target.value) {
      const minGap = Math.round((target.value - current.max) * 10) / 10;
      const maxGap = Math.round((target.value - current.min) * 10) / 10;
      return {
        status: 'IN_PROGRESS',
        description: `Approx. ${minGap}–${maxGap} percentage points to target`,
      };
    }

    return {
      status: 'RANGE_UNCERTAIN',
      description: `Target is within current estimated range (${current.displayValue})`,
    };
  }

  // Case 3: Target is a range
  if (target.type === 'range' && target.min !== undefined) {
    if (current.type === 'exact' && current.value !== undefined) {
      if (current.value >= target.min) {
        return {
          status: 'ACHIEVED',
          description: `Current score (${current.displayValue}) reaches target band (${target.displayValue})`,
        };
      }
      const gap = Math.round((target.min - current.value) * 10) / 10;
      return {
        status: 'IN_PROGRESS',
        gapPercentagePoints: gap,
        description: `${gap.toFixed(1)} percentage points to target lower band`,
      };
    }
  }

  return {
    status: 'RANGE_UNCERTAIN',
    description: 'Target progress will be calculated once exact metrics are consolidated.',
  };
}

export function generateAcademicInsights(student: {
  currentPerformance: {
    overall: NormalizedValue;
    subjectList: Array<{ label: string; normalized: NormalizedValue }>;
  };
  schoolTarget: {
    overall: NormalizedValue;
  };
}): string[] {
  const insights: string[] = [];
  const subjects = student.currentPerformance.subjectList;

  // Find exact scored subjects
  const exactSubjects = subjects
    .filter((s) => s.normalized.type === 'exact' && s.normalized.value !== undefined)
    .map((s) => ({ label: s.label, score: s.normalized.value! }))
    .sort((a, b) => b.score - a.score);

  if (exactSubjects.length >= 2) {
    const highest = exactSubjects[0];
    const lowest = exactSubjects[exactSubjects.length - 1];

    if (highest.score >= 80) {
      insights.push(`Strongest subject is ${highest.label} with an outstanding score of ${highest.score}%.`);
    }

    if (lowest.score < 70 && highest.score - lowest.score >= 15) {
      insights.push(`Targeted focus recommended in ${lowest.label} (${lowest.score}%) to elevate overall aggregate.`);
    }
  }

  // Range-based feedback
  const rangeSubjects = subjects.filter((s) => s.normalized.type === 'range');
  if (rangeSubjects.length > 0) {
    insights.push(
      `${rangeSubjects.length} subject${rangeSubjects.length > 1 ? 's' : ''} (${rangeSubjects.map((s) => s.label).join(', ')}) have estimated performance bands pending final assessment consolidation.`
    );
  }

  // Target comparison insight
  if (student.schoolTarget.overall.type === 'exact' && student.currentPerformance.overall.type === 'exact') {
    const targetVal = student.schoolTarget.overall.value!;
    const overallVal = student.currentPerformance.overall.value!;
    if (overallVal >= targetVal) {
      insights.push(`Academic milestone met: currently pacing at or above the school institutional target of ${targetVal}%.`);
    }
  }

  if (insights.length === 0) {
    insights.push('Academic performance tracking active. Complete term assessment metrics will consolidate here.');
  }

  return insights;
}

// ─── Target Score Calculator (Weighted) ───

export type RequiredScoreStatusTag =
  | 'ACHIEVED'
  | 'ON_TRACK'
  | 'NEEDS_FOCUS'
  | 'NOT_REACHABLE'
  | 'EXEMPT'
  | 'INSUFFICIENT_DATA';

export interface ExamScoreEntry {
  examId: string;
  label: string;
  shortLabel: string;
  weight: number;
  maxMarks: number;
  rawScore: number | null;       // actual marks scored (null = not taken yet)
  normalizedPct: number | null;  // score as percentage
  isCompleted: boolean;
}

export interface SubjectRequiredScore {
  subjectKey: string;
  subjectLabel: string;
  subjectCode: string;
  examScores: ExamScoreEntry[];
  targetScore: number | null;       // per-subject target %
  targetDisplayValue: string;
  weightedContribution: number;     // sum of (score% × weight) for completed exams
  completedWeight: number;          // sum of weights for completed exams
  remainingWeight: number;          // sum of weights for uncompleted exams
  requiredInRemaining: number | null;
  status: RequiredScoreStatusTag;
  gap: number | null;               // target - current weighted projection
}

export interface TargetCalculatorResult {
  subjects: SubjectRequiredScore[];
  overall: SubjectRequiredScore;
  completedExams: string[];
  pendingExams: string[];
}

/**
 * Normalizes a raw exam score to percentage.
 * If the exam is scored out of 20 (Mid Term), converts to /100.
 */
function normalizeToPercent(rawScore: number | null, maxMarks: number): number | null {
  if (rawScore === null || rawScore === undefined) return null;
  if (maxMarks === 100) return rawScore;
  return Math.round((rawScore / maxMarks) * 10000) / 100;
}

/**
 * Extracts subject score from a student's exam entry.
 * Handles NormalizedValue with unit 'marks' (convert /20 → %) or 'percent'.
 * Returns null for exempt, absent returns 0.
 */
function getSubjectExamScore(
  examEntry: ExamEntry,
  subjectKey: string,
  maxMarks: number
): { raw: number | null; pct: number | null } {
  if (!examEntry) return { raw: null, pct: null };

  const subj = (examEntry as any).subjects?.[subjectKey] as NormalizedValue | undefined;
  if (!subj) return { raw: null, pct: null };

  // Exempt subject
  if (subj.type === 'exempt') return { raw: null, pct: null };

  // Absent → 0
  if (subj.displayValue === 'Absent (AB)' || subj.statusNote?.includes('Absent')) {
    return { raw: 0, pct: 0 };
  }

  if (subj.type === 'exact' && subj.value !== undefined) {
    const raw = subj.value;
    const pct = subj.unit === 'marks' ? normalizeToPercent(raw, maxMarks) : raw;
    return { raw, pct };
  }

  // Range — use midpoint
  if (subj.type === 'range' && subj.min !== undefined && subj.max !== undefined) {
    const mid = (subj.min + subj.max) / 2;
    const pct = subj.unit === 'marks' ? normalizeToPercent(mid, maxMarks) : mid;
    return { raw: mid, pct };
  }

  return { raw: null, pct: null };
}

/**
 * Extracts target score for a subject. Returns percentage value.
 */
function getSubjectTarget(
  student: StudentRecord,
  subjectKey: string
): { value: number | null; displayValue: string } {
  const targetSubjects = student.schoolTarget?.subjects;
  if (!targetSubjects) {
    // Fall back to currentPerformance subjects (which ARE the targets from the target sheet)
    const perfSubjects = student.currentPerformance?.subjects;
    const perf = perfSubjects?.[subjectKey as keyof typeof perfSubjects] as NormalizedValue | undefined;
    if (!perf) return { value: null, displayValue: 'N/A' };

    if (perf.type === 'exact' && perf.value !== undefined) {
      return { value: perf.value, displayValue: perf.displayValue };
    }
    if (perf.type === 'range' && perf.min !== undefined && perf.max !== undefined) {
      return { value: (perf.min + perf.max) / 2, displayValue: perf.displayValue };
    }
    return { value: null, displayValue: perf.displayValue || 'N/A' };
  }

  const target = targetSubjects[subjectKey as keyof typeof targetSubjects] as NormalizedValue | undefined;
  if (!target) return { value: null, displayValue: 'N/A' };

  if (target.type === 'exact' && target.value !== undefined) {
    return { value: target.value, displayValue: target.displayValue };
  }
  if (target.type === 'range' && target.min !== undefined && target.max !== undefined) {
    return { value: (target.min + target.max) / 2, displayValue: target.displayValue };
  }
  if (target.type === 'exempt') {
    return { value: null, displayValue: 'Exempt' };
  }
  return { value: null, displayValue: target.displayValue || 'N/A' };
}

const SUBJECT_META: { key: string; code: string; label: string }[] = [
  { key: 'english', code: 'ENG', label: 'English Language & Lit' },
  { key: 'secondLanguage', code: 'LANG', label: '2nd Language' },
  { key: 'maths', code: 'MATH', label: 'Mathematics' },
  { key: 'science', code: 'SCI', label: 'General Science' },
  { key: 'socialScience', code: 'S.ST', label: 'Social Science' },
  { key: 'it', code: 'IT', label: 'Information Technology' },
];

export function calculateRequiredScoresPerSubject(
  student: StudentRecord
): TargetCalculatorResult {
  const completedExams: string[] = [];
  const pendingExams: string[] = [];

  // Determine which exams are completed
  for (const examId of EXAM_ORDER) {
    if (student.exams?.[examId]) {
      completedExams.push(examId);
    } else {
      pendingExams.push(examId);
    }
  }

  // Resolve second language code
  const lang2 = student.secondLanguage || 'Hindi';
  const lang2Code = lang2.slice(0, 3).toUpperCase();

  const subjectResults: SubjectRequiredScore[] = SUBJECT_META.map((meta) => {
    const code = meta.key === 'secondLanguage' ? lang2Code : meta.code;
    const label = meta.key === 'secondLanguage' ? `2nd Lang: ${lang2}` : meta.label;

    // Build exam scores array
    const examScores: ExamScoreEntry[] = EXAM_ORDER.map((examId) => {
      const w = EXAM_WEIGHTS[examId];
      const exam = student.exams?.[examId];
      const { raw, pct } = exam
        ? getSubjectExamScore(exam as any, meta.key, w.maxMarks)
        : { raw: null, pct: null };

      return {
        examId,
        label: w.label,
        shortLabel: w.shortLabel,
        weight: w.weight,
        maxMarks: w.maxMarks,
        rawScore: raw,
        normalizedPct: pct,
        isCompleted: exam !== undefined && raw !== null,
      };
    });

    // Check if subject is exempt in all exams (optional language not taken)
    const allExempt = completedExams.every((eid) => {
      const exam = student.exams?.[eid];
      if (!exam) return false;
      const subj = (exam as any).subjects?.[meta.key] as NormalizedValue | undefined;
      return subj?.type === 'exempt';
    });

    if (allExempt) {
      return {
        subjectKey: meta.key,
        subjectLabel: label,
        subjectCode: code,
        examScores,
        targetScore: null,
        targetDisplayValue: 'Exempt',
        weightedContribution: 0,
        completedWeight: 0,
        remainingWeight: 0,
        requiredInRemaining: null,
        status: 'EXEMPT' as RequiredScoreStatusTag,
        gap: null,
      };
    }

    // Calculate weighted contribution from completed exams
    let weightedContribution = 0;
    let completedWeight = 0;

    for (const es of examScores) {
      if (es.isCompleted && es.normalizedPct !== null) {
        weightedContribution += es.normalizedPct * es.weight;
        completedWeight += es.weight;
      }
    }

    const remainingWeight = 1.0 - completedWeight;

    // Get target
    const target = getSubjectTarget(student, meta.key);

    let requiredInRemaining: number | null = null;
    let status: RequiredScoreStatusTag = 'INSUFFICIENT_DATA';
    let gap: number | null = null;

    if (target.value !== null && completedWeight > 0) {
      const targetTotal = target.value; // target %
      const deficit = targetTotal - weightedContribution;
      
      if (deficit <= 0) {
        requiredInRemaining = 0;
        status = 'ACHIEVED';
        gap = 0;
      } else if (remainingWeight > 0) {
        requiredInRemaining = Math.round((deficit / remainingWeight) * 10) / 10;
        gap = Math.round((targetTotal - (weightedContribution / completedWeight) * 100) * 10) / 10;
        // Recalculate gap as simple: target - currentProjectedAverage
        const currentAvg = weightedContribution / completedWeight;
        gap = Math.round((targetTotal - currentAvg) * 10) / 10;

        if (requiredInRemaining <= 0) status = 'ACHIEVED';
        else if (requiredInRemaining <= 75) status = 'ON_TRACK';
        else if (requiredInRemaining <= 100) status = 'NEEDS_FOCUS';
        else status = 'NOT_REACHABLE';
      } else {
        // All exams done
        status = deficit <= 0 ? 'ACHIEVED' : 'NOT_REACHABLE';
        requiredInRemaining = deficit <= 0 ? 0 : null;
        gap = deficit;
      }
    }

    return {
      subjectKey: meta.key,
      subjectLabel: label,
      subjectCode: code,
      examScores,
      targetScore: target.value,
      targetDisplayValue: target.displayValue,
      weightedContribution: Math.round(weightedContribution * 100) / 100,
      completedWeight: Math.round(completedWeight * 100) / 100,
      remainingWeight: Math.round(remainingWeight * 100) / 100,
      requiredInRemaining,
      status,
      gap,
    };
  });

  // Overall calculation
  const nonExemptSubjects = subjectResults.filter((s) => s.status !== 'EXEMPT');
  const overallTarget = student.schoolTarget?.overall;
  let overallTargetVal: number | null = null;
  let overallTargetDisplay = 'N/A';

  if (overallTarget?.type === 'exact' && overallTarget.value !== undefined) {
    overallTargetVal = overallTarget.value;
    overallTargetDisplay = overallTarget.displayValue;
  } else if (overallTarget?.type === 'range' && overallTarget.min !== undefined && overallTarget.max !== undefined) {
    overallTargetVal = (overallTarget.min + overallTarget.max) / 2;
    overallTargetDisplay = overallTarget.displayValue;
  }

  // Overall weighted contribution = average of subject weighted contributions
  const totalWeightedContrib = nonExemptSubjects.reduce((sum, s) => sum + s.weightedContribution, 0);
  const avgWeightedContrib = nonExemptSubjects.length > 0 ? totalWeightedContrib / nonExemptSubjects.length : 0;
  const overallCompletedWeight = nonExemptSubjects.length > 0 ? nonExemptSubjects[0].completedWeight : 0;
  const overallRemainingWeight = nonExemptSubjects.length > 0 ? nonExemptSubjects[0].remainingWeight : 1;

  let overallRequired: number | null = null;
  let overallStatus: RequiredScoreStatusTag = 'INSUFFICIENT_DATA';
  let overallGap: number | null = null;

  if (overallTargetVal !== null && overallCompletedWeight > 0) {
    const deficit = overallTargetVal - avgWeightedContrib;
    if (deficit <= 0) {
      overallRequired = 0;
      overallStatus = 'ACHIEVED';
      overallGap = 0;
    } else if (overallRemainingWeight > 0) {
      overallRequired = Math.round((deficit / overallRemainingWeight) * 10) / 10;
      const currentAvg = avgWeightedContrib / overallCompletedWeight;
      overallGap = Math.round((overallTargetVal - currentAvg) * 10) / 10;

      if (overallRequired <= 0) overallStatus = 'ACHIEVED';
      else if (overallRequired <= 75) overallStatus = 'ON_TRACK';
      else if (overallRequired <= 100) overallStatus = 'NEEDS_FOCUS';
      else overallStatus = 'NOT_REACHABLE';
    }
  }

  const overallExamScores: ExamScoreEntry[] = EXAM_ORDER.map((examId) => {
    const w = EXAM_WEIGHTS[examId];
    const exam = student.exams?.[examId];
    const overallNorm = exam ? (exam as any).overall as NormalizedValue | undefined : undefined;
    let pct: number | null = null;
    if (overallNorm?.type === 'exact' && overallNorm.value !== undefined) pct = overallNorm.value;

    return {
      examId,
      label: w.label,
      shortLabel: w.shortLabel,
      weight: w.weight,
      maxMarks: w.maxMarks,
      rawScore: pct,
      normalizedPct: pct,
      isCompleted: exam !== undefined && pct !== null,
    };
  });

  const overall: SubjectRequiredScore = {
    subjectKey: 'overall',
    subjectLabel: 'Overall Aggregate',
    subjectCode: 'ALL',
    examScores: overallExamScores,
    targetScore: overallTargetVal,
    targetDisplayValue: overallTargetDisplay,
    weightedContribution: Math.round(avgWeightedContrib * 100) / 100,
    completedWeight: overallCompletedWeight,
    remainingWeight: overallRemainingWeight,
    requiredInRemaining: overallRequired,
    status: overallStatus,
    gap: overallGap,
  };

  return { subjects: subjectResults, overall, completedExams, pendingExams };
}
