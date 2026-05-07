'use client';

import React from 'react';
import { 
  Search, 
  RefreshCw, 
  PackageSearch,
  RotateCcw,
  List,
  UserCheck
} from 'lucide-react';

export default function ParcelClaimPage() {
  const dummyData = [
    { id: 'JT547175********', time: '2026-03-31 19:44:53', active: '10' },
    { id: '77739534********', time: '2026-03-31 18:17:07', active: '11' },
    { id: '46520970********', time: '2026-03-31 17:20:12', active: '12' },
    { id: '43510567********', time: '2026-03-31 17:20:10', active: '12' },
    { id: '43510569********', time: '2026-03-31 17:19:51', active: '12' },
    { id: '7858797*********', time: '2026-03-31 16:30:33', active: '13' },
    { id: '7859123*********', time: '2026-03-31 16:27:59', active: '13' },
    { id: '7370157*********', time: '2026-03-31 16:26:25', active: '13' },
    { id: '7859119*********', time: '2026-03-31 16:25:07', active: '13' },
    { id: 'YT885423********', time: '2026-03-31 16:24:55', active: '13' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Notice Section */}
      <div className="bg-transparent text-[13px] text-gray-500 leading-relaxed px-1">
        <p>1.包裹認領:指寄到倉庫的快遞包裹没有绑定快递也不是入库快递, 倉庫無法識別是誰的包裹, 稱之為"無主件"</p>
        <p>2.倉庫會將"無主件"進行公示, 您可以通過输入完整的快遞单号校验, 校驗正確後則可以點擊認領</p>
        <p>3.無主件倉庫會进行公示30天, 30天後無人認領, 倉庫即做銷毀處理, 不予任何查找或理賠</p>
      </div>

      {/* Action Bar Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <PackageSearch className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-bold text-gray-800">包裹認領</h1>
          <RefreshCw className="w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500" />
        </div>
        
        <div className="p-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="w-full sm:w-64">
              <input 
                type="text" 
                placeholder="输入您的快遞單號" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div className="w-full sm:w-64">
              <input 
                type="text" 
                placeholder="时间" 
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded focus:border-[#3c8dbc] focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50 transition-colors">
                <Search className="w-4 h-4" />
                <span>查询</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-white border border-gray-300 text-gray-800 text-sm rounded hover:bg-gray-50 transition-colors">
                <span>返回列表</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 h-9 px-4 bg-[#222d32] text-white text-sm rounded hover:bg-[#1a2226] transition-colors shadow-sm">
                <UserCheck className="w-4 h-4" />
                <span>我的认领</span>
              </button>
            </div>
          </div>
          <p className="text-red-600 text-[12px] flex items-center gap-1">
            <span className="w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">i</span>
            请搜索完整的快递单号, 再进行快递认领
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-y border-gray-200 text-gray-700 font-bold">
              <tr>
                <th className="px-4 py-3 min-w-[40px]">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 whitespace-nowrap">快遞單號</th>
                <th className="px-4 py-3 whitespace-nowrap">簽收時間</th>
                <th className="px-4 py-3 whitespace-nowrap">認領狀態</th>
                <th className="px-4 py-3 whitespace-nowrap">認領時間</th>
                <th className="px-4 py-3 whitespace-nowrap">倉庫備註</th>
                <th className="px-4 py-3 whitespace-nowrap">包裹閑置時長</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dummyData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-600">{row.id}</td>
                  <td className="px-4 py-3 text-gray-600">{row.time}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] rounded border border-gray-200">
                      未認領
                    </span>
                  </td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">
                    <span className="text-red-500 font-medium">0天</span>
                    <span className="text-gray-600">/{row.active}小时</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
