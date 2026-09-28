/**
 * Class-wise milestone score bands — the only data the dashboard reads.
 *
 * Each class lists how many students fall in each score band. No student-level data
 * lives here: replace the counts below with the real figures when they arrive.
 * Totals, percentages and the whole-school roll-up are all calculated from these counts.
 */

export type BandId = 'b95' | 'b90' | 'b80' | 'b70' | 'below70';

export interface ScoreBand {
  id: BandId;
  /** Short label for axes and table headers */
  label: string;
  /** Longer label for tooltips, legends and screen readers */
  description: string;
  /**
   * Validated ordinal blue ramp (dataviz validator, ordinal mode). Light mode: darker = higher
   * score. Dark mode: brighter = higher score.
   */
  fill: { light: string; dark: string };
  /** Text colour for labels drawn inside a fill of this band */
  ink: { light: string; dark: string };
}

const INK_ON_DARK = '#f8fafc';
const INK_ON_LIGHT = '#0b1b33';

/** Highest band first. Order drives every table column and chart bar. */
export const SCORE_BANDS: ScoreBand[] = [
  { id: 'b95', label: '95+', description: '95% and above', fill: { light: '#0d366b', dark: '#9ec5f4' }, ink: { light: INK_ON_DARK, dark: INK_ON_LIGHT } },
  { id: 'b90', label: '90-94', description: '90% to 94.9%', fill: { light: '#1c5cab', dark: '#6da7ec' }, ink: { light: INK_ON_DARK, dark: INK_ON_LIGHT } },
  { id: 'b80', label: '80-89', description: '80% to 89.9%', fill: { light: '#2a78d6', dark: '#3987e5' }, ink: { light: INK_ON_DARK, dark: INK_ON_LIGHT } },
  { id: 'b70', label: '70-79', description: '70% to 79.9%', fill: { light: '#5598e7', dark: '#256abf' }, ink: { light: INK_ON_LIGHT, dark: INK_ON_DARK } },
  { id: 'below70', label: '<70', description: 'Below 70%', fill: { light: '#86b6ef', dark: '#184f95' }, ink: { light: INK_ON_LIGHT, dark: INK_ON_DARK } },
];

export interface ClassBandCounts {
  classId: string;
  label: string;
  counts: Record<BandId, number>;
}

export interface MilestoneBandData {
  schoolName: string;
  /** Assessment / milestone the counts belong to */
  milestone: string;
  academicYear: string;
  /** ISO date the figures were last updated */
  updatedOn: string;
  /** True while the figures below are placeholders */
  isSample: boolean;
  classes: ClassBandCounts[];
}

// Placeholder counts — to be replaced with the real figures.
export const MILESTONE_BAND_DATA: MilestoneBandData = {
  schoolName: 'Central Public School',
  milestone: 'Half-Yearly Examination',
  academicYear: '2026-27',
  updatedOn: '2026-09-28',
  isSample: true,
  classes: [
    { classId: 'VI', label: 'Class VI', counts: { b95: 18, b90: 31, b80: 58, b70: 44, below70: 29 } },
    { classId: 'VII', label: 'Class VII', counts: { b95: 14, b90: 27, b80: 61, b70: 52, below70: 41 } },
    { classId: 'VIII', label: 'Class VIII', counts: { b95: 11, b90: 22, b80: 57, b70: 63, below70: 57 } },
    { classId: 'IX', label: 'Class IX', counts: { b95: 9, b90: 21, b80: 48, b70: 46, below70: 36 } },
    { classId: 'X', label: 'Class X', counts: { b95: 16, b90: 29, b80: 52, b70: 38, below70: 25 } },
    { classId: 'XI', label: 'Class XI', counts: { b95: 7, b90: 15, b80: 34, b70: 41, below70: 33 } },
    { classId: 'XII', label: 'Class XII', counts: { b95: 12, b90: 19, b80: 36, b70: 30, below70: 23 } },
  ],
};
