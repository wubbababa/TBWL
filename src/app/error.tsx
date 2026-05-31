'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Uncaught error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-8">
      <div className="p-4 bg-red-50 rounded-full">
        <AlertTriangle className="w-12 h-12 text-red-500" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-800">页面出现错误</h2>
        <p className="text-sm text-gray-500 max-w-md">
          {error.message || '发生了未知错误，请刷新页面重试。'}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 font-mono">错误代码: {error.digest}</p>
        )}
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-6 py-2.5 bg-[#3c8dbc] text-white rounded-lg hover:bg-[#367fa9] transition-colors font-medium"
      >
        <RefreshCw className="w-4 h-4" />
        重新加载
      </button>
    </div>
  );
}
