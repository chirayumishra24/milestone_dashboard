'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { BandId, ClassBandCounts, SCORE_BANDS } from '@/data/milestoneBands';
import { BandCounts, atOrAbove, bandFill, formatCount, formatPct, share, totalOf } from '@/utils/bands';
import { EASE_OUT } from './motion';
import { tagClass } from './styles';

const th = 'px-3 pb-3 pt-1 text-xs font-medium text-ink-mute whitespace-nowrap dark:text-stone-400';
const td = 'px-3 py-3.5 tabular-nums';
const strong = 'text-ink dark:text-stone-50';
const mute = 'text-ink-mute dark:text-stone-400';

const rowsVariants: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } };
const rowVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

/** Table body whose rows fade in one after another when the table scrolls into view */
function RevealBody({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.tbody
      className={className}
      variants={rowsVariants}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.tbody>
  );
}

function Swatch({ bandId, size = 'h-2.5 w-2.5' }: { bandId: BandId; size?: string }) {
  return <span className={`${size} flex-shrink-0 rounded-[3px]`} style={{ backgroundColor: bandFill(bandId) }} aria-hidden="true" />;
}

/** Count with its share of the group underneath, right-aligned */
function CountCell({ value, total, emphasis }: { value: number; total: number; emphasis?: boolean }) {
  return (
    <td className={`${td} text-right`}>
      <span className={`block text-[15px] ${emphasis ? 'font-semibold' : 'font-medium'} ${strong}`}>{formatCount(value)}</span>
      <span className={`block text-xs ${mute}`}>{formatPct(value, total)}</span>
    </td>
  );
}

type SortKey = 'order' | 'students' | 'ninety' | BandId;
type SortDir = 'asc' | 'desc';
interface SortState {
  key: SortKey;
  dir: SortDir;
}

const DEFAULT_SORT: SortState = { key: 'order', dir: 'asc' };
/** First column stays put while the band columns scroll sideways on narrow screens */
const stickyCol =
  'sticky left-0 z-[1] bg-white shadow-[6px_0_8px_-6px_rgba(42,33,28,0.12)] group-hover:bg-canvas-soft lg:static lg:shadow-none dark:bg-night-card dark:group-hover:bg-[#231D1A]';

const SORT_KEYS: SortKey[] = ['order', 'students', 'ninety', ...SCORE_BANDS.map((band) => band.id)];

const sortLabel = (key: SortKey) =>
  key === 'order'
    ? 'sheet order'
    : key === 'students'
      ? 'number of students'
      : key === 'ninety'
        ? '90+ share'
        : `${SCORE_BANDS.find((band) => band.id === key)?.description} share`;

/** Bands and 90+ rank by share of the row's students (groups differ in size); Students ranks by headcount */
function sortValue(row: ClassBandCounts, index: number, key: SortKey) {
  if (key === 'order') return index;
  const total = totalOf(row.counts);
  if (key === 'students') return total;
  if (key === 'ninety') return share(atOrAbove(row.counts, 'b90'), total);
  return share(row.counts[key], total);
}

/** Reads and writes the sort to the URL (?sort=b95&dir=desc) so a sorted view can be shared */
function useUrlSort(): [SortState, (key: SortKey) => void] {
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('sort') as SortKey | null;
    const dir = params.get('dir');
    if (key && SORT_KEYS.includes(key)) setSort({ key, dir: dir === 'asc' ? 'asc' : 'desc' });
  }, []);

  const toggle = (key: SortKey) => {
    const next: SortState =
      sort.key === key ? { key, dir: sort.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'order' ? 'asc' : 'desc' };
    setSort(next);
    const url = new URL(window.location.href);
    if (next.key === DEFAULT_SORT.key && next.dir === DEFAULT_SORT.dir) {
      url.searchParams.delete('sort');
      url.searchParams.delete('dir');
    } else {
      url.searchParams.set('sort', next.key);
      url.searchParams.set('dir', next.dir);
    }
    window.history.replaceState(window.history.state, '', url);
  };

  return [sort, toggle];
}

function SortHeader({
  sortKey,
  sort,
  onSort,
  align,
  className = '',
  title,
  children,
}: {
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
  align: 'left' | 'right';
  className?: string;
  title?: string;
  children: React.ReactNode;
}) {
  const active = sort.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
  const icon = (
    <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${active ? '' : 'opacity-40 group-hover:opacity-80'}`} aria-hidden="true" />
  );
  return (
    <th
      scope="col"
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={`${th} ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        title={title ? `${title}. Sort by ${sortLabel(sortKey)}` : `Sort by ${sortLabel(sortKey)}`}
        className={`group -mx-1 inline-flex touch-manipulation items-center gap-1 rounded px-1 py-0.5 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon dark:hover:text-stone-100 ${
          active ? 'text-ink dark:text-stone-100' : ''
        }`}
      >
        {/* Icon before the label on right-aligned columns so labels line up with the numbers below */}
        {align === 'right' && icon}
        {children}
        {align === 'left' && icon}
      </button>
    </th>
  );
}

/**
 * Groups as rows (subjects), the five chart bands as columns, optional total row.
 * Every column header sorts.
 */
export function BandRowsTable({
  rows,
  rowHeader,
  footer,
  leaderId,
  caption,
}: {
  rows: ClassBandCounts[];
  /** Heading of the first column, e.g. "Subject" */
  rowHeader: string;
  footer?: { label: string; counts: BandCounts };
  /** Row with the highest 90+ share, marked with a tag */
  leaderId?: string;
  caption: string;
}) {
  const reduce = useReducedMotion();
  const [sort, toggleSort] = useUrlSort();

  const sorted = useMemo(() => {
    const direction = sort.dir === 'asc' ? 1 : -1;
    return rows
      .map((row, index) => ({ row, value: sortValue(row, index, sort.key), index }))
      .sort((a, b) => (a.value - b.value) * direction || a.index - b.index)
      .map(({ row }) => row);
  }, [rows, sort]);

  const cells = (label: React.ReactNode, counts: BandCounts, isTotal = false) => {
    const total = totalOf(counts);
    const ninetyPlus = atOrAbove(counts, 'b90');
    return (
      <>
        <th
          scope="row"
          className={`${td} ${stickyCol} whitespace-nowrap text-left text-[15px] ${isTotal ? 'font-semibold' : 'font-medium'} ${strong}`}
        >
          {label}
        </th>
        <td className={`${td} text-right text-[15px] ${isTotal ? `font-semibold ${strong}` : 'text-ink-secondary dark:text-stone-300'}`}>
          {formatCount(total)}
        </td>
        {SCORE_BANDS.map((band) => (
          <CountCell key={band.id} value={counts[band.id]} total={total} emphasis={isTotal} />
        ))}
        <td className={`${td} border-l border-hairline text-right dark:border-white/[0.07]`}>
          <span className={`block text-lg font-light tracking-tight ${strong}`}>{formatPct(ninetyPlus, total)}</span>
          <span className={`block text-xs ${mute}`}>{formatCount(ninetyPlus)} students</span>
        </td>
      </>
    );
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-10 bg-gradient-to-l from-white to-transparent lg:hidden dark:from-night-card" aria-hidden="true" />
    {/* No side padding here: it would leave a gap beside the pinned first column for scrolled cells to show through */}
    <div className="overflow-x-auto">
      <p className="sr-only" aria-live="polite">
        Rows sorted by {sortLabel(sort.key)}, {sort.dir === 'asc' ? 'lowest' : 'highest'} first
      </p>
      <table className="w-full min-w-[700px] table-fixed text-sm lg:min-w-[780px]">
        <caption className="sr-only">{caption}</caption>
        <colgroup>
          <col className="w-[22%] lg:w-[19%]" />
          <col className="w-[10%]" />
          {SCORE_BANDS.map((band) => (
            <col key={band.id} className="w-[11%]" />
          ))}
          <col className="w-[13%] lg:w-[16%]" />
        </colgroup>
        <thead className="border-b border-hairline dark:border-white/10">
          <tr>
            <SortHeader sortKey="order" sort={sort} onSort={toggleSort} align="left" className={stickyCol}>
              {rowHeader}
            </SortHeader>
            <SortHeader sortKey="students" sort={sort} onSort={toggleSort} align="right">
              Students
            </SortHeader>
            {SCORE_BANDS.map((band) => (
              <SortHeader key={band.id} sortKey={band.id} sort={sort} onSort={toggleSort} align="right" title={band.description}>
                <Swatch bandId={band.id} />
                {band.label}
              </SortHeader>
            ))}
            <SortHeader
              sortKey="ninety"
              sort={sort}
              onSort={toggleSort}
              align="right"
              className="border-l border-hairline dark:border-white/[0.07]"
            >
              90+ total
            </SortHeader>
          </tr>
        </thead>
        <RevealBody className="divide-y divide-hairline/70 dark:divide-white/[0.05]">
          {sorted.map((row) => (
            <motion.tr
              key={row.classId}
              layout={reduce ? false : 'position'}
              transition={{ layout: { duration: 0.45, ease: EASE_OUT } }}
              variants={rowVariants}
              className="group transition-colors hover:bg-canvas-soft dark:hover:bg-white/[0.03]"
            >
              {cells(
                <span className="inline-flex items-center gap-2">
                  {row.label}
                  {row.classId === leaderId && <span className={`${tagClass} whitespace-nowrap`}>Top 90+</span>}
                </span>,
                row.counts,
              )}
            </motion.tr>
          ))}
        </RevealBody>
        {footer && (
          <tfoot className="border-t border-[#DCCFBF] bg-canvas-soft/70 dark:border-white/15 dark:bg-white/[0.03]">
            <tr>{cells(footer.label, footer.counts, true)}</tr>
          </tfoot>
        )}
      </table>
    </div>
    </div>
  );
}

/**
 * One group's score bands as rows: students, share, and the running "at or above" total
 * (that band plus every band above it). On phones it uses the short band labels and stacks
 * the "at or above" share under its count, so all four columns fit without sideways scrolling.
 */
export function DetailedBreakdownTable({ counts, caption }: { counts: BandCounts; caption: string }) {
  const total = totalOf(counts);
  const cell = 'px-2 py-3 tabular-nums sm:px-3 sm:py-3.5';
  const head = 'px-2 pb-3 pt-1 text-xs font-medium text-ink-mute whitespace-nowrap sm:px-3 dark:text-stone-400';
  return (
    <table className="w-full table-fixed text-sm">
      <caption className="sr-only">{caption}</caption>
      <colgroup>
        <col className="w-[30%] sm:w-[40%]" />
        <col className="w-[22%] sm:w-[18%]" />
        <col className="w-[20%] sm:w-[16%]" />
        <col className="w-[28%] sm:w-[26%]" />
      </colgroup>
      <thead className="border-b border-hairline dark:border-white/10">
        <tr>
          <th scope="col" className={`${head} text-left`}>
            <span className="sm:hidden">Band</span>
            <span className="hidden sm:inline">Score band</span>
          </th>
          <th scope="col" className={`${head} text-right`}>Students</th>
          <th scope="col" className={`${head} text-right`}>Share</th>
          <th scope="col" className={`${head} text-right`}>
            <span className="sm:hidden">At/above</span>
            <span className="hidden sm:inline">At or above</span>
          </th>
        </tr>
      </thead>
      <RevealBody className="divide-y divide-hairline/70 dark:divide-white/[0.05]">
        {SCORE_BANDS.map((band) => {
          const cumulative = atOrAbove(counts, band.id);
          return (
            <motion.tr key={band.id} variants={rowVariants}>
              <th scope="row" className={`${cell} text-left text-[15px] font-medium ${strong}`}>
                <span className="flex items-center gap-2 sm:gap-2.5">
                  <Swatch bandId={band.id} size="h-3 w-3" />
                  <span className="sm:hidden" aria-hidden="true">{band.label}</span>
                  <span className="sr-only sm:not-sr-only">{band.description}</span>
                </span>
              </th>
              <td className={`${cell} text-right text-[15px] font-semibold ${strong}`}>{formatCount(counts[band.id])}</td>
              <td className={`${cell} text-right text-[13px] ${mute}`}>{formatPct(counts[band.id], total)}</td>
              <td className={`${cell} text-right`}>
                <span className={`text-[15px] font-semibold ${strong}`}>{formatCount(cumulative)}</span>
                <span className={`block text-xs sm:ml-1.5 sm:inline ${mute}`}>
                  <span className="hidden sm:inline">(</span>
                  {formatPct(cumulative, total)}
                  <span className="hidden sm:inline">)</span>
                </span>
              </td>
            </motion.tr>
          );
        })}
      </RevealBody>
      <tfoot className="border-t border-[#DCCFBF] bg-canvas-soft/70 dark:border-white/15 dark:bg-white/[0.03]">
        <tr>
          <th scope="row" className={`${cell} text-left text-[15px] font-semibold ${strong}`}>Total</th>
          <td className={`${cell} text-right text-[15px] font-semibold ${strong}`}>{formatCount(total)}</td>
          <td className={`${cell} text-right text-[13px] ${mute}`}>100%</td>
          <td className={cell} />
        </tr>
      </tfoot>
    </table>
  );
}
