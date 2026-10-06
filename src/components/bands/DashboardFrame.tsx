'use client';
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Download, GraduationCap, Maximize2, Minimize2, Moon, Printer, Sun } from 'lucide-react';
import { downloadCsv, type CsvCell } from '@/utils/csv';

interface DashboardFrameProps {
  /** Title in the top bar, e.g. "Milestone Results" */
  title: string;
  /** Line under the title, e.g. "Cambridge Court World School · Class IX" */
  subtitle: string;
  /** Shorter line for phones, e.g. "Class IX · CCWS" */
  shortSubtitle?: string;
  fontClassName: string;
  /**
   * Controls for the top bar (the exam toggle). Rendered twice, inline from md up and as a
   * full-width row on phones, so each placement can give its animation its own id.
   */
  controls?: (placement: 'bar' | 'row') => React.ReactNode;
  /** Figures offered by the CSV button; omitted when there is nothing to export */
  csv?: { filename: string; headers: string[]; rows: CsvCell[][] };
  children: React.ReactNode;
}

const THEME_KEY = 'milestone-dashboard-theme';
const PAGE_BG = { light: '#FAF6F0', dark: '#14100E' };

const iconButton =
  'inline-flex h-9 w-9 touch-manipulation items-center justify-center rounded-full text-ink-mute transition hover:bg-white hover:text-ink active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-50';

/**
 * Soft gradient wash across the top of the page (layered radial gradients, an approximation of a
 * mesh gradient). It fades into the canvas so the data below sits on a calm surface.
 */
function GradientWash() {
  return (
    <div
      aria-hidden="true"
      className="print-hide pointer-events-none absolute inset-x-0 top-0 -z-10 h-[700px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_45%,transparent)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(40%_60%_at_12%_20%,#F6E4E8_0%,transparent_70%),radial-gradient(35%_55%_at_45%_0%,#FBF0E6_0%,transparent_70%),radial-gradient(38%_60%_at_78%_18%,#F1D5DC_0%,transparent_70%),radial-gradient(30%_45%_at_96%_60%,#F8E8D6_0%,transparent_70%)] dark:hidden" />
      <div className="absolute inset-0 hidden bg-[radial-gradient(40%_60%_at_12%_15%,rgba(150,3,48,0.22)_0%,transparent_70%),radial-gradient(38%_60%_at_80%_10%,rgba(186,60,93,0.14)_0%,transparent_70%),radial-gradient(30%_45%_at_50%_40%,rgba(106,2,34,0.20)_0%,transparent_70%)] dark:block" />
    </div>
  );
}

/**
 * Page frame: top bar (title, exam controls, CSV, print, theme, fullscreen) and the
 * light/dark theme, which follows the system until the viewer picks one.
 */
export default function DashboardFrame({ title, subtitle, shortSubtitle, fontClassName, controls, csv, children }: DashboardFrameProps) {
  const [dark, setDark] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  // iPhone Safari has no element fullscreen, so the button is only offered where it works
  const [canFullscreen, setCanFullscreen] = useState(false);
  const darkBeforePrint = useRef<boolean | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      setDark(saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch {
      /* storage unavailable: keep light */
    }
    setCanFullscreen(Boolean(document.fullscreenEnabled));
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    // Paper is white: print in the light theme, then restore the viewer's choice
    const onBeforePrint = () =>
      setDark((prev) => {
        darkBeforePrint.current = prev;
        return false;
      });
    const onAfterPrint = () => {
      if (darkBeforePrint.current !== null) setDark(darkBeforePrint.current);
      darkBeforePrint.current = null;
    };
    document.addEventListener('fullscreenchange', onFullscreen);
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, []);

  // The page scrollbar, overscroll area and anchor offsets belong to <html>/<body>, not this wrapper
  useEffect(() => {
    const root = document.documentElement;
    const previous = {
      colorScheme: root.style.colorScheme,
      scrollPadding: root.style.scrollPaddingTop,
      background: document.body.style.backgroundColor,
    };
    root.style.colorScheme = dark ? 'dark' : 'light';
    root.style.scrollPaddingTop = '6rem';
    document.body.style.backgroundColor = dark ? PAGE_BG.dark : PAGE_BG.light;
    return () => {
      root.style.colorScheme = previous.colorScheme;
      root.style.scrollPaddingTop = previous.scrollPadding;
      document.body.style.backgroundColor = previous.background;
    };
  }, [dark]);

  const toggleTheme = () => {
    setDark((prev) => {
      try {
        localStorage.setItem(THEME_KEY, prev ? 'light' : 'dark');
      } catch {
        /* ignore */
      }
      return !prev;
    });
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  return (
    // Tailwind's class-based `dark:` variant matches descendants of `.dark`, so the class sits on this wrapper
    <div className={dark ? 'dark' : ''}>
      <div
        className={`mdash ${fontClassName} relative isolate min-h-screen bg-canvas-soft text-ink antialiased transition-colors duration-300 dark:bg-night dark:text-stone-100`}
        style={{ colorScheme: dark ? 'dark' : 'light' }}
      >
        <a
          href="#main"
          className="sr-only z-30 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
        >
          Skip to Content
        </a>
        <GradientWash />

        <div className="sticky top-0 z-20 border-b border-hairline/70 bg-canvas-soft/70 backdrop-blur-xl dark:border-white/[0.07] dark:bg-night/70">
          <div className="mx-auto max-w-[1320px] space-y-2 px-4 py-3 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-maroon text-white shadow-[0_4px_12px_rgba(150,3,48,0.25)] dark:bg-[#E895A9]/15 dark:text-[#F5C9D3] dark:shadow-none">
                  <GraduationCap className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-base font-semibold tracking-tight">{title}</p>
                  <p className="truncate text-xs text-ink-mute dark:text-stone-400" translate="no">
                    {shortSubtitle ? (
                      <>
                        <span className="sm:hidden">{shortSubtitle}</span>
                        <span className="hidden sm:inline">{subtitle}</span>
                      </>
                    ) : (
                      subtitle
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-0.5 sm:gap-2">
                {controls && <div className="hidden md:block">{controls('bar')}</div>}
                <div className="print-hide flex items-center">
                  {csv && (
                    <button
                      type="button"
                      onClick={() => downloadCsv(csv.filename, csv.headers, csv.rows)}
                      className={iconButton}
                      aria-label="Download all figures as CSV"
                      title="Download CSV"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                  <button type="button" onClick={() => window.print()} className={iconButton} aria-label="Print dashboard" title="Print or save as PDF">
                    <Printer className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={iconButton}
                    aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
                    title={dark ? 'Light theme' : 'Dark theme'}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={dark ? 'sun' : 'moon'}
                        initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
                        transition={{ duration: 0.2 }}
                        className="flex"
                      >
                        {dark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
                      </motion.span>
                    </AnimatePresence>
                  </button>
                  {canFullscreen && (
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className={iconButton}
                      aria-label={fullscreen ? 'Exit fullscreen' : 'Present fullscreen'}
                      title={fullscreen ? 'Exit fullscreen' : 'Present fullscreen'}
                    >
                      {fullscreen ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Phones: the exam toggle gets its own full-width row */}
            {controls && <div className="w-full md:hidden">{controls('row')}</div>}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
