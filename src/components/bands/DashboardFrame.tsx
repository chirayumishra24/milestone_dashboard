'use client';
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Download, GraduationCap, Maximize2, Minimize2, Moon, Printer, Sun } from 'lucide-react';
import { downloadCsv, type CsvCell } from '@/utils/csv';
import { tagClass } from './styles';

interface DashboardFrameProps {
  schoolName: string;
  updatedLabel: string;
  isSample: boolean;
  fontClassName: string;
  /** Class-wise table offered by the CSV button; omitted when there is nothing to export */
  csv?: { filename: string; headers: string[]; rows: CsvCell[][] };
  children: React.ReactNode;
}

const THEME_KEY = 'milestone-dashboard-theme';
const PAGE_BG = { light: '#f6f9fc', dark: '#0a1426' };

const pillButton =
  'inline-flex h-9 touch-manipulation items-center justify-center gap-2 rounded-full px-3.5 text-sm font-medium transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-night';
const pillGhost = `${pillButton} border border-hairline bg-white/80 text-ink hover:border-[#c9d3df] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10`;
const pillSolid = `${pillButton} bg-ink text-white hover:bg-ink-secondary dark:bg-slate-100 dark:text-ink dark:hover:bg-white`;

/**
 * Soft gradient wash across the top of the page (layered radial gradients, an approximation of a
 * mesh gradient). It fades into the canvas so the data below sits on a calm surface.
 */
function GradientWash() {
  return (
    <div
      aria-hidden="true"
      className="print-hide pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_45%,transparent)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(40%_60%_at_12%_20%,#d6e5fb_0%,transparent_70%),radial-gradient(35%_55%_at_45%_0%,#e9eefc_0%,transparent_70%),radial-gradient(38%_60%_at_78%_18%,#bcd6f7_0%,transparent_70%),radial-gradient(30%_45%_at_96%_60%,#fbeee0_0%,transparent_70%)] dark:hidden" />
      <div className="absolute inset-0 hidden bg-[radial-gradient(40%_60%_at_12%_15%,rgba(37,106,191,0.30)_0%,transparent_70%),radial-gradient(38%_60%_at_80%_10%,rgba(57,135,229,0.22)_0%,transparent_70%),radial-gradient(30%_45%_at_50%_40%,rgba(24,79,149,0.25)_0%,transparent_70%)] dark:block" />
    </div>
  );
}

/**
 * Page frame: top bar, light/dark theme (follows the system until the viewer picks one),
 * CSV export, print, and a Present button that puts the dashboard into fullscreen for display screens.
 */
export default function DashboardFrame({ schoolName, updatedLabel, isSample, fontClassName, csv, children }: DashboardFrameProps) {
  const [dark, setDark] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const darkBeforePrint = useRef<boolean | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      setDark(saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch {
      /* storage unavailable: keep light */
    }
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
    root.style.scrollPaddingTop = '5rem';
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
        className={`mdash ${fontClassName} relative isolate min-h-screen bg-canvas-soft text-ink antialiased transition-colors duration-300 dark:bg-night dark:text-slate-100`}
        style={{ colorScheme: dark ? 'dark' : 'light' }}
      >
        <a
          href="#main"
          className="sr-only z-30 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
        >
          Skip to Content
        </a>
        <GradientWash />

        <div className="sticky top-0 z-20 bg-canvas-soft/60 backdrop-blur-xl dark:bg-night/60">
          <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-ink text-white dark:bg-white/10 dark:text-blue-100">
                <GraduationCap className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[15px] font-semibold tracking-tight">Milestone Results</p>
                <p className="truncate text-xs text-ink-mute dark:text-slate-400" translate="no">
                  {schoolName}
                </p>
              </div>
            </div>

            <div className="print-hide flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
              {isSample && <span className={`${tagClass} hidden md:inline-flex`}>Sample Data</span>}
              <span className="hidden text-xs text-ink-mute xl:inline dark:text-slate-400">Updated {updatedLabel}</span>
              {csv && (
                <button
                  type="button"
                  onClick={() => downloadCsv(csv.filename, csv.headers, csv.rows)}
                  className={`${pillGhost} max-sm:w-9 max-sm:px-0`}
                  aria-label="Download class-wise figures as CSV"
                  title="Download CSV"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => window.print()}
                className={`${pillGhost} max-sm:w-9 max-sm:px-0`}
                aria-label="Print Dashboard"
                title="Print or save as PDF"
              >
                <Printer className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className={`${pillGhost} w-9 px-0`}
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
              <button
                type="button"
                onClick={toggleFullscreen}
                className={`${pillSolid} max-sm:w-9 max-sm:px-0`}
                aria-label={fullscreen ? 'Exit fullscreen' : 'Present fullscreen'}
              >
                {fullscreen ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
                <span className="hidden sm:inline">{fullscreen ? 'Exit' : 'Present'}</span>
              </button>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
