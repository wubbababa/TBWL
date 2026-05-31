'use client';

import { useEffect, useState } from 'react';
import { 
  ShoppingCart, 
  ShoppingBag, 
  Megaphone,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProfitTrendChart from '@/components/home/ProfitTrendChart';

const StatCard = ({ count, label, Icon, color, loading, href }: { count: string | number, label: string, Icon: React.ComponentType<{ className?: string }>, color: string, loading?: boolean, href?: string }) => (
  <Link href={href || '#'} className={`${color} rounded-sm shadow-sm text-white flex flex-col relative overflow-hidden group h-[110px] cursor-pointer`}>
    <div className="p-4 z-10">
      <h3 className="text-3xl font-bold">{loading ? '...' : count}</h3>
      <p className="text-sm opacity-90">{label}</p>
    </div>
    <div className="absolute top-2 right-2 opacity-20 transition-transform group-hover:scale-110">
      <Icon className="w-16 h-16" />
    </div>
    <div className="mt-auto bg-black/10 py-1 px-4 text-center hover:bg-black/20 transition-colors flex items-center justify-center gap-1 text-xs">
      <span>詳情</span>
      <ArrowRight className="w-3 h-3" />
    </div>
  </Link>
);

export default function HomePage() {
  const [stats, setStats] = useState({
    all: 0,
    pending: 0,
    taiwan: 0,
    abnormal: 0
  });
  const [accountStats, setAccountStats] = useState({
    balance: 0,
    totalExpense: 0,
    totalRecharge: 0,
  });
  const [loading, setLoading] = useState(true);
  const [accountLoading, setAccountLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 获取各状态数量
      const { data: allData } = await supabase.from('orders').select('status');
      
      if (allData) {
        const counts = {
          all: allData.length,
          pending: allData.filter(o => o.status === '待处理').length,
          taiwan: allData.filter(o => o.status === '已送店' || o.status === '待确认入店').length,
          abnormal: allData.filter(o => o.status === '异常件').length
        };
        setStats(counts);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountStats = async () => {
    setAccountLoading(true);
    try {
      const res = await fetch('/api/account-stats');
      if (res.ok) {
        const data = await res.json();
        setAccountStats({
          balance: data.balance,
          totalExpense: data.totalExpense,
          totalRecharge: data.totalRecharge,
        });
      }
    } catch (error) {
      console.error('Fetch account stats error:', error);
    } finally {
      setAccountLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAccountStats();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* 近七天利润折线图 */}
      <ProfitTrendChart />

      {/* Top Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard count={stats.all} label="所有订单" Icon={ShoppingCart} color="bg-[#00a65a]" loading={loading} href="/orders" />
        <StatCard count={stats.pending} label="待處理" Icon={ShoppingBag} color="bg-[#0073b7]" loading={loading} href="/orders" />
        <StatCard count={stats.taiwan} label="待入店" Icon={ShoppingCart} color="bg-[#f39c12]" loading={loading} href="/taiwan/database" />
        <StatCard count={stats.abnormal} label="異常件" Icon={ShoppingCart} color="bg-[#dd4b39]" loading={loading} href="/abnormal" />
      </div>

      {/* Main Grid: Announcement and Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: System Announcement */}
        <div className="lg:col-span-2 bg-white rounded shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-800">系统公告</h2>
          </div>
          <div className="p-6 text-[13px] text-gray-700 space-y-6 leading-6">
            <section>
              <p className="font-bold mb-2">臺邦國際物流集運專線倉庫地址</p>
              <p>收件人：臺邦</p>
              <p>收件電話：18573144341</p>
              <p>地址：深圳市寶安區沙井街道衛勝第三工業區大黃峰產業園一樓臺邦物流+您的ID名字</p>
            </section>

            <section>
              <p className="font-bold mb-2">臺灣宅配取货地址如下➔（宅配通、嘉裏快遞、新竹、黑猫上門取件）</p>
              <p>收件人：小樂蝦臺邦+出貨名字</p>
              <p>電話：03-3131680</p>
              <p>地址：338桃園市蘆竹區三德街42之2號</p>
            </section>

            <section>
              <p className="font-bold mb-2">711退货地址</p>
              <p>超商門門：711内海門市（名字搜索：内海）</p>
              <p>收件人：小樂蝦臺邦</p>
              <p>電話：0909313353</p>
              <p>地址：桃園市大園區民生路183號1樓</p>
            </section>

            <section>
              <p className="font-bold mb-2">蝦皮店到店退货門市 大園菓林店</p>
              <p>收貨人：小樂蝦臺邦</p>
              <p>地址：桃園市大園區菓林路145號1樓</p>
              <p>電話：0909313353</p>
              <p>公司網址登錄鏈接：https://tbyt.top</p>
            </section>
          </div>
        </div>

        {/* Right: Account Info and QR */}
        <div className="flex flex-col gap-6">
          {/* Account Info Card */}
          <div className="bg-white rounded shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">賬戶信息</h2>
            </div>
            <div className="p-4 space-y-4">
              <Link href="/funds/recharge" className="flex justify-between items-center text-sm hover:bg-gray-50 -mx-4 px-4 py-1 transition-colors rounded">
                <span className="text-gray-600">賬戶余額:</span>
                <span className="text-red-600 font-bold text-xl">{accountLoading ? '...' : accountStats.balance.toLocaleString('zh-CN', { minimumFractionDigits: 3 })}</span>
              </Link>
              <Link href="/funds/expense" className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-50 pt-3 hover:bg-gray-50 -mx-4 px-4 py-1 transition-colors rounded">
                <span>累計消費:</span>
                <span className="font-medium text-gray-800">{accountLoading ? '...' : accountStats.totalExpense.toLocaleString('zh-CN', { minimumFractionDigits: 3 })}</span>
              </Link>
              <Link href="/funds/recharge" className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-50 pt-3 hover:bg-gray-50 -mx-4 px-4 py-1 transition-colors rounded">
                <span>累計充值:</span>
                <span className="font-medium text-gray-800">{accountLoading ? '...' : accountStats.totalRecharge.toLocaleString('zh-CN', { minimumFractionDigits: 3 })}</span>
              </Link>
              <div className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-50 pt-3">
                <span>打包貼單費:</span>
                <span className="font-medium text-gray-800">0.00</span>
              </div>
              
              <Link href="/funds/recharge" className="block">
                <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-[#3c8dbc] text-white rounded hover:bg-[#367fa9] transition-colors text-sm">
                  <CreditCard className="w-4 h-4" />
                  <span>在线充值</span>
                </button>
              </Link>
            </div>
          </div>

          {/* QR Code Card */}
          <div className="bg-white rounded shadow-sm border border-gray-200 p-6 flex flex-col items-center">
            <h3 className="font-bold text-gray-800 mb-1">臺邦微信公眾號</h3>
            <p className="text-xs text-gray-500 mb-4 text-center">獲取訂單異常狀態推送服務</p>
            
            <div className="w-48 h-48 bg-gray-100 border border-gray-200 flex items-center justify-center relative mb-4">
               <div className="w-40 h-40 grid grid-cols-4 grid-rows-4 gap-1 p-2 bg-white">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-gray-800' : 'bg-transparent'}`}></div>
                  ))}
               </div>
               <div className="absolute bottom-2 right-2 bg-white p-1 rounded-sm shadow-sm border border-gray-100">
                  <div className="w-6 h-6 bg-[#3c8dbc] rounded-sm flex items-center justify-center text-[10px] text-white font-bold">TB</div>
               </div>
            </div>
            
            <p className="text-sm text-gray-600 italic">掃一掃關注</p>
          </div>
        </div>
      </div>
    </div>
  );
}
