import React from 'react';
import { SCORE_BANDS } from '@/data/milestoneBands';

const vars = (mode: 'light' | 'dark') =>
  SCORE_BANDS.map((band) => `--band-${band.id}:${band.fill[mode]};--band-${band.id}-ink:${band.ink[mode]};`).join('');

/** A4 landscape print: keep chart colours, never split a card, drop the interactive chrome */
const PRINT_CSS = [
  '@page{size:A4 landscape;margin:10mm}',
  '.mdash{background:#fff!important}',
  '.mdash *{-webkit-print-color-adjust:exact;print-color-adjust:exact}',
  '.mdash .sticky{position:static!important;backdrop-filter:none!important}',
  '.mdash .print-hide{display:none!important}',
  '.mdash .print-avoid-break{break-inside:avoid}',
  // Sections that reveal on scroll may never have entered the viewport, so force them visible
  '.mdash [style*=opacity]{opacity:1!important}',
  '.mdash [style*=transform]{transform:none!important}',
].join('');

/** Publishes the band palette as CSS variables so charts switch colours with the theme, plus print rules */
export default function BandThemeStyle() {
  const css = `.mdash{${vars('light')}}.dark .mdash{${vars('dark')}}@media print{${PRINT_CSS}}`;
  // Injected as raw CSS: as a text child, React escapes characters such as quotes on the server
  // and the text no longer matches on hydration. The CSS is built only from static palette constants.
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
