import React from 'react';
import { AppHeader } from '@/components/layouts/app-header';
import { AppSidebar } from '@/components/layouts/app-sidebar';
import { MobileBottomNav } from '@/components/layouts/mobile-bottom-nav';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-base text-text-primary">
      <TooltipProvider>
        <AppHeader />
        <div className="flex-1 pb-16 md:pb-0">
          <AppSidebar />
          <div className="md:pl-60 transition-all">
            <main className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
              {children}
            </main>
          </div>
        </div>
        <MobileBottomNav />
      </TooltipProvider>
    </div>
  );
}
