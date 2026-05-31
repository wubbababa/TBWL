export default function Loading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* 顶部统计卡片骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[110px] rounded-sm bg-gray-200" />
        ))}
      </div>

      {/* 表格骨架 */}
      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        <div className="h-10 bg-gray-100 border-b border-gray-200" />
        <div className="p-4 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 bg-gray-100 rounded w-1/6" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-1/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
