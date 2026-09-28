import { BandId, ClassBandCounts, SCORE_BANDS } from '@/data/milestoneBands';

export type BandCounts = Record<BandId, number>;

export const totalOf = (counts: BandCounts) => SCORE_BANDS.reduce((sum, band) => sum + counts[band.id], 0);

/** Sum every class into one whole-school set of band counts */
export function sumCounts(classes: ClassBandCounts[]): BandCounts {
  const total = Object.fromEntries(SCORE_BANDS.map((band) => [band.id, 0])) as BandCounts;
  for (const cls of classes) {
    for (const band of SCORE_BANDS) total[band.id] += cls.counts[band.id];
  }
  return total;
}

/** Students in this band or any higher band (SCORE_BANDS is ordered highest first) */
export function atOrAbove(counts: BandCounts, bandId: BandId) {
  let sum = 0;
  for (const band of SCORE_BANDS) {
    sum += counts[band.id];
    if (band.id === bandId) break;
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

/** The class with the highest share of students at 90 or above (undefined when there are no classes) */
export function leaderBy90(classes: ClassBandCounts[]): ClassBandCounts | undefined {
  if (classes.length === 0) return undefined;
  return classes.reduce((best, cls) => (ninetyShare(cls.counts) > ninetyShare(best.counts) ? cls : best));
}

/** Header and rows for the class-wise CSV export, whole school as the last row */
export function bandCsv(classes: ClassBandCounts[]) {
  const headers = [
    'Class',
    'Students',
    ...SCORE_BANDS.flatMap((band) => [`${band.description} (students)`, `${band.description} (%)`]),
    '90+ (students)',
    '90+ (%)',
  ];
  const row = (label: string, counts: BandCounts) => {
    const total = totalOf(counts);
    const pct = (value: number) => share(value, total).toFixed(1);
    return [
      label,
      total,
      ...SCORE_BANDS.flatMap((band) => [counts[band.id], pct(counts[band.id])]),
      atOrAbove(counts, 'b90'),
      pct(atOrAbove(counts, 'b90')),
    ];
  };
  return { headers, rows: [...classes.map((cls) => row(cls.label, cls.counts)), row('Whole school', sumCounts(classes))] };
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
