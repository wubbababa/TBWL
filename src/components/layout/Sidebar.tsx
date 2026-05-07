'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ChevronDown, ChevronRight, User } from 'lucide-react';
import { MENU_ITEMS } from '@/constants/menu';

export const Sidebar = () => {
  const pathname = usePathname();
  
  // Store the open state for menus with submenus
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Automatically open the menu that contains the current active path
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    MENU_ITEMS.forEach(item => {
      // If it's the current main item or its submenu contains the current pathname
      const isSubPathActive = item.submenu?.some(sub => pathname === sub.path || pathname.startsWith(sub.path + '/'));
      const isMainActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
      
      if (item.isOpen || isSubPathActive || isMainActive) {
        initial[item.label] = true;
      }
    });
    setOpenMenus(prev => ({ ...initial, ...prev }));
  }, [pathname]);

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  return (
    <aside className="w-64 bg-[#222d32] min-h-screen text-[#b8c7ce] flex flex-col shadow-xl z-20">
      {/* User Info Section */}
      <div className="p-4 flex items-center gap-3 bg-[#222d32]">
        <div className="w-11 h-11 rounded-full bg-gray-500 overflow-hidden border-2 border-white/20 flex-shrink-0">
          <div className="w-full h-full flex items-center justify-center bg-gray-400">
             <User className="text-white w-7 h-7" />
          </div>
        </div>
        <div className="min-w-0 text-left">
          <h3 className="text-white text-sm font-semibold truncate">Wd2026 (壹邦桃员仓A)</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3c763d] border border-white/10 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5cb85c]"></div>
            </div>
            <span className="text-[11px] text-[#b8c7ce]">在线 ID: <span className="text-red-500 font-bold">617</span></span>
          </div>
        </div>
      </div>

      {/* Sidebar Search */}
      <div className="px-3 py-2">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-[#374850] text-sm py-1.5 pl-3 pr-8 rounded text-white border border-transparent focus:outline-none focus:border-gray-500 transition-all placeholder:text-gray-500"
          />
          <button className="absolute right-0 top-0 h-full px-2.5 flex items-center justify-center hover:bg-[#4b646f] rounded-r transition-colors">
            <Search className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Navigation Label */}
      <div className="px-4 py-2.5 text-[10px] uppercase font-bold text-[#4b646f] bg-[#1a2226]">
        导航菜单
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide">
        {MENU_ITEMS.map((item) => {
          const isOpen = openMenus[item.label];
          const hasSubmenu = !!(item.hasSubmenu || item.submenu);
          
          // Determine if this item or any of its sub-items is active
          const isItemActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          const isSubActive = item.submenu?.some(sub => pathname === sub.path);
          const isActive = isItemActive || isSubActive;

          const content = (
            <>
              <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#b8c7ce] group-hover:text-white'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {hasSubmenu && (
                <ChevronRight className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90 text-white' : 'text-[#4b646f] group-hover:text-white'}`} />
              )}
            </>
          );

          const baseClasses = `flex items-center gap-3 px-4 py-3 text-sm transition-all border-l-4 w-full text-left group-hover:bg-[#1e282c] group-hover:text-white ${
            isActive 
              ? 'border-[#228b22] bg-[#1e282c] text-white' 
              : 'border-transparent text-[#b8c7ce]'
          }`;

          return (
            <div key={item.label} className="group">
              {hasSubmenu ? (
                <button 
                  onClick={() => toggleMenu(item.label)}
                  className={baseClasses}
                >
                  {content}
                </button>
              ) : (
                <Link href={item.path} className={baseClasses}>
                  {content}
                </Link>
              )}

              {/* Submenu */}
              {item.submenu && isOpen && (
                <div className="bg-[#2c3b41]">
                  {item.submenu.map((sub) => {
                    const isSubPathActive = pathname === sub.path;
                    return (
                      <Link
                        key={sub.label}
                        href={sub.path}
                        className={`flex items-center gap-3 pl-12 pr-4 py-2 text-sm transition-all hover:text-white ${
                          isSubPathActive ? 'text-white font-bold' : 'text-[#8aa4af]'
                        }`}
                      >
                        <span className="flex-1 text-left">{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
