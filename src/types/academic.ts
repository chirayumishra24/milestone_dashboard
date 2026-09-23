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

export type StudentStatus = 'ACHIEVED' | 'ON_TRACK' | 'WATCH' | 'INTERVENTION' | 'CRITICAL';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SubjectRecord {
  id: string;
  code: string;
  label: string;
  normalized: NormalizedValue;
}

export interface ExamEntry {
  id: string;
  label: string;
  maxMarksPerSubject: number;
  overall: NormalizedValue;
  totalMarksScored?: number;
  totalMarks?: string | number;
  totalMaxMarks?: number;
  secondLanguageTaken?: 'Hindi' | 'Sanskrit' | 'French';
  subjects: {
    english: NormalizedValue;
    secondLanguage: NormalizedValue;
    maths: NormalizedValue;
    science: NormalizedValue;
    socialScience: NormalizedValue;
    it: NormalizedValue;
  };
  subjectList?: SubjectRecord[];
}

export interface StudentRecord {
  studentId: string;
  enrollmentNumber: string;
  name: string;
  /** Grade code, e.g. 'IX' */
  class: string;
  /** Section name within the grade, e.g. 'AURA' for Class IX or 'RUBY' for Class VI */
  group: string;
  section?: string;
  school: string;
  gender?: string;
  secondLanguage?: 'Hindi' | 'Sanskrit' | 'French';
  currentPerformance: {
    overall: NormalizedValue;
    subjects: {
      english: NormalizedValue;
      secondLanguage: NormalizedValue;
      maths: NormalizedValue;
      science: NormalizedValue;
      socialScience: NormalizedValue;
      it: NormalizedValue;
    };
    subjectList: SubjectRecord[];
  };
  schoolTarget: {
    overall: NormalizedValue;
    subjects?: {
      english?: NormalizedValue;
      secondLanguage?: NormalizedValue;
      maths?: NormalizedValue;
      science?: NormalizedValue;
      socialScience?: NormalizedValue;
      it?: NormalizedValue;
    };
    targetStatus?: 'NOT_ASSIGNED' | 'ACHIEVED' | 'IN_PROGRESS' | 'RANGE_UNCERTAIN';
    gapPercentagePoints?: number;
    gapDescription?: string;
  };
  exams?: Record<string, ExamEntry>;
  examOrder?: string[];
  calculatedStatus?: StudentStatus;
  gap?: number;
  priority?: PriorityLevel;
  interventions?: InterventionRecord[];
  source?: {
    sheetName: string;
    sourceRow: number;
    serialNo: number;
    lastSyncedAt: string;
  };
  updatedAt?: string;
  remarks?: string;
}

export interface Milestone {
  id: string;
  name: string;
  stageLabel: string;
  subtitle: string;
  type: 'baseline' | 'target' | 'actual';
  targetAvg: number;
  actualAvg?: number;
  difference?: number;
  status: 'completed' | 'current' | 'upcoming';
  studentsOnTrackCount: number;
  totalStudents: number;
  dateRange: string;
  weight: number;
}

export interface FMSWorkflowStep {
  id: string;
  stepNumber: number;
  stepName: string;
  status: 'Completed' | 'In Progress' | 'Upcoming' | 'Delayed';
  date: string;
  owner: string;
  remarks: string;
}

export interface InterventionRecord {
  id: string;
  /** Grade the intervention belongs to; records without it are Class IX */
  classId?: string;
  studentId: string;
  studentName: string;
  section: string;
  subject: string;
  currentPerformance: number;
  target: number;
  gap: number;
  reason: string;
  assignedTeacher: string;
  strategy: string;
  createdDate: string;
  reviewDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  remarks: string;
}

export interface OverallHealthMetrics {
  healthScore: number;
  targetProgress: number;
  studentsOnTrackPct: number;
  targetAchievementPct: number;
  interventionsClosedPct: number;
  fmsCompletionPct: number;
}

export interface ClassSummary {
  classId: string;
  code: string;
  label: string;
  totalStudents: number;
  classAverage: number;
  targetAvg: number;
  gap: number;
  onTrackCount: number;
  onTrackPct: number;
  atRiskCount: number;
  atRiskPct: number;
  criticalCount: number;
  criticalPct: number;
  sections: string[];
  coordinator: string;
  milestoneStatus: string;
  /** 'official' rosters come from school records; 'sample' rosters are generated placeholders */
  dataSource: 'official' | 'sample';
  /** Whether the grade runs the milestone journey and FMS exam workflow */
  hasMilestoneProgramme: boolean;
}

export interface SchoolOverviewMetrics {
  schoolName: string;
  academicYear: string;
  totalSchoolStudents: number;
  overallSchoolAverage: number;
  schoolTargetAverage: number;
  targetAchievementPct: number;
  studentsOnTrackCount: number;
  studentsOnTrackPct: number;
  totalCriticalCount: number;
  totalCriticalPct: number;
  schoolHealthIndex: number;
  activeExamsCount: number;
  classes: ClassSummary[];
}

export interface SchoolConsolidatedReport {
  generatedDate: string;
  academicSession: string;
  schoolName: string;
  affiliationNo: string;
  executiveSummary: string;
  overview: SchoolOverviewMetrics;
  topPerformingClasses: string[];
  priorityInterventionAreas: {
    grade: string;
    subject: string;
    gap: number;
    actionRequired: string;
  }[];
}

