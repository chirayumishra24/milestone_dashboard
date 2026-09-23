export type CsvCell = string | number | null | undefined;

/**
 * Quotes a cell per RFC 4180: wraps in double quotes and doubles any embedded quotes
 * when the value contains a comma, quote or line break.
 */
function escapeCell(cell: CsvCell): string {
  if (cell === null || cell === undefined) return '';
  const text = String(cell);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(headers: string[], rows: CsvCell[][]): string {
  return [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');
}

/**
 * Triggers a browser download of the given table as a UTF-8 CSV file.
 * A BOM is prepended so Excel detects the encoding correctly.
 */
export function downloadCsv(filename: string, headers: string[], rows: CsvCell[][]): void {
  const blob = new Blob(['﻿' + toCsv(headers, rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
