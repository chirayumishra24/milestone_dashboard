import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { CLASS_IX_ACTUAL_DATA } from '@/data/class9ActualData';
import { actualDataCsv } from '@/utils/bands';
import Class9Dashboard from '@/components/bands/Class9Dashboard';

const manrope = Manrope({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Milestone Results · Class IX',
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
  return (
    <Class9Dashboard
      data={data}
      fontClassName={manrope.className}
      csv={{ filename: `class-ix-results-${data.academicYear}.csv`, ...actualDataCsv(data) }}
    />
  );
}
