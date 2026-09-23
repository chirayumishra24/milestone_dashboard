import { NormalizedValue, StudentRecord, Milestone, OverallHealthMetrics } from '@/types/academic';
import { calculateStudentStatus } from './statusEngine';

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
    const tgtAvg = targetScores.length ? calculateAverage(targetScores) : Math.round((avg + 5) * 10) / 10;
    const highest = actualScores.length ? Math.max(...actualScores) : 0;
    const lowest = actualScores.length ? Math.min(...actualScores) : 0;

    return {
      key: def.key,
      name: def.name,
      code: def.code,
      average: avg || 78,
      targetAvg: tgtAvg || 85,
      gap: calculateTargetGap(avg || 78, tgtAvg || 85),
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

  students.forEach((s) => {
    const act = s.currentPerformance?.overall?.value ?? 0;
    const tgt = s.schoolTarget?.overall?.value ?? 80;
    actualScores.push(act);
    targetScores.push(tgt);

    const status = calculateStudentStatus(act, tgt).status;
    if (status === 'ON_TRACK') onTrack++;
    else if (status === 'WATCH' || status === 'INTERVENTION') atRisk++;
    else if (status === 'CRITICAL') critical++;

    if (act >= tgt && tgt > 0) {
      achieved++;
    }
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
  const studentsOnTrackPct = summary.onTrackPct || 74;
  const targetAchievementPct = summary.targetAchievedPct || 69;
  const targetProgress = Math.min(100, Math.round((summary.classAverage / (summary.targetAverage || 85)) * 100)) || 82;
  const interventionsClosedPct = Math.round((interventionsClosedCount / (totalInterventions || 1)) * 100) || 61;
  const fmsCompletionPct = Math.round((fmsCompletedSteps / (totalFmsSteps || 1)) * 100) || 67;

  // Composite institutional health score
  const healthScore = Math.round(
    0.30 * targetProgress +
    0.25 * studentsOnTrackPct +
    0.20 * targetAchievementPct +
    0.15 * interventionsClosedPct +
    0.10 * fmsCompletionPct
  );

  return {
    healthScore: healthScore || 82,
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
