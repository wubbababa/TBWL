'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Navbar, BreadcrumbBar } from './Navbar';
import { LayoutProvider } from './LayoutContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    // Login page renders without the ERP shell
    return <>{children}</>;
  }

  return (
    <LayoutProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Navigation */}
          <Navbar />

          {/* Tab bar + Breadcrumb */}
          <BreadcrumbBar />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4">
            {children}
          </main>
        </div>
      </div>
    </LayoutProvider>
  );
}
