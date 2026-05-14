'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ChevronDown, User, X } from 'lucide-react';
import { MENU_ITEMS } from '@/constants/menu';

export const Sidebar = () => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Auto-open the menu group that contains the active path
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    MENU_ITEMS.forEach(item => {
      const isSubPathActive = item.submenu?.some(
        sub => pathname === sub.path || pathname.startsWith(sub.path + '/')
      );
      if (item.isOpen || isSubPathActive) {
        initial[item.label] = true;
      }
    });
    setOpenMenus(prev => ({ ...initial, ...prev }));
  }, [pathname]);

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Filter menu items by search query
  const filteredItems = searchQuery.trim()
    ? MENU_ITEMS.map(item => {
        const labelMatch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
        const matchedSubs = item.submenu?.filter(sub =>
          sub.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (labelMatch) return item;
        if (matchedSubs && matchedSubs.length > 0) {
          return { ...item, submenu: matchedSubs, _forceOpen: true };
        }
        return null;
      }).filter(Boolean) as typeof MENU_ITEMS
    : MENU_ITEMS;

  const isMenuOpen = (label: string, forceOpen?: boolean) =>
    forceOpen || openMenus[label] || false;

  return (
    <aside className="w-64 bg-[#222d32] min-h-screen text-[#b8c7ce] flex flex-col shadow-xl z-20">
      {/* User Info */}
      <div className="p-4 flex items-center gap-3 border-b border-white/5">
        <div className="w-11 h-11 rounded-full bg-gray-500 overflow-hidden border-2 border-white/20 flex-shrink-0">
          <div className="w-full h-full flex items-center justify-center bg-[#374850]">
            <User className="text-white w-7 h-7" />
          </div>
        </div>
        <div className="min-w-0 text-left">
          <h3 className="text-white text-sm font-semibold truncate">Wd2026 (壹邦桃员仓A)</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[11px] text-[#b8c7ce]">
              在线 ID: <span className="text-red-400 font-bold">617</span>
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            placeholder="搜索菜单..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#374850] text-sm py-1.5 pl-8 pr-7 rounded text-white border border-transparent focus:outline-none focus:border-[#4b646f] transition-all placeholder:text-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Nav Label */}
      <div className="px-4 py-2 text-[10px] uppercase font-bold tracking-widest text-[#4b646f] bg-[#1a2226]">
        导航菜单
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide pb-4">
        {filteredItems.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#4b646f] text-sm">
            未找到匹配菜单
          </div>
        ) : (
          filteredItems.map((item) => {
            const hasSubmenu = !!(item.hasSubmenu || item.submenu);
            const forceOpen = (item as any)._forceOpen;
            const isOpen = isMenuOpen(item.label, forceOpen);

            const isItemActive =
              pathname === item.path ||
              (item.path !== '/' && pathname.startsWith(item.path + '/'));
            const isSubActive = item.submenu?.some(
              sub => pathname === sub.path || pathname.startsWith(sub.path + '/')
            );
            const isActive = isItemActive || isSubActive;

            const itemClasses = `
              flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150
              border-l-4 w-full text-left
              hover:bg-[#1e282c] hover:text-white
              ${isActive
                ? 'border-[#3c8dbc] bg-[#1e282c] text-white'
                : 'border-transparent text-[#b8c7ce]'
              }
            `;

            const iconClasses = `w-4 h-4 flex-shrink-0 transition-colors ${
              isActive ? 'text-[#3c8dbc]' : 'text-[#b8c7ce]'
            }`;

            const content = (
              <>
                <item.icon className={iconClasses} />
                <span className="flex-1 text-left leading-tight">{item.label}</span>
                {hasSubmenu && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-white' : 'text-[#4b646f]'
                    }`}
                  />
                )}
              </>
            );

            return (
              <div key={item.label}>
                {hasSubmenu ? (
                  <button onClick={() => toggleMenu(item.label)} className={itemClasses}>
                    {content}
                  </button>
                ) : (
                  <Link href={item.path} className={itemClasses}>
                    {content}
                  </Link>
                )}

                {/* Submenu with slide animation */}
                {item.submenu && (
                  <div
                    className="overflow-hidden transition-all duration-200 ease-in-out"
                    style={{
                      maxHeight: isOpen ? `${item.submenu.length * 44}px` : '0px',
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="bg-[#2c3b41]">
                      {item.submenu.map((sub) => {
                        const isSubPathActive =
                          pathname === sub.path || pathname.startsWith(sub.path + '/');
                        return (
                          <Link
                            key={sub.label}
                            href={sub.path}
                            className={`
                              flex items-center gap-2 pl-11 pr-4 py-2.5 text-[13px]
                              transition-all duration-150 border-l-4
                              hover:bg-[#243038] hover:text-white
                              ${isSubPathActive
                                ? 'border-[#3c8dbc] text-white bg-[#243038] font-medium'
                                : 'border-transparent text-[#8aa4af]'
                              }
                            `}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                isSubPathActive ? 'bg-[#3c8dbc]' : 'bg-[#4b646f]'
                              }`}
                            />
                            <span className="flex-1">{sub.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5 text-[11px] text-[#4b646f] text-center">
        臺邦國際物流 © 2026
      </div>
    </aside>
  );
};
