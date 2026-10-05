import {
  BandId,
  ClassBandCounts,
  EXAMS,
  ExamId,
  FINE_BANDS,
  FineBandId,
  FineCounts,
  SCORE_BANDS,
  THRESHOLDS,
  type ActualDataset,
  type ActualGroup,
} from '@/data/milestoneBands';

export type BandCounts = Record<BandId, number>;

export const totalOf = (counts: BandCounts) => SCORE_BANDS.reduce((sum, band) => sum + counts[band.id], 0);

export const fineTotal = (counts: FineCounts) => FINE_BANDS.reduce((sum, band) => sum + counts[band.id], 0);

/** Roll the sheet's single bands up into the five chart bands */
export function toChartCounts(fine: FineCounts): BandCounts {
  const counts = Object.fromEntries(SCORE_BANDS.map((band) => [band.id, 0])) as BandCounts;
  for (const band of FINE_BANDS) counts[band.chartBand] += fine[band.id];
  return counts;
}

/** Students in this chart band or any higher one (SCORE_BANDS is ordered highest first) */
export function atOrAbove(counts: BandCounts, bandId: BandId) {
  let sum = 0;
  for (const band of SCORE_BANDS) {
    sum += counts[band.id];
    if (band.id === bandId) break;
  }
  return sum;
}

/** Students in this single band or any higher one, from the sheet's bands */
export function fineAtOrAbove(counts: FineCounts, through: FineBandId) {
  let sum = 0;
  for (const band of FINE_BANDS) {
    sum += counts[band.id];
    if (band.id === through) break;
  }
  return sum;
}

export const share = (value: number, total: number) => (total > 0 ? (value / total) * 100 : 0);

export const formatPct = (value: number, total: number) => `${share(value, total).toFixed(1)}%`;

export const formatCount = (value: number) => value.toLocaleString('en-IN');

/** CSS custom properties holding each band's fill / ink for the active theme (see BandThemeStyle) */
export const bandFill = (id: BandId) => `var(--band-${id})`;
export const bandInk = (id: BandId) => `var(--band-${id}-ink)`;

/** Share of a group scoring 90 or above, in percent */
export const ninetyShare = (counts: BandCounts) => share(atOrAbove(counts, 'b90'), totalOf(counts));

/** Exams this group has figures for, oldest first */
export const examsWithData = (group: ActualGroup) => EXAMS.filter((exam) => group.results[exam.id] !== undefined);

/** The subjects' results for one exam as table/chart rows (subjects without that exam are left out) */
export function subjectRows(subjects: ActualGroup[], exam: ExamId): ClassBandCounts[] {
  return subjects.flatMap((subject) => {
    const fine = subject.results[exam];
    return fine ? [{ classId: subject.id, label: subject.label, counts: toChartCounts(fine) }] : [];
  });
}

/** The row with the highest share of students at 90 or above (undefined when there are none) */
export function leaderBy90(rows: ClassBandCounts[]): ClassBandCounts | undefined {
  if (rows.length === 0) return undefined;
  return rows.reduce((best, row) => (ninetyShare(row.counts) > ninetyShare(best.counts) ? row : best));
}

/** Every figure in the dataset as CSV: one row per group and exam, the sheet's bands as columns */
export function actualDataCsv(data: ActualDataset) {
  const headers = ['Group', 'Exam', 'Students', ...FINE_BANDS.map((band) => band.label), ...THRESHOLDS.map((t) => t.label)];
  const rows = [data.wholeClass, ...data.subjects].flatMap((group) =>
    examsWithData(group).map((exam) => {
      const fine = group.results[exam.id] as FineCounts;
      return [
        group.label,
        exam.label,
        fineTotal(fine),
        ...FINE_BANDS.map((band) => fine[band.id]),
        ...THRESHOLDS.map((t) => fineAtOrAbove(fine, t.through)),
      ];
    }),
  );
  return { headers, rows };
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
