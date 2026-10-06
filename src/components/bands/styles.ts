/**
 * Shared surface and type styles for the milestone dashboard.
 * Design language: the CCWS website palette (warm ink and canvas, maroon accent), hairline borders,
 * warm-tinted shadows, thin display figures.
 * Radius scale: cards 12px (rounded-xl), tags and buttons pill (rounded-full), chart marks 4px (rounded).
 */
export const cardClass =
  'rounded-xl border border-hairline bg-white shadow-[0_1px_3px_rgba(42,33,28,0.08)] dark:border-white/[0.07] dark:bg-night-card dark:shadow-none';

/** Floating panels over the gradient wash (level-2 elevation) */
export const raisedCardClass =
  'rounded-xl border border-white/70 bg-white/90 shadow-[0_8px_24px_rgba(42,33,28,0.08),0_2px_6px_rgba(42,33,28,0.04)] backdrop-blur-sm dark:border-white/[0.08] dark:bg-night-card/80 dark:shadow-none';

export const textPrimary = 'text-ink dark:text-stone-50';
export const textSecondary = 'text-ink-secondary dark:text-stone-300';
export const textMute = 'text-ink-mute dark:text-stone-400';

export const cardTitleClass = `text-[17px] font-medium tracking-tight ${textPrimary}`;
export const cardSubtitleClass = `text-[13px] ${textMute}`;

/** Soft pill tag */
export const tagClass =
  'inline-flex items-center gap-1 rounded-full border border-[#F2D3DC] bg-[#FAF0F3] px-2.5 py-0.5 text-[11px] font-semibold text-maroon dark:border-[#E895A9]/25 dark:bg-[#E895A9]/15 dark:text-[#F5C9D3]';
