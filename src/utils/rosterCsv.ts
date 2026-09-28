import { NormalizedValue, StudentRecord, SubjectRecord } from '@/types/academic';
import { CsvCell, parseCsv } from './csv';
import { extractNumericValue, getStudentScore, getStudentStatus, getStudentTarget } from './statusEngine';

/**
 * The roster CSV format shared by the directory's "Export CSV" and the Settings import,
 * so an exported file can be edited in Excel and imported back unchanged.
 */
export const ROSTER_SUBJECTS = [
  { key: 'english', label: 'English', id: 'eng', code: 'ENG', aliases: ['eng'] },
  { key: 'secondLanguage', label: '2nd Language', id: 'lang2', code: 'LANG', aliases: ['2nd lang', 'hindi', 'second language', 'lang'] },
  { key: 'maths', label: 'Mathematics', id: 'math', code: 'MATH', aliases: ['maths', 'math'] },
  { key: 'science', label: 'Science', id: 'sci', code: 'SCI', aliases: ['sci', 'general science'] },
  { key: 'socialScience', label: 'Social Science', id: 'sst', code: 'S.ST', aliases: ['sst', 's.st'] },
  { key: 'it', label: 'Computer / IT', id: 'comp', code: 'IT', aliases: ['it', 'computer', 'information technology'] },
] as const;

export const ROSTER_CSV_HEADERS = [
  'Roll / Enrollment',
  'Name',
  'Section',
  ...ROSTER_SUBJECTS.map((s) => s.label),
  'Score %',
  'Target %',
  'Gap',
  'Status',
];

export function rosterCsvRow(s: StudentRecord, classId: string): CsvCell[] {
  const score = getStudentScore(s);
  const target = getStudentTarget(s);
  return [
    s.enrollmentNumber || s.studentId,
    s.name,
    `${classId} ${s.section || s.group}`,
    ...ROSTER_SUBJECTS.map((subj) => extractNumericValue(s.currentPerformance?.subjects?.[subj.key]) ?? ''),
    score,
    target,
    Math.round((score - target) * 10) / 10,
    getStudentStatus(s).label,
  ];
}

const COLUMN_ALIASES: Record<'roll' | 'name' | 'section' | 'score' | 'target', string[]> = {
  roll: ['roll / enrollment', 'roll no', 'roll', 'enrollment', 'enrollment number', 'admission no'],
  name: ['name', 'student', 'student name'],
  section: ['section', 'group', 'cohort'],
  score: ['score %', 'score', 'overall', 'overall %', 'mid-term %', 'percentage'],
  target: ['target %', 'target', 'school target'],
};

const normaliseHeader = (h: string) => h.trim().toLowerCase().replace(/\s+/g, ' ');

function percent(value: number): NormalizedValue {
  return { rawValue: value, type: 'exact', value, displayValue: `${value}%`, unit: 'percent' };
}

const EMPTY: NormalizedValue = { rawValue: null, type: 'empty', displayValue: '–', unit: 'percent' };

export interface RosterImportResult {
  students: StudentRecord[];
  /** Problems that block the import */
  errors: string[];
  /** Problems worth reviewing that don't block the import */
  warnings: string[];
}

/**
 * Parses and validates a roster CSV for one class. Existing students are matched by roll
 * number, then by name, so their IDs (and linked interventions) survive a re-import.
 */
export function parseRosterCsv(
  text: string,
  classId: string,
  sections: string[],
  existing: StudentRecord[],
  schoolName: string
): RosterImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const rows = parseCsv(text);
  if (rows.length < 2) return { students: [], errors: ['The file has no data rows.'], warnings };

  const headers = rows[0].map(normaliseHeader);
  const find = (aliases: readonly string[]) => headers.findIndex((h) => aliases.includes(h));
  const col = {
    roll: find(COLUMN_ALIASES.roll),
    name: find(COLUMN_ALIASES.name),
    section: find(COLUMN_ALIASES.section),
    score: find(COLUMN_ALIASES.score),
    target: find(COLUMN_ALIASES.target),
  };
  const subjectCols = ROSTER_SUBJECTS.map((subj) => find([normaliseHeader(subj.label), ...subj.aliases]));

  const missing = (['name', 'section', 'score'] as const).filter((k) => col[k] < 0);
  if (missing.length) {
    return { students: [], errors: [`Missing required column(s): ${missing.join(', ')}.`], warnings };
  }
  if (col.target < 0) warnings.push('No Target column: students will use the default target from Settings.');

  const byRoll = new Map(existing.map((s) => [s.enrollmentNumber.toLowerCase(), s]));
  const byName = new Map(existing.map((s) => [s.name.toLowerCase(), s]));
  const seenIds = new Set<string>();
  const upperSections = sections.map((s) => s.toUpperCase());
  const students: StudentRecord[] = [];

  const readNumber = (row: string[], index: number, label: string, line: number, required: boolean) => {
    const raw = (row[index] ?? '').trim().replace(/%$/, '');
    if (raw === '' || raw === '-' || raw === '–') {
      if (required) errors.push(`Row ${line}: ${label} is empty.`);
      return null;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      errors.push(`Row ${line}: ${label} "${row[index]}" is not a number from 0 to 100.`);
      return null;
    }
    return Math.round(n * 100) / 100;
  };

  rows.slice(1).forEach((row, idx) => {
    const line = idx + 2;
    const name = (row[col.name] ?? '').trim();
    if (!name) {
      errors.push(`Row ${line}: name is empty.`);
      return;
    }
    // Exports prefix the section with the class ("IX AURA"); accept both forms
    const section = (row[col.section] ?? '')
      .trim()
      .toUpperCase()
      .replace(new RegExp(`^${classId}\\s+`), '');
    if (!section) errors.push(`Row ${line}: section is empty for ${name}.`);
    else if (!upperSections.includes(section)) warnings.push(`Row ${line}: section "${section}" is not one of ${sections.join(', ')}.`);

    const score = readNumber(row, col.score, 'score', line, true);
    const target = col.target >= 0 ? readNumber(row, col.target, 'target', line, false) : null;
    const roll = col.roll >= 0 ? (row[col.roll] ?? '').trim() : '';

    const match = (roll && byRoll.get(roll.toLowerCase())) || byName.get(name.toLowerCase());
    let studentId = match?.studentId ?? `import-${classId.toLowerCase()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${line}`;
    if (seenIds.has(studentId)) {
      warnings.push(`Row ${line}: ${name} appears more than once; kept as a separate student.`);
      studentId = `${studentId}-${line}`;
    }
    seenIds.add(studentId);

    const subjectValues = ROSTER_SUBJECTS.map((subj, i) =>
      subjectCols[i] >= 0 ? readNumber(row, subjectCols[i], subj.label, line, false) : null
    );
    const subjects = Object.fromEntries(
      ROSTER_SUBJECTS.map((subj, i) => [subj.key, subjectValues[i] !== null ? percent(subjectValues[i]!) : EMPTY])
    ) as StudentRecord['currentPerformance']['subjects'];
    const subjectList: SubjectRecord[] = ROSTER_SUBJECTS.map((subj, i) => ({
      id: subj.id,
      code: subj.code,
      label: subj.label,
      normalized: subjectValues[i] !== null ? percent(subjectValues[i]!) : EMPTY,
    }));

    students.push({
      ...(match ?? {}),
      studentId,
      enrollmentNumber: roll || match?.enrollmentNumber || studentId,
      name,
      class: classId,
      group: section,
      section,
      school: match?.school ?? schoolName,
      currentPerformance: { overall: score !== null ? percent(score) : EMPTY, subjects, subjectList },
      schoolTarget: { overall: target !== null ? percent(target) : EMPTY },
      updatedAt: new Date().toISOString(),
    });
  });

  return { students, errors, warnings };
}
