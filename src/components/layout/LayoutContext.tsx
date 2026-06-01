'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MENU_ITEMS } from '@/constants/menu';

interface Tab {
  label: string;
  path: string;
}

interface LayoutContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  tabs: Tab[];
  activeTab: string;
  openTab: (tab: Tab) => void;
  closeTab: (path: string) => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

// Build a flat path→label map from menu config
const buildPathMap = (): Record<string, string> => {
  const map: Record<string, string> = {};
  MENU_ITEMS.forEach(item => {
    map[item.path] = item.label;
    item.submenu?.forEach(sub => {
      map[sub.path] = sub.label;
    });
  });
  return map;
};

const PATH_LABEL_MAP = buildPathMap();

const HOME_TAB: Tab = { label: '首页', path: '/home' };

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tabs, setTabs] = useState<Tab[]>([HOME_TAB]);

  // When pathname changes, auto-add a tab for the current page
  useEffect(() => {
    const label = PATH_LABEL_MAP[pathname];
    if (!label) return;
    const tab: Tab = { label, path: pathname };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTabs(prev => {
      if (prev.some(t => t.path === pathname)) return prev;
      return [...prev, tab];
    });
  }, [pathname]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const openTab = useCallback((tab: Tab) => {
    setTabs(prev => {
      if (prev.some(t => t.path === tab.path)) return prev;
      return [...prev, tab];
    });
    router.push(tab.path);
  }, [router]);

  const closeTab = useCallback((path: string) => {
    if (path === HOME_TAB.path) return;
    setTabs(prev => {
      const idx = prev.findIndex(t => t.path === path);
      const next = prev.filter(t => t.path !== path);
      // If closing the active tab, navigate to the previous one
      if (path === pathname) {
        const target = next[Math.max(0, idx - 1)];
        if (target) {
          // Use queueMicrotask to avoid calling router.push inside setState
          queueMicrotask(() => router.push(target.path));
        }
      }
      return next;
    });
  }, [pathname, router]);

  return (
    <LayoutContext.Provider value={{
      sidebarOpen,
      toggleSidebar,
      tabs,
      activeTab: pathname,
      openTab,
      closeTab,
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider');
  return ctx;
}
