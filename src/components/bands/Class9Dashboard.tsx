'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDownRight, ArrowUpRight, Info, Minus, Trophy } from 'lucide-react';
import { EXAMS, ExamId, type ActualDataset, type ActualGroup, type FineCounts } from '@/data/milestoneBands';
import {
  BandCounts,
  atOrAbove,
  examsWithData,
  formatCount,
  formatPct,
  leaderBy90,
  ninetyShare,
  subjectRows,
  toChartCounts,
  totalOf,
} from '@/utils/bands';
import BandColumnChart from './BandColumnChart';
import { BandRowsTable, ExamComparisonTable } from './BandTables';
import { CountUp, Reveal } from './motion';
import {
  cardClass,
  cardSubtitleClass,
  cardTitleClass,
  raisedCardClass,
  tagClass,
  textMute,
  textPrimary,
  textSecondary,
} from './styles';

/** One decimal place, as a number for the count-up */
const round1 = (value: number) => Math.round(value * 10) / 10;
const examById = (id: ExamId) => EXAMS.find((exam) => exam.id === id)!;
const countsFor = (group: ActualGroup, exam: ExamId) => toChartCounts(group.results[exam] as FineCounts);

/* ────────── Building blocks ────────── */

function SectionHeading({ id, title, description, children }: { id: string; title: string; description: string; children?: React.ReactNode }) {
  return (
    <Reveal className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 id={id} className={`text-balance text-[26px] font-light tracking-[-0.02em] ${textPrimary}`}>
          {title}
        </h2>
        <p className={`mt-1 max-w-[70ch] text-pretty text-sm ${textMute}`}>{description}</p>
      </div>
      {children}
    </Reveal>
  );
}

/** Segmented control for picking an exam; the active pill glides between options */
function ExamSwitcher({
  exams,
  value,
  onChange,
  label,
  layoutId,
}: {
  exams: { id: ExamId; shortLabel: string; label: string }[];
  value: ExamId;
  onChange: (id: ExamId) => void;
  label: string;
  layoutId: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div role="group" aria-label={label} className="print-hide inline-flex rounded-full border border-hairline bg-white/80 p-1 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
      {exams.map((exam) => {
        const active = exam.id === value;
        return (
          <button
            key={exam.id}
            type="button"
            aria-pressed={active}
            title={exam.label}
            onClick={() => onChange(exam.id)}
            className={`relative isolate touch-manipulation whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:px-4 ${
              active ? 'text-white dark:text-ink' : 'text-ink-secondary hover:text-ink dark:text-slate-300 dark:hover:text-slate-50'
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                className="absolute inset-0 -z-10 rounded-full bg-ink dark:bg-slate-100"
                aria-hidden="true"
              />
            )}
            {exam.shortLabel}
          </button>
        );
      })}
    </div>
  );
}

function HeroStat({ label, value, detail, delay }: { label: string; value: number; detail: string; delay: number }) {
  return (
    <Reveal delay={delay} className={`${raisedCardClass} p-5 sm:p-6`}>
      <dt className={`text-[13px] font-medium ${textMute}`}>{label}</dt>
      <dd className="mt-2">
        <CountUp
          value={value}
          className={`block text-[34px] font-light leading-none tracking-[-0.03em] tabular-nums sm:text-[40px] ${textPrimary}`}
        />
        <span className={`mt-2 block text-xs ${textMute}`}>{detail}</span>
      </dd>
    </Reveal>
  );
}

/** Change in percentage points, with an icon and words so the direction never relies on colour */
function PointsChange({ delta, suffix }: { delta: number; /** What it is compared with, e.g. "the class (6.9%)" */ suffix: string }) {
  const rounded = round1(delta);
  if (rounded === 0) {
    return (
      <p className={`inline-flex items-center gap-1 text-xs font-medium ${textMute}`}>
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        Level with {suffix}
      </p>
    );
  }
  const up = rounded > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <p className={`inline-flex items-center gap-1 text-xs font-medium ${up ? 'text-[#006300] dark:text-[#3ecf6e]' : 'text-[#b42318] dark:text-[#f58b80]'}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {Math.abs(rounded).toFixed(1)} pts {up ? 'above' : 'below'} {suffix}
    </p>
  );
}

function SubjectCard({
  subject,
  counts,
  index,
  classMax,
  wholeClassShare,
  isLeader,
}: {
  subject: { id: string; label: string };
  counts: BandCounts;
  index: number;
  classMax: number;
  wholeClassShare?: number;
  isLeader: boolean;
}) {
  const total = totalOf(counts);
  return (
    <Reveal delay={(index % 4) * 0.07} className={`${cardClass} print-avoid-break flex flex-col p-6`}>
      <article className="flex h-full flex-col" aria-labelledby={`subject-${subject.id}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id={`subject-${subject.id}`} className={`truncate text-lg font-medium tracking-tight ${textPrimary}`}>
              {subject.label}
            </h3>
            <p className={`text-[13px] tabular-nums ${textMute}`}>{formatCount(total)} students</p>
          </div>
          {isLeader && (
            <span className={`${tagClass} flex-shrink-0`}>
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
              Top 90+
            </span>
          )}
        </div>

        <dl className="mt-5 grid grid-cols-2 divide-x divide-hairline dark:divide-white/10">
          <div className="flex flex-col-reverse pr-4">
            <dt className={`mt-1 text-xs ${textMute}`}>scored 90+</dt>
            <dd className={`text-[32px] font-light leading-none tracking-[-0.03em] tabular-nums ${textPrimary}`}>
              {formatPct(atOrAbove(counts, 'b90'), total)}
            </dd>
          </div>
          <div className="flex flex-col-reverse pl-4">
            <dt className={`mt-1 text-xs ${textMute}`}>scored 95+</dt>
            <dd className={`text-[32px] font-light leading-none tracking-[-0.03em] tabular-nums ${textSecondary}`}>
              {formatPct(counts.b95, total)}
            </dd>
          </div>
        </dl>
        {wholeClassShare !== undefined && (
          <div className="mt-3">
            <PointsChange delta={ninetyShare(counts) - wholeClassShare} suffix={`the class (${wholeClassShare.toFixed(1)}%)`} />
          </div>
        )}

        <div className="mt-auto pt-6">
          <BandColumnChart counts={counts} total={total} groupLabel={subject.label} maxValue={classMax} height={150} />
        </div>
      </article>
    </Reveal>
  );
}

/** Keeps the selected exam in the URL (?exam=preMid) so a view can be shared */
function useUrlExam(param: string, options: ExamId[], fallback: ExamId): [ExamId, (id: ExamId) => void] {
  const [exam, setExam] = useState<ExamId>(fallback);
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get(param) as ExamId | null;
    if (wanted && options.includes(wanted)) setExam(wanted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const update = (id: ExamId) => {
    setExam(id);
    const url = new URL(window.location.href);
    if (id === fallback) url.searchParams.delete(param);
    else url.searchParams.set(param, id);
    window.history.replaceState(window.history.state, '', url);
  };
  return [exam, update];
}

/* ────────── Dashboard ────────── */

export default function Class9Dashboard({ data }: { data: ActualDataset }) {
  const whole = data.wholeClass;
  const wholeExams = examsWithData(whole);
  const latestWhole = wholeExams[wholeExams.length - 1].id;
  const [exam, setExam] = useUrlExam('exam', wholeExams.map((e) => e.id), latestWhole);

  const subjectExams = EXAMS.filter((e) => data.subjects.some((s) => s.results[e.id]));
  const latestSubject = subjectExams.length ? subjectExams[subjectExams.length - 1].id : undefined;
  const [subjectExamState, setSubjectExam] = useUrlExam('subjects', subjectExams.map((e) => e.id), latestSubject ?? 'midTerm');
  const subjectExam = latestSubject ? subjectExamState : undefined;

  const counts = countsFor(whole, exam);
  const total = totalOf(counts);
  const classShare = ninetyShare(counts);
  const examInfo = examById(exam);
  const isClassIX = exam !== 'viiiHalfYearly';
  // The exam just before this one (in the sheet's order) that the class has figures for
  const previous = wholeExams[wholeExams.findIndex((e) => e.id === exam) - 1];

  const rows = useMemo(() => (subjectExam ? subjectRows(data.subjects, subjectExam) : []), [data.subjects, subjectExam]);
  const leader = leaderBy90(rows);
  const subjectMax = Math.max(1, ...rows.flatMap((row) => Object.values(row.counts)));
  const wholeClassForSubjects = subjectExam && whole.results[subjectExam] ? ninetyShare(countsFor(whole, subjectExam)) : undefined;

  return (
    <>
      {/* ────────── Headline ────────── */}
      <section aria-label="Headline figures" className="print-avoid-break pt-8 lg:pt-12">
        <Reveal className="mb-8">
          <ExamSwitcher exams={wholeExams} value={exam} onChange={setExam} label="Exam shown" layoutId="whole-exam" />
        </Reveal>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14">
          <Reveal>
            <p className={`text-sm font-medium ${textSecondary}`}>
              {isClassIX ? `Class IX · ${examInfo.label}` : 'This cohort in Class VIII · Half-Yearly'}
            </p>
            <p className={`mt-5 text-[76px] font-light leading-[0.95] tracking-[-0.045em] tabular-nums sm:text-[104px] ${textPrimary}`}>
              <CountUp value={round1(classShare)} decimals={1} suffix="%" />
            </p>
            <p className={`mt-4 text-balance text-2xl font-light tracking-[-0.01em] sm:text-[28px] ${textPrimary}`}>
              of students scored 90 or above
            </p>
            <p className={`mt-3 max-w-[48ch] text-pretty text-[15px] leading-relaxed ${textSecondary}`}>
              {formatCount(atOrAbove(counts, 'b90'))} of {formatCount(total)} students in the {examInfo.label}.
            </p>
            {previous && (
              <div className="mt-4">
                <PointsChange
                  delta={classShare - ninetyShare(countsFor(whole, previous.id))}
                  suffix={`the ${previous.label} (${formatPct(atOrAbove(countsFor(whole, previous.id), 'b90'), totalOf(countsFor(whole, previous.id)))})`}
                />
              </div>
            )}
          </Reveal>

          <dl className="grid grid-cols-2 gap-3 sm:gap-4">
            <HeroStat label="Students assessed" value={total} detail={examInfo.label} delay={0.1} />
            <HeroStat label="Scored 95+" value={counts.b95} detail={`${formatPct(counts.b95, total)} of students`} delay={0.18} />
            <HeroStat label="Scored 80+" value={atOrAbove(counts, 'b80')} detail={`${formatPct(atOrAbove(counts, 'b80'), total)} of students`} delay={0.26} />
            <HeroStat label="Below 70" value={counts.below70} detail={`${formatPct(counts.below70, total)} of students`} delay={0.34} />
          </dl>
        </div>
      </section>

      {/* ────────── Whole class ────────── */}
      <section aria-labelledby="class-heading" className="scroll-mt-20">
        <SectionHeading
          id="class-heading"
          title="Whole Class Score Comparison"
          description="Students at or above each score in every exam on the sheet, with the share of that exam's students. The highlighted column is the exam shown in the chart."
        />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Reveal className={`${cardClass} print-avoid-break flex flex-col p-6 lg:col-span-5`}>
            <div className="mb-6 flex items-baseline justify-between gap-3">
              <h3 className={cardTitleClass}>Students per Score Band</h3>
              <p className={`${cardSubtitleClass} tabular-nums`}>{examInfo.shortLabel}</p>
            </div>
            <div className="mt-auto">
              {/* Keyed by exam so the columns grow in again when the exam changes */}
              <BandColumnChart key={exam} counts={counts} total={total} groupLabel={examInfo.label} height={360} showShare />
            </div>
          </Reveal>
          <Reveal delay={0.1} className={`${cardClass} print-avoid-break p-6 lg:col-span-7`}>
            <div className="mb-4">
              <h3 className={cardTitleClass}>At or Above Each Score</h3>
              <p className={cardSubtitleClass}>Each row counts the students in that band and every band above it</p>
            </div>
            <ExamComparisonTable results={whole.results} highlight={exam} />
          </Reveal>
        </div>
      </section>

      {/* ────────── Subject-wise ────────── */}
      <section aria-labelledby="subject-heading" className="scroll-mt-20">
        <SectionHeading
          id="subject-heading"
          title="Subject-Wise Score Bands"
          description="Students in each score band for every subject. Select a column heading to rank subjects."
        >
          {subjectExam && subjectExams.length > 1 && (
            <ExamSwitcher exams={subjectExams} value={subjectExam} onChange={setSubjectExam} label="Exam shown for subjects" layoutId="subject-exam" />
          )}
        </SectionHeading>

        {!subjectExam ? (
          <div className={`${cardClass} p-8 text-center text-sm ${textSecondary}`}>The sheet has no subject-wise figures yet.</div>
        ) : (
          <div className="space-y-5">
            {subjectExam === 'viiiHalfYearly' && (
              <Reveal className="flex items-start gap-3 rounded-xl border border-[#c9dbf5] bg-[#eef4fd] p-4 text-sm text-ink-secondary dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-slate-200">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1c5cab] dark:text-blue-200" aria-hidden="true" />
                <p className="text-pretty">
                  <span className="font-semibold text-ink dark:text-slate-50">These are this cohort&apos;s Class VIII half-yearly results.</span>{' '}
                  The sheet&apos;s subject blocks do not have Class IX figures yet. This section switches to Class IX once the Pre-Mid
                  Term and Mid Term subject columns are filled in.
                </p>
              </Reveal>
            )}

            <Reveal className={`${cardClass} p-4 sm:p-6`}>
              <div className="mb-3 px-1 sm:px-0">
                <h3 className={cardTitleClass}>All Subjects</h3>
                <p className={cardSubtitleClass}>{examById(subjectExam).label}, share of each subject&apos;s students underneath</p>
              </div>
              <BandRowsTable
                rows={rows}
                rowHeader="Subject"
                leaderId={leader?.classId}
                caption={`Students in each score band by subject, ${examById(subjectExam).label}`}
              />
            </Reveal>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {rows.map((row, index) => (
                <SubjectCard
                  key={`${subjectExam}-${row.classId}`}
                  subject={{ id: row.classId, label: row.label }}
                  counts={row.counts}
                  index={index}
                  classMax={subjectMax}
                  wholeClassShare={wholeClassForSubjects}
                  isLeader={row.classId === leader?.classId}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
