export interface NormalizedValue {
  rawValue: string | number | null;
  type: 'exact' | 'range' | 'exempt' | 'empty' | 'invalid';
  displayValue: string;
  value?: number;
  min?: number;
  max?: number;
  unit: 'percent' | 'marks';
  statusNote?: string;
}

export interface SubjectRecord {
  id: string;
  code: string;
  label: string;
  normalized: NormalizedValue;
}

export interface ExamEntry {
  id: string; // 'exam-1', 'exam-2', etc.
  label: string; // 'Exam-1 (Baseline)', 'Exam-2 (Mid Term)', etc.
  maxMarksPerSubject: number; // 100 or 20
  overall: NormalizedValue;
  totalMarksScored?: number;
  totalMarks?: number;
  totalMaxMarks?: number;
  secondLanguageTaken: 'Hindi' | 'Sanskrit' | 'French';
  subjects: {
    english: NormalizedValue;
    secondLanguage: NormalizedValue;
    maths: NormalizedValue;
    science: NormalizedValue;
    socialScience: NormalizedValue;
    it: NormalizedValue;
  };
  subjectList: SubjectRecord[];
}

export interface StudentRecord {
  studentId: string;
  enrollmentNumber: string;
  name: string;
  class: 'IX';
  group: 'AURA' | 'ZEN' | 'NEO';
  school: string;
  secondLanguage?: 'Hindi' | 'Sanskrit' | 'French';
  currentPerformance: {
    overall: NormalizedValue;
    subjects: {
      english: NormalizedValue;
      maths: NormalizedValue;
      socialScience: NormalizedValue;
      secondLanguage: NormalizedValue;
      science: NormalizedValue;
      it: NormalizedValue;
    };
    subjectList: SubjectRecord[];
  };
  schoolTarget: {
    overall: NormalizedValue;
    subjects?: {
      english: NormalizedValue;
      maths: NormalizedValue;
      socialScience: NormalizedValue;
      secondLanguage: NormalizedValue;
      science: NormalizedValue;
      it: NormalizedValue;
    };
    targetStatus: 'NOT_ASSIGNED' | 'ACHIEVED' | 'IN_PROGRESS' | 'RANGE_UNCERTAIN';
    gapPercentagePoints?: number;
    gapDescription?: string;
  };
  exams?: Record<string, ExamEntry>;
  examOrder?: string[];
  source: {
    sheetName: string;
    sourceRow: number;
    serialNo: number;
    lastSyncedAt: string;
  };
  updatedAt: string;
}

export function slugifyStudentName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateStudentId(group: string, name: string): string {
  const cleanGroup = group.toLowerCase().replace(/^ix-?/, '');
  const cleanName = slugifyStudentName(name);
  return `ccis-ix-${cleanGroup}-${cleanName}`;
}

export function generateEnrollmentNumber(group: string, serialNo: number): string {
  const cleanGroup = group.toUpperCase().replace(/^IX-?/, '');
  const sNoStr = String(serialNo).padStart(2, '0');
  return `CCIS-IX-${cleanGroup}-${sNoStr}`;
}

export function parsePerformanceValue(
  raw: any,
  isPercentageField = false
): NormalizedValue {
  if (raw === null || raw === undefined) {
    return {
      rawValue: null,
      type: 'empty',
      displayValue: isPercentageField ? 'Not Assigned' : 'Pending',
      unit: 'percent',
      statusNote: 'Data pending entry',
    };
  }

  // Handle strings
  if (typeof raw === 'string') {
    const trimmed = raw.trim();

    if (trimmed === '' || trimmed.toLowerCase() === 'n/a' || trimmed.toLowerCase() === 'null') {
      return {
        rawValue: raw,
        type: 'empty',
        displayValue: isPercentageField ? 'Not Assigned' : 'Pending',
        unit: 'percent',
        statusNote: 'Data pending entry',
      };
    }

    if (trimmed === '-' || trimmed.toLowerCase() === 'exempt' || trimmed.toLowerCase() === 'na') {
      return {
        rawValue: raw,
        type: 'exempt',
        displayValue: 'Exempt (-)',
        unit: 'percent',
        statusNote: 'Subject exempted / not opted',
      };
    }

    // Clean common typos like "85%%" or multiple % signs
    const cleanedString = trimmed.replace(/%+$/, '%').trim();

    // Check for range patterns: "65-70", "65 - 70", "85-90%", "69-89"
    const rangeMatch = cleanedString.match(/^(\d+(?:\.\d+)?)\s*[-–—/]\s*(\d+(?:\.\d+)?)\s*%?$/);
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[2]);
      if (!isNaN(min) && !isNaN(max)) {
        const lower = Math.min(min, max);
        const upper = Math.max(min, max);
        return {
          rawValue: raw,
          type: 'range',
          min: lower,
          max: upper,
          displayValue: `${lower}–${upper}%`,
          unit: 'percent',
          statusNote: `Range: ${lower}% to ${upper}%`,
        };
      }
    }

    // Check for single percentage: "85%", "75.5%"
    const singlePercentMatch = cleanedString.match(/^(\d+(?:\.\d+)?)\s*%$/);
    if (singlePercentMatch) {
      const val = parseFloat(singlePercentMatch[1]);
      if (!isNaN(val)) {
        return {
          rawValue: raw,
          type: 'exact',
          value: val,
          displayValue: `${val}%`,
          unit: 'percent',
        };
      }
    }

    // Attempt plain number parse from string
    const num = parseFloat(cleanedString);
    if (!isNaN(num)) {
      // If overall % or target is formatted as decimal fraction (0.85 = 85%)
      if (num > 0 && num <= 1.0) {
        const pct = Math.round(num * 10000) / 100;
        return {
          rawValue: raw,
          type: 'exact',
          value: pct,
          displayValue: `${pct}%`,
          unit: 'percent',
        };
      }

      return {
        rawValue: raw,
        type: 'exact',
        value: num,
        displayValue: `${num}%`,
        unit: 'percent',
      };
    }

    return {
      rawValue: raw,
      type: 'invalid',
      displayValue: raw,
      unit: 'percent',
      statusNote: 'Unrecognized format',
    };
  }

  // Handle numbers
  if (typeof raw === 'number') {
    if (isNaN(raw)) {
      return {
        rawValue: raw,
        type: 'invalid',
        displayValue: 'NaN',
        unit: 'percent',
        statusNote: 'Invalid number',
      };
    }

    // Check if decimal fraction representing percentage (0.85 = 85%, 0.9828 = 98.28%, 1.0 = 100%)
    if (raw > 0 && raw <= 1.0) {
      const pct = Math.round(raw * 10000) / 100;
      return {
        rawValue: raw,
        type: 'exact',
        value: pct,
        displayValue: `${pct}%`,
        unit: 'percent',
      };
    }

    // Standard percentage / score
    const rounded = Math.round(raw * 100) / 100;
    return {
      rawValue: raw,
      type: 'exact',
      value: rounded,
      displayValue: `${rounded}%`,
      unit: 'percent',
    };
  }

  return {
    rawValue: raw,
    type: 'invalid',
    displayValue: String(raw),
    unit: 'percent',
    statusNote: 'Unsupported data type',
  };
}

/** Exam weightage breakdown (must sum to 1.0) */
export const EXAM_WEIGHTS: Record<string, { weight: number; label: string; shortLabel: string; maxMarks: number }> = {
  'exam-1': { weight: 0.10, label: 'PT-1 (Baseline)', shortLabel: 'E1', maxMarks: 100 },
  'exam-2': { weight: 0.20, label: 'Mid Term', shortLabel: 'E2', maxMarks: 20 },
  'exam-3': { weight: 0.10, label: 'PT-2', shortLabel: 'E3', maxMarks: 100 },
  'exam-4': { weight: 0.20, label: 'Pre-Board', shortLabel: 'E4', maxMarks: 100 },
  'exam-5': { weight: 0.40, label: 'Final Term', shortLabel: 'E5', maxMarks: 100 },
};

export const EXAM_ORDER = ['exam-1', 'exam-2', 'exam-3', 'exam-4', 'exam-5'];

