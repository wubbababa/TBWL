'use client';

import React, { useState } from 'react';
import { 
  Wallet, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  Zap,
  History,
  AlertCircle
} from 'lucide-react';

export default function RechargePage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('alipay');

  const quickAmounts = ['100', '500', '1000', '2000', '5000', '10000'];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Wallet className="w-7 h-7 text-blue-600" />
          账户充值
        </h1>
        <p className="text-gray-500">快速为您的账户补充资金，确保物流业务不中断</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recharge Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              选择充值金额
            </h2>
            
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
              {quickAmounts.map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`py-3 px-2 rounded-xl border-2 transition-all font-bold text-sm ${
                    amount === val 
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                  }`}
                >
                  ¥{val}
                </button>
              ))}
            </div>

            <div className="relative mb-8">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">¥</span>
              <input
                type="number"
                placeholder="输入自定义金额"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-16 pl-10 pr-4 text-2xl font-bold border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:outline-none transition-all placeholder:font-normal placeholder:text-gray-300"
              />
            </div>

            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              支付方式
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div 
                onClick={() => setMethod('alipay')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                  method === 'alipay' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="w-10 h-10 bg-[#00A3EE] rounded-lg flex items-center justify-center text-white font-bold italic">支</div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-sm">支付宝支付</p>
                  <p className="text-xs text-gray-400 text-nowrap">推荐中国大陆用户使用</p>
                </div>
                {method === 'alipay' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              </div>

              <div 
                onClick={() => setMethod('wechat')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                  method === 'wechat' ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="w-10 h-10 bg-[#07C160] rounded-lg flex items-center justify-center text-white font-bold italic text-nowrap">微</div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-sm">微信支付</p>
                  <p className="text-xs text-gray-400 text-nowrap">便捷的扫码支付体验</p>
                </div>
                {method === 'wechat' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              </div>
            </div>

            <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200 group">
              立即充值
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4 flex items-start gap-3 border border-blue-100">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-800">安全保障</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                所有支付请求均通过银行级加密通道传输，系统不记录您的任何支付密码或银行敏感信息。充值金额将在 1-5 分钟内自动同步至您的账户余额。
              </p>
            </div>
          </div>
        </div>

        {/* Right: Summary & History */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-gray-900 text-white">
              <p className="text-gray-400 text-sm mb-1 font-medium">当前账户余额</p>
              <h3 className="text-3xl font-extrabold italic">¥ 2,450.80</h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">充值金额</span>
                <span className="font-bold text-gray-800">¥ {amount || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-gray-500">手续费 (0%)</span>
                <span className="font-bold text-green-600">¥ 0.00</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-800 text-sm">实付金额</span>
                <span className="text-xl font-extrabold text-blue-600">¥ {amount || '0.00'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <History className="w-4 h-4 text-gray-400" />
                充值记录
              </h3>
              <button className="text-xs text-blue-600 font-bold hover:underline">查看全部</button>
            </div>
            <div className="space-y-4">
              {[
                { date: '2026-05-12 14:20', amount: '+1,000.00', status: '成功', color: 'text-green-600' },
                { date: '2026-05-01 09:15', amount: '+500.00', status: '成功', color: 'text-green-600' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-xs font-bold text-gray-700">{item.amount}</p>
                    <p className="text-[10px] text-gray-400">{item.date}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.color} bg-gray-50 border border-gray-100`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
