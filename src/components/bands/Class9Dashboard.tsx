'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Award, BookOpen, Calendar, Info, Layers, TrendingUp, Users } from 'lucide-react';
import { EXAMS, ExamId, type ActualDataset, type ActualGroup, type FineCounts } from '@/data/milestoneBands';
import { BandCounts, atOrAbove, examsWithData, formatCount, formatPct, leaderBy90, ninetyShare, subjectRows, toChartCounts, totalOf } from '@/utils/bands';
import type { CsvCell } from '@/utils/csv';
import DashboardFrame from './DashboardFrame';
import BandThemeStyle from './BandThemeStyle';
import BandColumnChart from './BandColumnChart';
import { BandRowsTable, DetailedBreakdownTable } from './BandTables';
import { CountUp, Reveal } from './motion';
import { cardClass, cardSubtitleClass, cardTitleClass, raisedCardClass, textMute, textPrimary, textSecondary } from './styles';

/** One decimal place, as a number for the count-up */
const round1 = (value: number) => Math.round(value * 10) / 10;
const examById = (id: ExamId) => EXAMS.find((exam) => exam.id === id)!;
const countsFor = (group: ActualGroup, exam: ExamId): BandCounts => toChartCounts(group.results[exam] as FineCounts);

/** Keeps a choice in the URL (?exam=preMid, ?subject=maths) so a view can be shared */
function useUrlParam<T extends string>(param: string, options: readonly T[], fallback: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get(param) as T | null;
    if (wanted && options.includes(wanted)) setValue(wanted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const update = (next: T) => {
    setValue(next);
    const url = new URL(window.location.href);
    if (next === fallback) url.searchParams.delete(param);
    else url.searchParams.set(param, next);
    window.history.replaceState(window.history.state, '', url);
  };
  return [value, update];
}

/* ────────── Building blocks ────────── */

/** Pill toggle; the active pill glides between options */
function PillToggle<T extends string>({
  options,
  value,
  onChange,
  label,
  layoutId,
  size = 'sm',
}: {
  options: { id: T; label: string; title?: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  layoutId: string;
  size?: 'sm' | 'md';
}) {
  const reduce = useReducedMotion();
  return (
    <div
      role="group"
      aria-label={label}
      className="print-hide inline-flex max-w-full overflow-x-auto rounded-full border border-hairline bg-white/90 p-1 shadow-[0_1px_3px_rgba(0,55,112,0.06)] [scrollbar-width:none] dark:border-white/10 dark:bg-white/5"
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            title={option.title}
            onClick={() => onChange(option.id)}
            className={`relative isolate flex-shrink-0 touch-manipulation whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              size === 'sm' ? 'px-3.5 py-1 text-[13px]' : 'px-4 py-1.5 text-sm'
            } ${active ? 'text-white dark:text-ink' : 'text-ink-mute hover:text-ink dark:text-slate-400 dark:hover:text-slate-50'}`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                className="absolute inset-0 -z-10 rounded-full bg-ink dark:bg-slate-100"
                aria-hidden="true"
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionHeading({ id, title, description, icon }: { id: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <Reveal className="mb-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#1c5cab]/[0.08] text-[#1c5cab] dark:bg-white/10 dark:text-blue-200">
          {icon}
        </div>
        <div>
          <h2 id={id} className={`text-balance text-xl font-semibold tracking-[-0.02em] sm:text-[22px] ${textPrimary}`}>
            {title}
          </h2>
          <p className={`mt-0.5 text-pretty text-sm ${textMute}`}>{description}</p>
        </div>
      </div>
    </Reveal>
  );
}

type StatTone = 'default' | 'accent' | 'warn';

const STAT_TONES: Record<StatTone, { bar: string; icon: string; tint?: string }> = {
  default: {
    bar: 'bg-gradient-to-r from-hairline to-transparent dark:from-white/10',
    icon: 'bg-ink/[0.05] text-ink-mute dark:bg-white/10 dark:text-slate-300',
  },
  accent: {
    bar: 'bg-gradient-to-r from-[#1c5cab] via-[#1c5cab]/60 to-transparent dark:from-blue-300 dark:via-blue-300/50',
    icon: 'bg-[#1c5cab]/[0.08] text-[#1c5cab] dark:bg-blue-300/15 dark:text-blue-200',
  },
  warn: {
    bar: 'bg-gradient-to-r from-[#d9480f] via-[#d9480f]/60 to-transparent dark:from-orange-300 dark:via-orange-300/50',
    icon: 'bg-orange-50 text-[#c2410c] dark:bg-orange-400/15 dark:text-orange-200',
    tint: 'bg-gradient-to-b from-orange-50/80 to-transparent dark:from-orange-400/[0.06]',
  },
};

function HeroStat({
  label,
  value,
  detail,
  delay,
  icon,
  tone = 'default',
}: {
  label: string;
  value: number;
  detail: string;
  delay: number;
  icon: React.ReactNode;
  tone?: StatTone;
}) {
  const t = STAT_TONES[tone];
  return (
    <Reveal delay={delay} className={`${raisedCardClass} relative isolate overflow-hidden p-5 sm:p-6`}>
      {t.tint && <div className={`absolute inset-0 -z-10 ${t.tint}`} aria-hidden="true" />}
      <div className={`absolute inset-x-0 top-0 h-0.5 ${t.bar}`} aria-hidden="true" />
      <dt className="flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${t.icon}`} aria-hidden="true">
          {icon}
        </span>
        <span className={`text-[13px] font-medium ${textMute}`}>{label}</span>
      </dt>
      <dd className="mt-3">
        <CountUp
          value={value}
          className={`block text-[34px] font-light leading-none tracking-[-0.03em] tabular-nums sm:text-[40px] ${textPrimary}`}
        />
        <span className={`mt-2 block text-xs ${textMute}`}>{detail}</span>
      </dd>
    </Reveal>
  );
}

/** "+6.9 pts from Pre-Mid Term to Mid Term": icon, sign and words, so direction never relies on colour */
function ChangeChip({ delta, from, to }: { delta: number; from: string; to: string }) {
  const rounded = round1(delta);
  const up = rounded > 0;
  const level = rounded === 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <p
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
        level
          ? 'bg-ink/[0.05] text-ink-secondary dark:bg-white/10 dark:text-slate-300'
          : up
            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300'
            : 'bg-orange-50 text-[#b4380b] dark:bg-orange-400/10 dark:text-orange-200'
      }`}
    >
      {!level && <Icon className="h-4 w-4" aria-hidden="true" />}
      {level ? `No change from ${from} to ${to}` : `${up ? '+' : '-'}${Math.abs(rounded).toFixed(1)} pts from ${from} to ${to}`}
    </p>
  );
}

/** The two-card block: column chart beside the detailed breakdown table */
function BandPanel({ counts, groupLabel, chartKey, caption }: { counts: BandCounts; groupLabel: string; chartKey: string; caption: string }) {
  const total = totalOf(counts);
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <Reveal className={`${cardClass} print-avoid-break flex flex-col p-6 lg:col-span-5`}>
        <div className="mb-6 flex items-baseline justify-between gap-3">
          <h3 className={cardTitleClass}>Students per Band</h3>
          <p className={`${cardSubtitleClass} tabular-nums`}>{formatCount(total)} students</p>
        </div>
        <div className="mt-auto">
          {/* Keyed so the columns grow in again when the exam or subject changes */}
          <BandColumnChart key={chartKey} counts={counts} total={total} groupLabel={groupLabel} height={300} showShare />
        </div>
      </Reveal>
      <Reveal delay={0.1} className={`${cardClass} print-avoid-break p-6 lg:col-span-7`}>
        <div className="mb-4">
          <h3 className={cardTitleClass}>Detailed Breakdown</h3>
          <p className={cardSubtitleClass}>&ldquo;At or above&rdquo; counts every student in that band or higher</p>
        </div>
        <DetailedBreakdownTable key={chartKey} counts={counts} caption={caption} />
      </Reveal>
    </div>
  );
}

/* ────────── Dashboard ────────── */

export default function Class9Dashboard({
  data,
  fontClassName,
  csv,
}: {
  data: ActualDataset;
  fontClassName: string;
  csv: { filename: string; headers: string[]; rows: CsvCell[][] };
}) {
  const whole = data.wholeClass;
  // Newest first in the toggle, as on the school website
  const wholeExams = [...examsWithData(whole)].reverse();
  const [exam, setExam] = useUrlParam<ExamId>('exam', wholeExams.map((e) => e.id), wholeExams[0].id);

  const counts = countsFor(whole, exam);
  const total = totalOf(counts);
  const classShare = ninetyShare(counts);
  const examInfo = examById(exam);
  const isClassIX = exam !== 'viiiHalfYearly';
  // The exam just before this one in the sheet that the class has figures for
  const chronological = examsWithData(whole);
  const previous = chronological[chronological.findIndex((e) => e.id === exam) - 1];

  // Subjects: follow the header exam when the sheet has subject figures for it, otherwise the latest exam that has them
  const subjectExams = EXAMS.filter((e) => data.subjects.some((s) => s.results[e.id]));
  const subjectExam = subjectExams.some((e) => e.id === exam) ? exam : subjectExams[subjectExams.length - 1]?.id;
  const rows = useMemo(() => (subjectExam ? subjectRows(data.subjects, subjectExam) : []), [data.subjects, subjectExam]);
  const [subjectId, setSubjectId] = useUrlParam<string>('subject', data.subjects.map((s) => s.id), data.subjects[0]?.id ?? '');
  const subjectRow = rows.find((row) => row.classId === subjectId) ?? rows[0];
  const leader = leaderBy90(rows);

  const examToggle = (placement: 'bar' | 'row') => (
    <PillToggle
      options={wholeExams.map((e) => ({ id: e.id, label: e.shortLabel, title: e.label }))}
      value={exam}
      onChange={setExam}
      label="Select examination"
      layoutId={`exam-toggle-${placement}`}
    />
  );

  return (
    <DashboardFrame
      title="Milestone Results"
      subtitle={`${data.school} · Class IX`}
      fontClassName={fontClassName}
      controls={examToggle}
      csv={csv}
    >
      <BandThemeStyle />
      <h1 className="sr-only">
        Milestone results, Class IX, {data.school}, {examInfo.label}, academic year {data.academicYear}
      </h1>

      <main id="main" tabIndex={-1} className="mx-auto max-w-[1320px] space-y-16 px-4 pb-12 outline-none sm:px-6 lg:px-10">
        {/* ────────── Headline ────────── */}
        <section aria-label="Headline figures" className="print-avoid-break grid gap-10 pt-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pt-16">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-hairline/80 bg-white/70 px-3 py-1 text-sm font-medium backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
              <Calendar className="h-3.5 w-3.5 text-[#1c5cab] dark:text-blue-200" aria-hidden="true" />
              <span className={textSecondary}>
                {examInfo.label} · {isClassIX ? `AY ${data.academicYear}` : 'this cohort in Class VIII'}
              </span>
            </p>
            <p className={`mt-6 text-[72px] font-light leading-[0.95] tracking-[-0.045em] tabular-nums sm:text-[100px] ${textPrimary}`}>
              <CountUp value={round1(classShare)} decimals={1} suffix="%" />
            </p>
            <p className={`mt-4 text-balance text-2xl font-light tracking-[-0.01em] sm:text-[28px] ${textPrimary}`}>
              of students scored 90 or above
            </p>
            <p className={`mt-3 max-w-[48ch] text-pretty text-[15px] leading-relaxed ${textSecondary}`}>
              {formatCount(atOrAbove(counts, 'b90'))} of {formatCount(total)} students {isClassIX ? 'in Class IX' : 'in this cohort'} achieved
              90% or higher in the {examInfo.label}.
            </p>
            {previous && (
              <Reveal delay={0.3} className="mt-4">
                <ChangeChip delta={classShare - ninetyShare(countsFor(whole, previous.id))} from={previous.name} to={examInfo.name} />
              </Reveal>
            )}
          </Reveal>

          <dl className="grid grid-cols-2 gap-3 sm:gap-4">
            <HeroStat
              label="Students assessed"
              value={total}
              detail={isClassIX ? 'Across all sections' : 'In Class VIII'}
              delay={0.1}
              icon={<Users className="h-3.5 w-3.5" />}
            />
            <HeroStat
              label="Scored 95+"
              value={counts.b95}
              detail={`${formatPct(counts.b95, total)} of the class`}
              delay={0.18}
              icon={<Award className="h-3.5 w-3.5" />}
              tone="accent"
            />
            <HeroStat
              label="Scored 80+"
              value={atOrAbove(counts, 'b80')}
              detail={`${formatPct(atOrAbove(counts, 'b80'), total)} of the class`}
              delay={0.26}
              icon={<TrendingUp className="h-3.5 w-3.5" />}
            />
            <HeroStat
              label="Below 70"
              value={counts.below70}
              detail={`${formatPct(counts.below70, total)} of the class`}
              delay={0.34}
              icon={<AlertTriangle className="h-3.5 w-3.5" />}
              tone="warn"
            />
          </dl>
        </section>

        {/* ────────── Whole class ────────── */}
        <section aria-labelledby="class-heading" className="scroll-mt-24">
          <SectionHeading
            id="class-heading"
            title="Score Band Distribution"
            description={`${isClassIX ? 'All Class IX students' : 'This cohort in Class VIII'}: how they are distributed across performance bands`}
            icon={<Layers className="h-4 w-4" aria-hidden="true" />}
          />
          <BandPanel
            counts={counts}
            groupLabel={examInfo.label}
            chartKey={`class-${exam}`}
            caption={`Class IX students in each score band, ${examInfo.label}`}
          />
        </section>

        {/* ────────── Subject-wise ────────── */}
        <section aria-labelledby="subject-heading" className="scroll-mt-24">
          <SectionHeading
            id="subject-heading"
            title="Subject-Wise Score Bands"
            description="The same breakdown for each subject. Pick a subject, or compare them all in the table below."
            icon={<BookOpen className="h-4 w-4" aria-hidden="true" />}
          />

          {!subjectExam || !subjectRow ? (
            <div className={`${cardClass} p-8 text-center text-sm ${textSecondary}`}>The sheet has no subject-wise figures yet.</div>
          ) : (
            <div className="space-y-5">
              {subjectExam !== exam && (
                <Reveal className="flex items-start gap-3 rounded-xl border border-[#c9dbf5] bg-[#eef4fd] p-4 text-sm text-ink-secondary dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-slate-200">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1c5cab] dark:text-blue-200" aria-hidden="true" />
                  <p className="text-pretty">
                    <span className="font-semibold text-ink dark:text-slate-50">Subject figures below are from the {examById(subjectExam).label}.</span>{' '}
                    The sheet does not have subject-wise figures for the {examInfo.label} yet. This section switches over once they are added.
                  </p>
                </Reveal>
              )}

              <Reveal>
                <PillToggle
                  options={rows.map((row) => ({ id: row.classId, label: row.label }))}
                  value={subjectRow.classId}
                  onChange={setSubjectId}
                  label="Select subject"
                  layoutId="subject-toggle"
                  size="md"
                />
              </Reveal>

              <BandPanel
                counts={subjectRow.counts}
                groupLabel={`${subjectRow.label}, ${examById(subjectExam).name}`}
                chartKey={`subject-${subjectRow.classId}-${subjectExam}`}
                caption={`${subjectRow.label} students in each score band, ${examById(subjectExam).label}`}
              />

              <Reveal className={`${cardClass} p-4 sm:p-6`}>
                <div className="mb-3 px-1 sm:px-0">
                  <h3 className={cardTitleClass}>All Subjects</h3>
                  <p className={cardSubtitleClass}>{examById(subjectExam).label}. Select a column heading to rank subjects.</p>
                </div>
                <BandRowsTable
                  rows={rows}
                  rowHeader="Subject"
                  leaderId={leader?.classId}
                  caption={`Students in each score band by subject, ${examById(subjectExam).label}`}
                />
              </Reveal>
            </div>
          )}
        </section>

        {/* A div rather than <footer>: the app's global print CSS hides footers, and this line belongs on paper */}
        <div className="border-t border-hairline/80 pt-6 dark:border-white/10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className={`text-[13px] ${textMute}`}>
              <span translate="no">{data.school}</span> · {examInfo.label} · AY {data.academicYear}
            </p>
            <p className={`text-xs ${textMute}`}>Institutional aggregate figures only</p>
          </div>
        </div>
      </main>
    </DashboardFrame>
  );
}
