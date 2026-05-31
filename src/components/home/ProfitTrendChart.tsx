'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DayPoint {
  /** 日期 key, 形如 2026-05-30 */
  key: string;
  /** 显示标签, 形如 05-30 */
  label: string;
  value: number;
}

// 生成最近 N 天的日期序列（含今天），按本地时区
function buildLastDays(days: number): DayPoint[] {
  const arr: DayPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    arr.push({ key: `${y}-${m}-${day}`, label: `${m}-${day}`, value: 0 });
  }
  return arr;
}

// 将一条记录的 created_at 归一化为本地日期 key
function toDayKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DAYS = 7;

export default function ProfitTrendChart() {
  const [points, setPoints] = useState<DayPoint[]>(() => buildLastDays(DAYS));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const base = buildLastDays(DAYS);
      // 起始时间 = 最早一天的 00:00（本地）
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (DAYS - 1));

      const { data, error: qErr } = await supabase
        .from('order_profit')
        .select('actual_income, created_at')
        .gte('created_at', start.toISOString());

      if (qErr) throw qErr;

      const bucket = new Map(base.map((p) => [p.key, 0] as [string, number]));
      for (const row of data || []) {
        if (!row.created_at) continue;
        const key = toDayKey(row.created_at as string);
        if (bucket.has(key)) {
          bucket.set(key, (bucket.get(key) || 0) + Number(row.actual_income ?? 0));
        }
      }
      setPoints(base.map((p) => ({ ...p, value: Number((bucket.get(p.key) || 0).toFixed(2)) })));
    } catch (e: unknown) {
      console.error('Fetch profit trend error:', e);
      setError('利润数据加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 监听容器宽度，实现响应式 SVG
  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const total = useMemo(() => points.reduce((s, p) => s + p.value, 0), [points]);

  // 几何计算
  const height = 220;
  const padding = { top: 24, right: 24, bottom: 32, left: 56 };
  const innerW = Math.max(width - padding.left - padding.right, 10);
  const innerH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...points.map((p) => p.value), 0);
  const niceMax = maxVal <= 0 ? 100 : Math.ceil(maxVal / 4) * 4 || maxVal;

  const xFor = (i: number) =>
    padding.left + (points.length <= 1 ? innerW / 2 : (innerW * i) / (points.length - 1));
  const yFor = (v: number) => padding.top + innerH - (niceMax === 0 ? 0 : (innerH * v) / niceMax);

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(p.value).toFixed(1)}`)
    .join(' ');

  const areaPath =
    points.length > 0
      ? `${linePath} L ${xFor(points.length - 1).toFixed(1)} ${(padding.top + innerH).toFixed(1)} ` +
        `L ${xFor(0).toFixed(1)} ${(padding.top + innerH).toFixed(1)} Z`
      : '';

  // Y 轴刻度（5 条）
  const yTicks = Array.from({ length: 5 }, (_, i) => (niceMax / 4) * i);

  return (
    <div className="card">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00a65a]" />
          <h2 className="text-lg font-bold text-gray-800">近七天利润趋势</h2>
          <span className="text-xs text-gray-400 ml-2">单位: CNY (实际收入)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            合计 <span className="text-[#00a65a] font-bold">{total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
          </span>
          <RefreshCw
            className={`w-4 h-4 text-[#3c8dbc] cursor-pointer hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
            onClick={fetchData}
          />
        </div>
      </div>

      <div ref={wrapRef} className="relative p-2">
        {error ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-red-500">{error}</div>
        ) : (
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            <defs>
              <linearGradient id="profitArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00a65a" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00a65a" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* 网格线 + Y 轴刻度 */}
            {yTicks.map((t, i) => {
              const y = yFor(t);
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#eef1f4"
                    strokeWidth={1}
                  />
                  <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-gray-400" fontSize={11}>
                    {Math.round(t).toLocaleString('zh-CN')}
                  </text>
                </g>
              );
            })}

            {/* 面积 + 折线 */}
            {!loading && (
              <>
                <path d={areaPath} fill="url(#profitArea)" />
                <path d={linePath} fill="none" stroke="#00a65a" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
              </>
            )}

            {/* X 轴标签 + 数据点 */}
            {points.map((p, i) => {
              const x = xFor(i);
              const y = yFor(p.value);
              const active = hover === i;
              return (
                <g key={p.key}>
                  <text x={x} y={height - 10} textAnchor="middle" className="fill-gray-500" fontSize={11}>
                    {p.label}
                  </text>
                  {!loading && (
                    <circle
                      cx={x}
                      cy={y}
                      r={active ? 5 : 3.5}
                      fill="#fff"
                      stroke="#00a65a"
                      strokeWidth={2}
                    />
                  )}
                  {/* 透明热区，便于悬停 */}
                  <rect
                    x={x - innerW / (points.length * 2 || 1)}
                    y={padding.top}
                    width={innerW / (points.length || 1)}
                    height={innerH}
                    fill="transparent"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                  />
                  {active && !loading && (
                    <g>
                      <rect
                        x={Math.min(Math.max(x - 45, 4), width - 94)}
                        y={Math.max(y - 42, 4)}
                        width={90}
                        height={32}
                        rx={4}
                        fill="#222d32"
                        opacity={0.92}
                      />
                      <text
                        x={Math.min(Math.max(x, 49), width - 49)}
                        y={Math.max(y - 26, 20)}
                        textAnchor="middle"
                        className="fill-white"
                        fontSize={10}
                      >
                        {p.label}
                      </text>
                      <text
                        x={Math.min(Math.max(x, 49), width - 49)}
                        y={Math.max(y - 14, 32)}
                        textAnchor="middle"
                        className="fill-white"
                        fontSize={11}
                        fontWeight="bold"
                      >
                        ¥{p.value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {loading && (
              <text x={width / 2} y={height / 2} textAnchor="middle" className="fill-gray-400" fontSize={13}>
                加载中...
              </text>
            )}
          </svg>
        )}
      </div>
    </div>
  );
}
