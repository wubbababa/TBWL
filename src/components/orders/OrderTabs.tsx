'use client';

import React, { useState } from 'react';

const TABS = [
  '所有订单', '待处理', '已提交/待打包', '转运中', '预刷件', 
  '取消中', '异常件', '待确认入店', '已送店', '退件重发', '已关闭'
];

export const OrderTabs = () => {
  const [activeTab, setActiveTab] = useState('待处理');

  return (
    <div className="flex flex-wrap gap-1 mb-4">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-3 py-1.5 text-sm rounded transition-colors ${
            activeTab === tab
              ? 'bg-[#3c8dbc] text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};
