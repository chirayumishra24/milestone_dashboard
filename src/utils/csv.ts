/** Written as a code point so editors and tools can't silently drop the invisible character */
const UTF8_BOM = String.fromCharCode(0xfeff);

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
  const blob = new Blob([UTF8_BOM + toCsv(headers, rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses CSV text per RFC 4180: quoted fields may contain commas, line breaks and doubled
 * quotes. Handles CRLF/LF line endings and a leading UTF-8 BOM. Blank lines are skipped.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const input = text.startsWith(UTF8_BOM) ? text.slice(1) : text;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && input[i + 1] === '\n') i++;
      row.push(field);
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  return rows;
}
