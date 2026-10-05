import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { CLASS_IX_ACTUAL_DATA } from '@/data/class9ActualData';
import { actualDataCsv, formatDate } from '@/utils/bands';
import DashboardFrame from '@/components/bands/DashboardFrame';
import BandThemeStyle from '@/components/bands/BandThemeStyle';
import Class9Dashboard from '@/components/bands/Class9Dashboard';
import { textMute } from '@/components/bands/styles';

const manrope = Manrope({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Class IX Results',
  description: 'Class IX score bands for the whole class and each subject, from the FMS sheet',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f9fc' },
    { media: '(prefers-color-scheme: dark)', color: '#0a1426' },
  ],
};

export default function Class9ResultsPage() {
  const data = CLASS_IX_ACTUAL_DATA;
  const savedOn = data.source.sheetSavedOn ? formatDate(data.source.sheetSavedOn) : undefined;

  return (
    <DashboardFrame
      title="Class IX Results"
      schoolName={data.school}
      updatedLabel={savedOn ? `Sheet saved ${savedOn}` : 'From the FMS sheet'}
      fontClassName={manrope.className}
      csv={{ filename: `class-ix-results-${data.academicYear}.csv`, ...actualDataCsv(data) }}
    >
      <BandThemeStyle />
      <h1 className="sr-only">
        Class IX results, {data.school}, academic year {data.academicYear}
      </h1>

      <main id="main" tabIndex={-1} className="mx-auto max-w-[1320px] space-y-14 px-4 pb-10 outline-none sm:px-6 lg:px-10">
        <Class9Dashboard data={data} />

        {/* A div rather than <footer>: the app's global print CSS hides footers, and this line belongs on paper */}
        <div className={`border-t border-hairline pt-6 text-[13px] dark:border-white/10 ${textMute}`}>
          <span translate="no">{data.school}</span>, Class IX, AY {data.academicYear}. Source: &ldquo;{data.source.tab}&rdquo; tab of{' '}
          <span translate="no">{data.source.workbook}</span>
          {savedOn && <> (saved {savedOn})</>}. Student counts per score band only.
        </div>
      </main>
    </DashboardFrame>
  );
}
