'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Home, Copy, Check, WifiOff } from 'lucide-react';

/** Classify error for better UX messaging */
function classifyError(error: Error): { icon: 'network' | 'generic'; title: string; suggestion: string } {
  const msg = error.message.toLowerCase();
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('timeout') || msg.includes('econnrefused')) {
    return { icon: 'network', title: '网络连接失败', suggestion: '请检查网络连接后重试，或稍后再试。' };
  }
  if (msg.includes('permission') || msg.includes('unauthorized') || msg.includes('403')) {
    return { icon: 'generic', title: '权限不足', suggestion: '您可能没有访问此页面的权限，请联系管理员。' };
  }
  return { icon: 'generic', title: '页面出现错误', suggestion: '发生了未知错误，请刷新页面重试。' };
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const classification = classifyError(error);

  useEffect(() => {
    console.error('Uncaught error:', error);
  }, [error]);

  // Auto-retry countdown
  useEffect(() => {
    if (countdown <= 0) { reset(); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, reset]);

  const copyError = () => {
    const text = `${error.message}${error.digest ? `\n错误代码: ${error.digest}` : ''}\n${error.stack ?? ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const IconComponent = classification.icon === 'network' ? WifiOff : AlertTriangle;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-8" role="alert">
      <div className={`p-4 rounded-full ${classification.icon === 'network' ? 'bg-orange-50' : 'bg-red-50'}`}>
        <IconComponent className={`w-12 h-12 ${classification.icon === 'network' ? 'text-orange-500' : 'text-red-500'}`} />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-800">{classification.title}</h2>
        <p className="text-sm text-gray-500 max-w-md">
          {error.message || classification.suggestion}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 font-mono">错误代码: {error.digest}</p>
        )}
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs text-gray-400">{countdown}秒后自动重试</p>
          <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3c8dbc] rounded-full transition-all duration-1000"
              style={{ width: `${((15 - countdown) / 15) * 100}%` }}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setCountdown(15); reset(); }}
          className="flex items-center gap-2 px-5 py-2 bg-[#3c8dbc] text-white rounded-lg hover:bg-[#367fa9] transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          立即重试
        </button>
        <a
          href="/home"
          className="flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <Home className="w-4 h-4" />
          返回首页
        </a>
        <button
          onClick={copyError}
          className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors text-sm"
          title="复制错误信息"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
