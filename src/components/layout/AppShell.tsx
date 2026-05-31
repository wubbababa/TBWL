'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Navbar, BreadcrumbBar } from './Navbar';
import { LayoutProvider } from './LayoutContext';
import { ToastProvider } from '@/components/ui/Toast';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
      <LayoutProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Navbar />
            <BreadcrumbBar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4">
              {children}
            </main>
          </div>
        </div>
      </LayoutProvider>
    </ToastProvider>
  );
}
