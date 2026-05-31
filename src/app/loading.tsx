import { RefreshCw } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#3c8dbc]" />
        <span className="text-sm text-gray-400">加载中...</span>
      </div>
    </div>
  );
}
