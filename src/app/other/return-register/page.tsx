'use client';

import React from 'react';
import { 
  FileEdit, 
  Package, 
  Send, 
  Info,
  AlertTriangle,
  Camera
} from 'lucide-react';

export default function ReturnRegisterPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-50 rounded-lg">
          <FileEdit className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">退件登记</h1>
          <p className="text-sm text-gray-500">手动登记退回的包裹信息，以便后续跟进处理</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            基础信息登记
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">退回物流单号 <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                placeholder="请输入退回时使用的快递单号"
                className="w-full h-11 px-4 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">原订单编号</label>
              <input 
                type="text" 
                placeholder="关联的原系统订单号"
                className="w-full h-11 px-4 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">退件原因 <span className="text-red-500">*</span></label>
            <select className="w-full h-11 px-4 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none bg-white">
              <option value="">请选择退件原因</option>
              <option value="reject">客户拒收</option>
              <option value="wrong_address">地址错误/无法投递</option>
              <option value="quality">质量问题退货</option>
              <option value="cancel">客户中途取消</option>
              <option value="other">其他原因</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">详细备注</label>
            <textarea 
              rows={4}
              placeholder="请详细描述包裹情况，如外观破损等..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">图片凭证</label>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group">
              <div className="p-3 bg-gray-50 rounded-full group-hover:bg-blue-100 transition-colors mb-3">
                <Camera className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">点击或拖拽上传图片</p>
              <p className="text-xs text-gray-400 mt-1">支持 JPG, PNG, 单张不超过 5MB</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button className="px-6 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-white transition-all">
            重置
          </button>
          <button className="px-8 py-2.5 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 flex items-center gap-2">
            <Send className="w-4 h-4" />
            提交登记
          </button>
        </div>
      </div>

      <div className="bg-orange-50 rounded-2xl p-4 flex items-start gap-3 border border-orange-100">
        <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <p className="text-sm text-orange-800 leading-relaxed">
          <strong>温馨提示：</strong> 登记成功后，该包裹将进入“退件包裹”列表。请务必核对单号准确性，错误的单号将导致无法进行系统自动关联与理赔申请。
        </p>
      </div>
    </div>
  );
}
