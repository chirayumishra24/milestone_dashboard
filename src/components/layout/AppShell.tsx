'use client';
import React, { Suspense, useCallback, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { ToastProvider } from '@/components/ui/Toast';
import { LoadingState } from '@/components/ui/PageStatus';

/**
 * Client-side frame shared by every page: sidebar (desktop rail + mobile drawer), header,
 * footer and toast notifications.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);

  return (
    <ToastProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-blue-600 focus:text-white focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar mobileOpen={mobileNavOpen} onMobileClose={closeMobileNav} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onOpenNav={openMobileNav} />
          <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
            {/* Pages read filters from the URL (useSearchParams), which needs a Suspense boundary */}
            <Suspense fallback={<LoadingState />}>{children}</Suspense>
          </main>
          <Footer />
        </div>
      </div>
    </ToastProvider>
  );
}
