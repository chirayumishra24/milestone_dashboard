/**
 * Static metadata for each grade. Performance figures (averages, status counts, health)
 * are never stored here: they are calculated from each class roster by the API service.
 *
 * Only Class IX has an official roster. Other grades use generated sample rosters whose
 * shape follows the `sample` profile below until their real records are imported.
 */

export const SCHOOL_INFO = {
  schoolName: 'Central City International School (CCIS)',
  academicYear: '2026 – 2027',
  academicSession: 'AY 2026 – 2027',
  affiliationNo: 'CBSE / AFF / 2130842',
};

export interface SampleRosterProfile {
  totalStudents: number;
  /** Mean overall score the generated roster is tuned to */
  classAverage: number;
  /** Mean individual target */
  targetAvg: number;
  /** Students generated in the At Risk band */
  atRiskCount: number;
  /** Students generated in the Critical band */
  criticalCount: number;
}

export interface ClassProfile {
  classId: string;
  code: string;
  label: string;
  sections: string[];
  coordinator: string;
  milestoneStatus: string;
  dataSource: 'official' | 'sample';
  /** Whether the grade runs the milestone journey and FMS exam workflow (Class IX only so far) */
  hasMilestoneProgramme: boolean;
  sample?: SampleRosterProfile;
}

export const CLASS_PROFILES: ClassProfile[] = [
  {
    classId: 'VI',
    code: 'VI',
    label: 'Class VI',
    sections: ['RUBY', 'EMERALD', 'SAPPHIRE'],
    coordinator: 'Mrs. Rekha Joshi',
    milestoneStatus: 'Half-Yearly Consolidated',
    dataSource: 'sample',
    hasMilestoneProgramme: false,
    sample: { totalStudents: 180, classAverage: 84.2, targetAvg: 80.0, atRiskCount: 26, criticalCount: 6 },
  },
  {
    classId: 'VII',
    code: 'VII',
    label: 'Class VII',
    sections: ['ORION', 'PEGASUS', 'PHOENIX'],
    coordinator: 'Mr. Arvind Gupta',
    milestoneStatus: 'Periodic Test 2 Conducted',
    dataSource: 'sample',
    hasMilestoneProgramme: false,
    sample: { totalStudents: 195, classAverage: 81.0, targetAvg: 80.0, atRiskCount: 35, criticalCount: 8 },
  },
  {
    classId: 'VIII',
    code: 'VIII',
    label: 'Class VIII',
    sections: ['TITAN', 'ATLAS', 'CRONUS'],
    coordinator: 'Mrs. Priya Nair',
    milestoneStatus: 'Remedial Review Active',
    dataSource: 'sample',
    hasMilestoneProgramme: false,
    sample: { totalStudents: 210, classAverage: 77.5, targetAvg: 80.0, atRiskCount: 48, criticalCount: 13 },
  },
  {
    classId: 'IX',
    code: 'IX',
    label: 'Class IX (Current Cohort)',
    sections: ['AURA', 'ZEN', 'NEO'],
    coordinator: 'Mr. Rajesh K. Sharma',
    milestoneStatus: 'Mid-Term Examination Prep (Gate 4)',
    dataSource: 'official',
    hasMilestoneProgramme: true,
  },
  {
    classId: 'X',
    code: 'X',
    label: 'Class X (Board Cohort)',
    sections: ['EXCEL', 'PRIME', 'ZENITH'],
    coordinator: 'Dr. Sunita Sen',
    milestoneStatus: 'Pre-Board Blueprint Vetted',
    dataSource: 'sample',
    hasMilestoneProgramme: false,
    sample: { totalStudents: 155, classAverage: 83.5, targetAvg: 85.0, atRiskCount: 25, criticalCount: 6 },
  },
  {
    classId: 'XI',
    code: 'XI',
    label: 'Class XI',
    sections: ['SCIENCE', 'COMMERCE', 'HUMANITIES'],
    coordinator: 'Mr. V. Ramanathan',
    milestoneStatus: 'Term 1 Marks Reconciled',
    dataSource: 'sample',
    hasMilestoneProgramme: false,
    sample: { totalStudents: 140, classAverage: 76.8, targetAvg: 78.0, atRiskCount: 30, criticalCount: 8 },
  },
  {
    classId: 'XII',
    code: 'XII',
    label: 'Class XII (Senior Board)',
    sections: ['SCIENCE', 'COMMERCE', 'HUMANITIES'],
    coordinator: 'Mrs. Ananya Mukherji',
    milestoneStatus: 'Pre-Board Mock Series 1',
    dataSource: 'sample',
    hasMilestoneProgramme: false,
    sample: { totalStudents: 130, classAverage: 85.1, targetAvg: 86.0, atRiskCount: 16, criticalCount: 5 },
  },
];

/** Suggested remedial action per subject, used for the consolidated report's priority areas */
export const SUBJECT_REMEDIAL_ACTIONS: Record<string, string> = {
  english: 'Structured writing workshops and grammar editing drills',
  secondLanguage: 'Vocabulary and comprehension practice with weekly reviews',
  maths: 'Bi-weekly remedial problem-solving modules with mentor reviews',
  science: 'Concept reinforcement drills and numerical tutorials',
  socialScience: 'Map work and source-based question practice',
  it: 'Hands-on lab practice sessions',
};
