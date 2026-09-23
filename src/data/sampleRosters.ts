import { NormalizedValue, StudentRecord, SubjectRecord } from '@/types/academic';
import { ClassProfile } from './schoolClassesData';
import { DEFAULT_THRESHOLDS } from '@/utils/statusEngine';

/**
 * Generates placeholder rosters for grades that have no official records yet.
 * Output is deterministic per class (seeded by classId), so the same students appear
 * on every load and across pages. Scores are drawn in three bands so the roster's
 * status mix and mean follow the class's SampleRosterProfile.
 */

const FIRST_NAMES_F = [
  'AADYA', 'ANANYA', 'AVNI', 'DIYA', 'ISHITA', 'KAVYA', 'KIARA', 'MEERA', 'MYRA', 'NAINA',
  'NAVYA', 'PRIYA', 'RIYA', 'SAANVI', 'SARA', 'SHREYA', 'SIYA', 'TANVI', 'TARA', 'VANYA',
];
const FIRST_NAMES_M = [
  'AARAV', 'ADITYA', 'ARJUN', 'ARNAV', 'AYAAN', 'DHRUV', 'ISHAAN', 'KABIR', 'KRISH', 'MOHIT',
  'NIKHIL', 'PARTH', 'RAHUL', 'REYANSH', 'ROHAN', 'SAMAR', 'SHAURYA', 'VED', 'VIHAAN', 'YASH',
];
const SURNAMES = [
  'AGARWAL', 'BANSAL', 'BHATIA', 'CHOPRA', 'DAS', 'GUPTA', 'IYER', 'JAIN', 'KAPOOR', 'KHANNA',
  'MALHOTRA', 'MEHTA', 'MISHRA', 'NAIR', 'PANDEY', 'PATEL', 'RAO', 'REDDY', 'SAXENA', 'SEN',
  'SETHI', 'SHARMA', 'SINGH', 'SINHA', 'TIWARI', 'VERMA',
];

const SUBJECTS: { key: keyof StudentRecord['currentPerformance']['subjects']; id: string; code: string; label: string }[] = [
  { key: 'english', id: 'eng', code: 'ENG', label: 'English Language & Lit' },
  { key: 'secondLanguage', id: 'lang2', code: 'HIN', label: '2nd Lang: Hindi' },
  { key: 'maths', id: 'math', code: 'MATH', label: 'Mathematics' },
  { key: 'science', id: 'sci', code: 'SCI', label: 'General Science' },
  { key: 'socialScience', id: 'sst', code: 'S.ST', label: 'Social Science' },
  { key: 'it', id: 'comp', code: 'IT', label: 'Computer / IT' },
];

/** mulberry32: small, fast, seedable PRNG */
function createRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function percent(value: number): NormalizedValue {
  return { rawValue: value, type: 'exact', value, displayValue: `${value}%`, unit: 'percent' };
}

/**
 * Nudges scores so their mean approaches `targetMean` while staying inside [min, max].
 * A few passes are enough because clamping only affects the band edges.
 */
function tuneMean(scores: number[], targetMean: number, min: number, max: number): number[] {
  let tuned = [...scores];
  for (let pass = 0; pass < 6 && tuned.length; pass++) {
    const mean = tuned.reduce((a, b) => a + b, 0) / tuned.length;
    const shift = targetMean - mean;
    if (Math.abs(shift) < 0.05) break;
    tuned = tuned.map((s) => clamp(s + shift, min, max));
  }
  return tuned.map(round1);
}

export function generateSampleRoster(profile: ClassProfile): StudentRecord[] {
  const sample = profile.sample;
  if (!sample) return [];

  const random = createRandom(hashString(profile.classId));
  const between = (min: number, max: number) => min + random() * (max - min);
  const pick = <T,>(list: T[]) => list[Math.floor(random() * list.length)];

  const { totalStudents, classAverage, targetAvg, atRiskCount, criticalCount } = sample;
  const upperCount = Math.max(0, totalStudents - atRiskCount - criticalCount);

  const critical = Array.from({ length: criticalCount }, () => round1(between(42, 59.4)));
  const atRisk = Array.from({ length: atRiskCount }, () => round1(between(60, 69.4)));

  // Mean the upper band needs so the whole roster averages classAverage
  const lowerSum = [...critical, ...atRisk].reduce((a, b) => a + b, 0);
  const upperMean = upperCount ? (classAverage * totalStudents - lowerSum) / upperCount : 0;
  const upper = tuneMean(
    Array.from({ length: upperCount }, () => upperMean + (random() + random() + random() - 1.5) * 12),
    upperMean,
    70,
    99.5
  );

  // Shuffle so bands are spread across sections
  const scores = [...critical, ...atRisk, ...upper];
  for (let i = scores.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [scores[i], scores[j]] = [scores[j], scores[i]];
  }

  return scores.map((overall, idx) => {
    const section = profile.sections[idx % profile.sections.length];
    const isFemale = random() < 0.5;
    const name = `${pick(isFemale ? FIRST_NAMES_F : FIRST_NAMES_M)} ${pick(SURNAMES)}`;

    // Targets track ability closely, so stronger students have higher targets. The floor keeps
    // At Risk and Critical students from "meeting" an unrealistically low target.
    const target = clamp(
      Math.round(targetAvg + (overall - classAverage) * 0.8 + between(-5, 5)),
      DEFAULT_THRESHOLDS.onTrackCutoff,
      100
    );

    // Subject offsets are centred on zero so subjects average to the overall score
    const offsets = SUBJECTS.map(() => between(-9, 9));
    const offsetMean = offsets.reduce((a, b) => a + b, 0) / offsets.length;
    const subjectScores = offsets.map((o) => round1(clamp(overall + o - offsetMean, 0, 100)));

    const subjects = Object.fromEntries(
      SUBJECTS.map((subj, i) => [subj.key, percent(subjectScores[i])])
    ) as StudentRecord['currentPerformance']['subjects'];

    const subjectList: SubjectRecord[] = SUBJECTS.map((subj, i) => ({
      id: subj.id,
      code: subj.code,
      label: subj.label,
      normalized: percent(subjectScores[i]),
    }));

    const serial = String(idx + 1).padStart(3, '0');
    return {
      studentId: `sample-${profile.classId.toLowerCase()}-${section.toLowerCase()}-${serial}`,
      enrollmentNumber: `SAMPLE/${profile.classId}/${serial}`,
      name,
      class: profile.classId,
      group: section,
      section,
      school: 'SAMPLE',
      gender: isFemale ? 'F' : 'M',
      secondLanguage: 'Hindi',
      currentPerformance: { overall: percent(overall), subjects, subjectList },
      schoolTarget: { overall: percent(target) },
    };
  });
}
