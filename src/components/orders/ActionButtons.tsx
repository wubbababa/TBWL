'use client';

import React from 'react';
import { Plus, CloudSync, FileOutput, FileUp, Download, RefreshCw, Trash2, CheckCircle, Package, FileText, ChevronDown } from 'lucide-react';

export const ActionToolbar = () => {
  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Primary Actions (White with border) */}
      <div className="flex flex-wrap items-center gap-2">
        <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm flex items-center gap-1.5 font-bold shadow-sm transition-all active:scale-95">
          <Plus className="w-4 h-4 text-black" />
          <span>手工添加订单</span>
        </button>
        <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm flex items-center gap-1.5 font-bold shadow-sm transition-all active:scale-95">
          <CloudSync className="w-4 h-4 text-black" />
          <span>同步缺失订单</span>
        </button>
        <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm flex items-center gap-1.5 font-bold shadow-sm transition-all active:scale-95">
          <FileOutput className="w-4 h-4 text-black" />
          <span>导出订单</span>
        </button>
        <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm flex items-center gap-1.5 font-bold shadow-sm transition-all active:scale-95">
          <FileUp className="w-4 h-4 text-black" />
          <span>Excel批量导入订单</span>
        </button>
        <button className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm flex items-center gap-1.5 font-bold shadow-sm transition-all active:scale-95">
          <FileUp className="w-4 h-4 text-black" />
          <span>批量上传面单</span>
        </button>

        <a href="#" className="text-blue-600 text-sm hover:underline ml-2">Excel 导入订单模板下载</a>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm font-bold text-gray-700">上次同步:</span>
          <button className="bg-[#f4f4f4] border border-gray-300 hover:bg-gray-200 px-3 py-1 rounded text-sm font-medium shadow-sm transition-all active:scale-95">
            手动同步订单
          </button>
        </div>
      </div>

      {/* Batch Operations (Colored) */}
      <div className="flex flex-wrap items-center gap-2 bg-transparent">
        <button className="bg-[#f39c12] hover:bg-[#e08e0b] text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 shadow-sm transition-all active:scale-95 font-medium">
          <Trash2 className="w-4 h-4" />
          <span>批量删除</span>
        </button>
        <button className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 shadow-sm transition-all active:scale-95 font-medium">
          <CheckCircle className="w-4 h-4" />
          <span>批量快速/库存</span>
        </button>
        <button className="bg-[#00c0ef] hover:bg-[#00add7] text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 shadow-sm transition-all active:scale-95 font-medium">
          <Package className="w-4 h-4" />
          <span>提交打包</span>
        </button>
        
        {/* Disabled / Secondary Actions */}
        <div className="flex flex-wrap items-center gap-1">
          <button className="bg-gray-100 text-gray-400 border border-gray-200 px-3 py-1.5 rounded text-sm cursor-not-allowed">货物描述</button>
          <button className="bg-gray-100 text-gray-400 border border-gray-200 px-3 py-1.5 rounded text-sm cursor-not-allowed">头程标签</button>
          <button className="bg-gray-100 text-gray-400 border border-gray-200 px-3 py-1.5 rounded text-sm cursor-not-allowed">上传面单</button>
          <button className="bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 px-3 py-1.5 rounded text-sm flex items-center gap-1 shadow-sm transition-all active:scale-95">
            <FileText className="w-4 h-4" />
            <span>获取面单</span>
          </button>
          <button className="bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 px-3 py-1.5 rounded text-sm shadow-sm transition-all active:scale-95">设置异常</button>
          <button className="bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 px-3 py-1.5 rounded text-sm shadow-sm transition-all active:scale-95">关闭作废</button>
        </div>

        {/* View Controls on Right */}
        <div className="ml-auto flex items-center gap-2 border border-gray-200 rounded p-1 bg-white">
           <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><RefreshCw className="w-4 h-4 text-gray-600" /></button>
           <button className="p-1.5 hover:bg-gray-100 rounded transition-colors"><Download className="w-4 h-4 text-gray-600 rotate-180" /></button>
           <button className="p-1.5 hover:bg-gray-100 rounded transition-colors flex items-center gap-1 px-2 border-l border-gray-100">
             <div className="grid grid-cols-2 gap-0.5">
               <div className="w-1.5 h-1.5 bg-gray-400"></div>
               <div className="w-1.5 h-1.5 bg-gray-400"></div>
               <div className="w-1.5 h-1.5 bg-gray-400"></div>
               <div className="w-1.5 h-1.5 bg-gray-400"></div>
             </div>
             <ChevronDown className="w-3 h-3 text-gray-400" />
           </button>
        </div>
      </div>
    </div>
  );
};
