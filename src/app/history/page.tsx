'use client';
import HistoryTable from '@/components/HistoryTable';

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50/30">
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-400 text-white px-4 sm:px-6 py-7 sm:py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">历史记录</h1>
          <p className="text-rose-100 mt-1 text-xs sm:text-sm">查看和管理所有已保存的报价单</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <HistoryTable />
      </div>
    </div>
  );
}
