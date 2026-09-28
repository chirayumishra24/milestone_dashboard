/**
 * Shared surface and type styles for the milestone dashboard.
 * Design language: navy ink on a cool canvas, hairline borders, navy-tinted shadows, thin display figures.
 * Radius scale: cards 12px (rounded-xl), tags and buttons pill (rounded-full), chart marks 4px (rounded).
 */
export const cardClass =
  'rounded-xl border border-hairline bg-white shadow-[0_1px_3px_rgba(0,55,112,0.08)] dark:border-white/[0.07] dark:bg-night-card dark:shadow-none';

/** Floating panels over the gradient wash (level-2 elevation) */
export const raisedCardClass =
  'rounded-xl border border-white/70 bg-white/90 shadow-[0_8px_24px_rgba(0,55,112,0.08),0_2px_6px_rgba(0,55,112,0.04)] backdrop-blur-sm dark:border-white/[0.08] dark:bg-night-card/80 dark:shadow-none';

export const textPrimary = 'text-ink dark:text-slate-50';
export const textSecondary = 'text-ink-secondary dark:text-slate-300';
export const textMute = 'text-ink-mute dark:text-slate-400';

export const cardTitleClass = `text-[17px] font-medium tracking-tight ${textPrimary}`;
export const cardSubtitleClass = `text-[13px] ${textMute}`;

/** Soft pill tag */
export const tagClass =
  'inline-flex items-center gap-1 rounded-full bg-[#dfe9fb] px-2.5 py-1 text-[11px] font-semibold text-[#1c4f99] dark:bg-blue-400/15 dark:text-blue-200';
