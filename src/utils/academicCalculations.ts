import { NormalizedValue, StudentRecord, Milestone, OverallHealthMetrics } from '@/types/academic';
import { getStudentScore, getStudentStatus, getStudentTarget } from './statusEngine';

export interface PerformanceBucket {
  label: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
  color: string;
}

export interface SubjectMetric {
  key: string;
  name: string;
  code: string;
  average: number;
  targetAvg: number;
  gap: number;
  highest: number;
  lowest: number;
  color: string;
}

/**
 * Requirement #34: Centralized calculation utilities
 */

export function calculateAverage(numbers: number[]): number {
  if (!numbers.length) return 0;
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  return Math.round((sum / numbers.length) * 10) / 10;
}

export function calculateTargetGap(actual: number, target: number): number {
  return Math.round((actual - target) * 10) / 10;
}

export function calculatePerformanceDistribution(students: StudentRecord[]): PerformanceBucket[] {
  const buckets: PerformanceBucket[] = [
    { label: '95%+', min: 95, max: 100, count: 0, percentage: 0, color: '#10B981' },
    { label: '90–94%', min: 90, max: 94.99, count: 0, percentage: 0, color: '#3B82F6' },
    { label: '80–89%', min: 80, max: 89.99, count: 0, percentage: 0, color: '#2563EB' },
    { label: '70–79%', min: 70, max: 79.99, count: 0, percentage: 0, color: '#F59E0B' },
    { label: '60–69%', min: 60, max: 69.99, count: 0, percentage: 0, color: '#F97316' },
    { label: '<60%', min: 0, max: 59.99, count: 0, percentage: 0, color: '#EF4444' },
  ];

  if (!students.length) return buckets;

  students.forEach((s) => {
    // Current performance overall value or mid-term overall
    const val = s.currentPerformance?.overall?.value ?? 0;
    for (const b of buckets) {
      if (val >= b.min && val <= b.max) {
        b.count++;
        break;
      }
    }
  });

  buckets.forEach((b) => {
    b.percentage = Math.round((b.count / students.length) * 100);
  });

  return buckets;
}

export function calculateSubjectSummary(students: StudentRecord[]): SubjectMetric[] {
  const subjectDefs = [
    { key: 'english', name: 'English', code: 'ENG', color: '#3B82F6' },
    { key: 'secondLanguage', name: 'Hindi / 2nd Lang', code: 'LANG', color: '#8B5CF6' },
    { key: 'maths', name: 'Mathematics', code: 'MATH', color: '#10B981' },
    { key: 'science', name: 'Science', code: 'SCI', color: '#F97316' },
    { key: 'socialScience', name: 'Social Science', code: 'SST', color: '#EF4444' },
    { key: 'it', name: 'Computer / IT', code: 'IT', color: '#06B6D4' },
  ];

  // Subject targets are rarely recorded; fall back to the class's mean overall target
  const classTargetAvg = calculateAverage(students.map(getStudentTarget));

  return subjectDefs.map((def) => {
    const actualScores: number[] = [];
    const targetScores: number[] = [];

    students.forEach((s) => {
      const subj = (s.currentPerformance?.subjects as any)?.[def.key];
      if (subj?.value !== undefined && typeof subj.value === 'number') {
        actualScores.push(subj.value);
      }
      const tgt = (s.schoolTarget?.subjects as any)?.[def.key];
      if (tgt?.value !== undefined && typeof tgt.value === 'number') {
        targetScores.push(tgt.value);
      }
    });

    const avg = calculateAverage(actualScores);
    const tgtAvg = targetScores.length ? calculateAverage(targetScores) : classTargetAvg;
    const highest = actualScores.length ? Math.max(...actualScores) : 0;
    const lowest = actualScores.length ? Math.min(...actualScores) : 0;

    return {
      key: def.key,
      name: def.name,
      code: def.code,
      average: avg,
      targetAvg: tgtAvg,
      gap: calculateTargetGap(avg, tgtAvg),
      highest,
      lowest,
      color: def.color,
    };
  });
}

export function calculateClassSummary(students: StudentRecord[]) {
  const total = students.length;
  if (!total) {
    return {
      totalStudents: 0,
      onTrackCount: 0,
      onTrackPct: 0,
      atRiskCount: 0,
      atRiskPct: 0,
      criticalCount: 0,
      criticalPct: 0,
      targetAchievedCount: 0,
      targetAchievedPct: 0,
      classAverage: 0,
      targetAverage: 0,
    };
  }

  let onTrack = 0;
  let atRisk = 0;
  let critical = 0;
  let achieved = 0;
  const actualScores: number[] = [];
  const targetScores: number[] = [];

  // Status buckets are mutually exclusive, so the four counts sum to the total
  students.forEach((s) => {
    actualScores.push(getStudentScore(s));
    targetScores.push(getStudentTarget(s));

    const status = getStudentStatus(s).status;
    if (status === 'ACHIEVED') achieved++;
    else if (status === 'ON_TRACK') onTrack++;
    else if (status === 'WATCH' || status === 'INTERVENTION') atRisk++;
    else if (status === 'CRITICAL') critical++;
  });

  return {
    totalStudents: total,
    onTrackCount: onTrack,
    onTrackPct: Math.round((onTrack / total) * 100),
    atRiskCount: atRisk,
    atRiskPct: Math.round((atRisk / total) * 100),
    criticalCount: critical,
    criticalPct: Math.round((critical / total) * 100),
    targetAchievedCount: achieved,
    targetAchievedPct: Math.round((achieved / total) * 100),
    classAverage: calculateAverage(actualScores),
    targetAverage: calculateAverage(targetScores),
  };
}

export function calculateOverallMilestoneHealth(
  students: StudentRecord[],
  interventionsClosedCount = 14,
  totalInterventions = 23,
  fmsCompletedSteps = 3,
  totalFmsSteps = 7
): OverallHealthMetrics {
  const summary = calculateClassSummary(students);
  // "On track" for health purposes includes students who have already met target
  const studentsOnTrackPct = summary.onTrackPct + summary.targetAchievedPct;
  const targetAchievementPct = summary.targetAchievedPct;
  const targetProgress = summary.targetAverage
    ? Math.min(100, Math.round((summary.classAverage / summary.targetAverage) * 100))
    : 0;
  const interventionsClosedPct = totalInterventions ? Math.round((interventionsClosedCount / totalInterventions) * 100) : 0;
  const fmsCompletionPct = totalFmsSteps ? Math.round((fmsCompletedSteps / totalFmsSteps) * 100) : 0;

  // Composite health score. Components with no underlying records (no interventions logged,
  // no FMS workflow) are left out and the remaining weights rescaled, rather than scoring 0.
  const components = [
    { weight: 0.3, value: targetProgress, available: summary.totalStudents > 0 },
    { weight: 0.25, value: studentsOnTrackPct, available: summary.totalStudents > 0 },
    { weight: 0.2, value: targetAchievementPct, available: summary.totalStudents > 0 },
    { weight: 0.15, value: interventionsClosedPct, available: totalInterventions > 0 },
    { weight: 0.1, value: fmsCompletionPct, available: totalFmsSteps > 0 },
  ].filter((c) => c.available);
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const healthScore = totalWeight
    ? Math.round(components.reduce((sum, c) => sum + c.weight * c.value, 0) / totalWeight)
    : 0;

  return {
    healthScore,
    targetProgress,
    studentsOnTrackPct,
    targetAchievementPct,
    interventionsClosedPct,
    fmsCompletionPct,
  };
}

export function calculateRequiredScore(
  currentScore: number,
  targetScore: number,
  remainingWeight = 0.70
): { required: number | null; isAchievable: boolean; message: string } {
  if (currentScore >= targetScore) {
    return {
      required: 0,
      isAchievable: true,
      message: 'Target already achieved based on current performance.',
    };
  }

  const completedWeight = 1.0 - remainingWeight;
  const currentWeighted = currentScore * completedWeight;
  const deficit = targetScore - currentWeighted;
  const req = Math.round((deficit / remainingWeight) * 10) / 10;

  if (req > 100) {
    return {
      required: req,
      isAchievable: false,
      message: `Requires ${req}% in remaining exams, which exceeds 100%. Target adjustment recommended.`,
    };
  }

  return {
    required: req,
    isAchievable: true,
    message: `Student needs an average of ${req}% across remaining assessments to achieve ${targetScore}%.`,
  };
}
