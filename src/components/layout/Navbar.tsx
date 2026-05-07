'use client';

import React from 'react';
import { Menu, Maximize, Save, Bell, User, Power, ChevronLeft, ChevronRight, X } from 'lucide-react';

export const Navbar = () => {
  return (
    <header className="h-12 bg-[#228b22] text-white flex items-center justify-between px-4 shadow-sm z-10">
      {/* Left Section: Menu Toggle & Title */}
      <div className="flex items-center gap-4">
        <button className="hover:bg-black/10 p-1.5 rounded transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold text-lg tracking-wider">客户端</span>
      </div>

      {/* Right Section: System Actions */}
      <div className="flex items-center gap-5 text-sm">
        <button className="flex items-center gap-1.5 hover:text-white/80 transition-colors">
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            <span className="font-bold">取消全屏</span>
          </div>
        </button>
        <button className="flex items-center gap-1.5 hover:text-white/80 transition-colors">
          <div className="flex items-center gap-1">
            <Save className="w-4 h-4" />
            <span className="font-bold">保存桌面</span>
          </div>
        </button>
        <button className="relative hover:text-white/80 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <div className="flex items-center gap-2 border-l border-white/20 pl-4">
          <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <span className="font-medium">客户端贴单ERP系统</span>
        </div>
        <button className="hover:text-white/80 transition-colors">
          <Power className="w-4 h-4 rotate-90" />
        </button>
      </div>
    </header>
  );
};

export const BreadcrumbBar = () => {
  const tabs = [
    '库存商品', '申请入库', '库存调用记录', '商品库', '台湾库存商品', 
    '台湾申请入库', '台湾库存调用记录', '台湾商品库', '退件包裹', 
    '退件登记', '包裹认领', '索赔登记', '消费明细', '帐户充值', 
    '物流明细', '扫码登记'
  ];

  return (
    <div className="h-10 bg-white border-b border-gray-200 flex items-center px-4 gap-4 text-xs text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <div className="flex items-center justify-center min-w-[32px] h-full border-r border-gray-100 hover:bg-gray-50 cursor-pointer group">
        <ChevronLeft className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
      </div>
      
      <div className="flex items-center gap-1 h-full">
        {tabs.map((tab) => (
          <div 
            key={tab} 
            className={`flex items-center gap-1 px-3 py-1 rounded transition-colors cursor-pointer border ${
              tab === '首页' 
                ? 'bg-[#ecf0f5] border-gray-200 text-gray-800 font-bold' 
                : 'border-transparent hover:bg-gray-50'
            }`}
          >
            <span>{tab}</span>
            {tab === '首页' && <X className="w-3 h-3 text-red-500 hover:text-red-700 ml-1" />}
          </div>
        ))}
      </div>

      <div className="flex-1"></div>

      <div className="flex items-center justify-center min-w-[32px] h-full border-l border-gray-100 hover:bg-gray-50 cursor-pointer group">
        <ChevronRight className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
      </div>
    </div>
  );
};
