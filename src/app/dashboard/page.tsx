import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { ArrowDownRight, ArrowUpRight, Minus, Trophy } from 'lucide-react';
import { MILESTONE_BAND_DATA, type ClassBandCounts } from '@/data/milestoneBands';
import {
  BandCounts,
  atOrAbove,
  bandCsv,
  formatCount,
  formatDate,
  formatPct,
  leaderBy90,
  ninetyShare,
  sumCounts,
  totalOf,
} from '@/utils/bands';
import DashboardFrame from '@/components/bands/DashboardFrame';
import BandThemeStyle from '@/components/bands/BandThemeStyle';
import BandColumnChart from '@/components/bands/BandColumnChart';
import { ClassBandTable, SchoolBandTable } from '@/components/bands/BandTables';
import { CountUp, Reveal } from '@/components/bands/motion';
import {
  cardClass,
  cardSubtitleClass,
  cardTitleClass,
  raisedCardClass,
  tagClass,
  textMute,
  textPrimary,
  textSecondary,
} from '@/components/bands/styles';

const manrope = Manrope({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Milestone Results',
  description: 'Class-wise and whole-school score band distribution',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f9fc' },
    { media: '(prefers-color-scheme: dark)', color: '#0a1426' },
  ],
};

/** One decimal place, as a number for the count-up */
const round1 = (value: number) => Math.round(value * 10) / 10;

function SectionHeading({ id, title, description }: { id: string; title: string; description: string }) {
  return (
    <Reveal className="mb-5">
      <h2 id={id} className={`text-balance text-[26px] font-light tracking-[-0.02em] ${textPrimary}`}>
        {title}
      </h2>
      <p className={`mt-1 text-pretty text-sm ${textMute}`}>{description}</p>
    </Reveal>
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

/** A class's 90+ share against the whole school, in percentage points (icon + words, never colour alone) */
function VsSchool({ classShare, schoolShare }: { classShare: number; schoolShare: number }) {
  const delta = round1(classShare - schoolShare);
  if (delta === 0) {
    return (
      <p className={`inline-flex items-center gap-1 text-xs font-medium ${textMute}`}>
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        Level with the school at 90+
      </p>
    );
  }
  const above = delta > 0;
  const Icon = above ? ArrowUpRight : ArrowDownRight;
  return (
    <p
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        above ? 'text-[#006300] dark:text-[#3ecf6e]' : 'text-[#b42318] dark:text-[#f58b80]'
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {Math.abs(delta).toFixed(1)} pts {above ? 'above' : 'below'} the school at 90+
    </p>
  );
}

function ClassCard({
  cls,
  index,
  isLast,
  isLeader,
  schoolShare,
  classMax,
}: {
  cls: ClassBandCounts;
  index: number;
  isLast: boolean;
  isLeader: boolean;
  schoolShare: number;
  classMax: number;
}) {
  const total = totalOf(cls.counts);
  // 7 classes fill the 12-column grid as 4 + 3; on two columns an odd last card spans the row
  const span = `${index < 4 ? 'xl:col-span-3' : 'xl:col-span-4'} ${isLast && index % 2 === 0 ? 'sm:col-span-2 xl:col-span-4' : ''}`;
  return (
    <Reveal delay={(index % 4) * 0.07} className={`${cardClass} print-avoid-break flex flex-col p-6 ${span}`}>
      <article className="flex h-full flex-col" aria-labelledby={`class-${cls.classId}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id={`class-${cls.classId}`} className={`truncate text-lg font-medium tracking-tight ${textPrimary}`}>
              {cls.label}
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
              {formatPct(atOrAbove(cls.counts, 'b90'), total)}
            </dd>
          </div>
          <div className="flex flex-col-reverse pl-4">
            <dt className={`mt-1 text-xs ${textMute}`}>scored 95+</dt>
            <dd className={`text-[32px] font-light leading-none tracking-[-0.03em] tabular-nums ${textSecondary}`}>
              {formatPct(cls.counts.b95, total)}
            </dd>
          </div>
        </dl>
        <div className="mt-3">
          <VsSchool classShare={ninetyShare(cls.counts)} schoolShare={schoolShare} />
        </div>

        <div className="mt-auto pt-6">
          <BandColumnChart counts={cls.counts} total={total} groupLabel={cls.label} maxValue={classMax} height={150} />
        </div>
      </article>
    </Reveal>
  );
}

function EmptyState() {
  return (
    <div className={`${cardClass} mx-auto mt-16 max-w-lg p-10 text-center`}>
      <h2 className={`text-balance text-2xl font-light tracking-tight ${textPrimary}`}>No Class Results Yet</h2>
      <p className={`mt-2 text-pretty text-sm ${textSecondary}`}>
        Add each class and its score band counts to <code className="font-mono text-[13px]">src/data/milestoneBands.ts</code>. The
        charts, tables and school totals fill in automatically.
      </p>
    </div>
  );
}

export default function MilestoneDashboardPage() {
  const data = MILESTONE_BAND_DATA;
  const leader = leaderBy90(data.classes);
  const schoolCounts: BandCounts = sumCounts(data.classes);
  const schoolTotal = totalOf(schoolCounts);
  const hasData = leader !== undefined && schoolTotal > 0;
  const ninetyPlus = atOrAbove(schoolCounts, 'b90');
  const ninetyFivePlus = atOrAbove(schoolCounts, 'b95');
  const eightyPlus = atOrAbove(schoolCounts, 'b80');
  const schoolShare = ninetyShare(schoolCounts);
  // One y-scale for every class chart so column heights compare across classes
  const classMax = Math.max(1, ...data.classes.flatMap((cls) => Object.values(cls.counts)));
  const csv = hasData
    ? { filename: `milestone-results-${data.academicYear}-${data.updatedOn}.csv`, ...bandCsv(data.classes) }
    : undefined;

  return (
    <DashboardFrame
      schoolName={data.schoolName}
      updatedLabel={formatDate(data.updatedOn)}
      isSample={data.isSample}
      fontClassName={manrope.className}
      csv={csv}
    >
      <BandThemeStyle />
      <h1 className="sr-only">
        Milestone results, {data.schoolName}, {data.milestone} {data.academicYear}
      </h1>

      <main id="main" tabIndex={-1} className="mx-auto max-w-[1320px] space-y-14 px-4 pb-10 outline-none sm:px-6 lg:px-10">
        {!hasData ? (
          <EmptyState />
        ) : (
          <>
            {/* Headline */}
            <section
              aria-label="Headline figures"
              className="print-avoid-break grid gap-10 pt-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:pt-14"
            >
              <Reveal>
                <p className={`text-sm font-medium ${textSecondary}`}>
                  {data.milestone} · AY {data.academicYear}
                </p>
                <p className={`mt-5 text-[76px] font-light leading-[0.95] tracking-[-0.045em] tabular-nums sm:text-[104px] ${textPrimary}`}>
                  <CountUp value={round1(schoolShare)} decimals={1} suffix="%" />
                </p>
                <p className={`mt-4 text-balance text-2xl font-light tracking-[-0.01em] sm:text-[28px] ${textPrimary}`}>
                  of students scored 90 or above
                </p>
                <p className={`mt-3 max-w-[48ch] text-pretty text-[15px] leading-relaxed ${textSecondary}`}>
                  {formatCount(ninetyPlus)} of {formatCount(schoolTotal)} students across {data.classes.length} classes.{' '}
                  {leader.label} has the highest 90+ share at {formatPct(atOrAbove(leader.counts, 'b90'), totalOf(leader.counts))}.
                </p>
              </Reveal>

              <dl className="grid grid-cols-2 gap-3 sm:gap-4">
                <HeroStat label="Students assessed" value={schoolTotal} detail={`Across ${data.classes.length} classes`} delay={0.1} />
                <HeroStat label="Scored 95+" value={ninetyFivePlus} detail={`${formatPct(ninetyFivePlus, schoolTotal)} of the school`} delay={0.18} />
                <HeroStat label="Scored 80+" value={eightyPlus} detail={`${formatPct(eightyPlus, schoolTotal)} of the school`} delay={0.26} />
                <HeroStat
                  label="Below 70"
                  value={schoolCounts.below70}
                  detail={`${formatPct(schoolCounts.below70, schoolTotal)} of the school`}
                  delay={0.34}
                />
              </dl>
            </section>

            {/* Whole school */}
            <section aria-labelledby="school-heading" className="scroll-mt-20">
              <SectionHeading id="school-heading" title="Whole School" description={`All ${data.classes.length} classes combined`} />
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                <Reveal className={`${cardClass} print-avoid-break flex flex-col p-6 lg:col-span-5`}>
                  <div className="mb-6 flex items-baseline justify-between gap-3">
                    <h3 className={cardTitleClass}>Students per Score Band</h3>
                    <p className={`${cardSubtitleClass} tabular-nums`}>{formatCount(schoolTotal)} students</p>
                  </div>
                  <div className="mt-auto">
                    <BandColumnChart counts={schoolCounts} total={schoolTotal} groupLabel="whole school" height={250} showShare />
                  </div>
                </Reveal>
                <Reveal delay={0.1} className={`${cardClass} print-avoid-break p-6 lg:col-span-7`}>
                  <div className="mb-4">
                    <h3 className={cardTitleClass}>Band Breakdown</h3>
                    <p className={cardSubtitleClass}>At or above counts every student in that band or higher</p>
                  </div>
                  <SchoolBandTable counts={schoolCounts} />
                </Reveal>
              </div>
            </section>

            {/* Class-wise figures */}
            <section aria-labelledby="table-heading" className="scroll-mt-20">
              <SectionHeading
                id="table-heading"
                title="Class-Wise Figures"
                description="Students in each score band, with the share of the class underneath. Select a column heading to rank classes."
              />
              <Reveal className={`${cardClass} print-avoid-break p-4 sm:p-6`}>
                <ClassBandTable classes={data.classes} schoolCounts={schoolCounts} leaderId={leader.classId} />
              </Reveal>
            </section>

            {/* Class by class */}
            <section aria-labelledby="class-heading" className="scroll-mt-20">
              <SectionHeading
                id="class-heading"
                title="Class by Class"
                description="Students per score band. Every chart uses the same scale."
              />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-12">
                {data.classes.map((cls, index) => (
                  <ClassCard
                    key={cls.classId}
                    cls={cls}
                    index={index}
                    isLast={index === data.classes.length - 1}
                    isLeader={cls.classId === leader.classId}
                    schoolShare={schoolShare}
                    classMax={classMax}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {/* A div rather than <footer>: the app's global print CSS hides footers, and this line belongs on paper */}
        <div className={`border-t border-hairline pt-6 text-[13px] dark:border-white/10 ${textMute}`}>
          <span translate="no">{data.schoolName}</span>, {data.milestone}, AY {data.academicYear}. Updated {formatDate(data.updatedOn)}.
          {data.isSample && ' Figures shown are sample data.'}
        </div>
      </main>
    </DashboardFrame>
  );
}
