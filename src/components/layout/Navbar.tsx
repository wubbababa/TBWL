'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Maximize,
  Minimize,
  Bell,
  User,
  Power,
  ChevronLeft,
  ChevronRight,
  X,
  Home,
} from 'lucide-react';
import { useLayout } from './LayoutContext';
import { usePathname, useRouter } from 'next/navigation';
import { MENU_ITEMS } from '@/constants/menu';
import { useAuth } from '@/lib/auth';

// ─── Navbar ──────────────────────────────────────────────────────────────────

export const Navbar = () => {
  const { toggleSidebar } = useLayout();
  const { user, signOut } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const router = useRouter();

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+B: toggle sidebar
      if (e.ctrlKey && e.key === 'b') { e.preventDefault(); toggleSidebar(); }
      // Ctrl+H: go home
      if (e.ctrlKey && e.key === 'h') { e.preventDefault(); router.push('/home'); }
      // F11: fullscreen
      if (e.key === 'F11') { e.preventDefault(); handleFullscreen(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, router]);

  return (
    <header className="h-12 bg-[#228b22] text-white flex items-center justify-between px-4 shadow-md z-10 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="hover:bg-black/15 p-1.5 rounded transition-colors"
          title="折叠/展开侧边栏"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold text-base tracking-wider select-none">
          客户端贴单ERP系统
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 text-sm">
        {/* Fullscreen */}
        <button
          onClick={handleFullscreen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-black/15 transition-colors"
          title={isFullscreen ? '退出全屏' : '全屏'}
        >
          {isFullscreen
            ? <Minimize className="w-4 h-4" />
            : <Maximize className="w-4 h-4" />}
          <span className="text-xs font-medium hidden sm:inline">
            {isFullscreen ? '退出全屏' : '全屏'}
          </span>
        </button>

        {/* Divider */}
        <span className="w-px h-5 bg-white/20 mx-1" />

        {/* Notifications */}
        <NotificationBell />

        {/* Divider */}
        <span className="w-px h-5 bg-white/20 mx-1" />

        {/* User */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-black/15 transition-colors cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium hidden sm:inline">
            {user?.email ?? '—'}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={signOut}
          className="p-1.5 rounded hover:bg-black/15 transition-colors"
          title="退出登录"
        >
          <Power className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

// ─── Notification Bell ───────────────────────────────────────────────────────

import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [hasFetched, setHasFetched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch recent operation logs as notifications (only on first open)
  useEffect(() => {
    if (!open || hasFetched) return;
    (async () => {
      const { data } = await supabase
        .from('operation_logs')
        .select('id, action, module, detail, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setNotifications(data.map(row => ({
          id: String(row.id),
          text: `[${row.module}] ${row.action}${row.detail ? '：' + row.detail : ''}`,
          time: timeAgo(row.created_at),
          read: readIds.has(String(row.id)),
        })));
        setHasFetched(true);
      }
    })();
  }, [open, hasFetched, readIds]);

  const unread = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const markAllRead = () => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadIds(prev => new Set([...prev, ...allIds]));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const refreshNotifications = () => {
    setHasFetched(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-1.5 rounded hover:bg-black/15 transition-colors"
        title="通知"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 rounded-full border border-white text-[10px] font-bold flex items-center justify-center px-0.5">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-bold text-gray-800 text-sm">通知中心</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[#3c8dbc] hover:underline"
              >
                全部标为已读
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`px-4 py-3 flex gap-3 items-start hover:bg-gray-50 transition-colors ${
                  n.read ? 'opacity-60' : ''
                }`}
              >
                <span
                  className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    n.read ? 'bg-gray-300' : 'bg-[#3c8dbc]'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-relaxed">{n.text}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-gray-100 text-center">
            <button onClick={refreshNotifications} className="text-xs text-[#3c8dbc] hover:underline">
              刷新通知
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

// Build breadcrumb label from pathname
const buildBreadcrumb = (pathname: string): string[] => {
  const crumbs: string[] = ['首页'];
  for (const item of MENU_ITEMS) {
    if (item.submenu) {
      const sub = item.submenu.find(
        s => pathname === s.path || pathname.startsWith(s.path + '/')
      );
      if (sub) {
        crumbs.push(item.label, sub.label);
        return crumbs;
      }
    }
    if (
      pathname === item.path ||
      (item.path !== '/' && pathname.startsWith(item.path + '/'))
    ) {
      if (item.path !== '/home') crumbs.push(item.label);
      return crumbs;
    }
  }
  return crumbs;
};

export const BreadcrumbBar = () => {
  const { tabs, activeTab, closeTab } = useLayout();
  const pathname = usePathname();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const breadcrumbs = buildBreadcrumb(pathname);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col flex-shrink-0">
      {/* Tab row */}
      <div className="h-9 bg-white border-b border-gray-200 flex items-stretch text-xs overflow-hidden">
        {/* Scroll left */}
        <button
          onClick={() => scroll('left')}
          className="flex items-center justify-center w-7 flex-shrink-0 border-r border-gray-100 hover:bg-gray-50 transition-colors text-gray-400 hover:text-red-500"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Tabs */}
        <div
          ref={scrollRef}
          className="flex items-stretch flex-1 overflow-x-auto scrollbar-hide"
        >
          {tabs.map(tab => {
            const isActive = tab.path === activeTab;
            const isHome = tab.path === '/home';
            return (
              <div
                key={tab.path}
                className={`
                  group flex items-center gap-1.5 px-3 border-r border-gray-100
                  cursor-pointer select-none flex-shrink-0 transition-colors
                  ${isActive
                    ? 'bg-[#ecf0f5] text-gray-800 font-semibold border-t-2 border-t-[#3c8dbc]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 border-t-2 border-t-transparent'
                  }
                `}
                onClick={() => router.push(tab.path)}
              >
                {isHome && <Home className="w-3 h-3 flex-shrink-0" />}
                <span className="whitespace-nowrap">{tab.label}</span>
                {!isHome && (
                  <button
                    onClick={e => { e.stopPropagation(); closeTab(tab.path); }}
                    className={`
                      ml-0.5 rounded-full p-0.5 transition-colors flex-shrink-0
                      ${isActive
                        ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        : 'text-transparent group-hover:text-gray-400 group-hover:hover:text-red-500'
                      }
                    `}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Scroll right */}
        <button
          onClick={() => scroll('right')}
          className="flex items-center justify-center w-7 flex-shrink-0 border-l border-gray-100 hover:bg-gray-50 transition-colors text-gray-400 hover:text-red-500"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Breadcrumb row */}
      <div className="h-8 bg-[#f8f9fa] border-b border-gray-200 flex items-center px-4 gap-1.5 text-[11px] text-gray-400">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />}
            <span
              className={
                i === breadcrumbs.length - 1
                  ? 'text-gray-600 font-medium'
                  : 'hover:text-gray-600 cursor-pointer transition-colors'
              }
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
