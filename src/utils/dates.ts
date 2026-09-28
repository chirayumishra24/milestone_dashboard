const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Parses the two date formats stored in records: ISO dates from form inputs
 * ("2026-10-28") and the display format used by imported seed data ("28 Oct 2026").
 * Returns null for anything else rather than guessing.
 */
export function parseDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const display = value.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})$/);
  if (display) {
    const month = MONTHS.findIndex((m) => m.toLowerCase() === display[2].toLowerCase());
    if (month >= 0) return new Date(Number(display[3]), month, Number(display[1]));
  }
  return null;
}

/** "28 Oct 2026" */
export function formatDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "2026-10-28", the value format of <input type="date"> */
export function toIsoDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Whole days from today until the date (negative when it has passed) */
export function daysUntil(date: Date): number {
  return Math.round((date.getTime() - startOfToday().getTime()) / 86_400_000);
}

/** Displays a stored date consistently, falling back to the raw text if it can't be parsed */
export function displayDate(value: string | undefined | null): string {
  const parsed = parseDate(value);
  return parsed ? formatDate(parsed) : value ?? '';
}
