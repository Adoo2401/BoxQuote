'use client';
import SettingsForm from '@/components/SettingsForm';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50/30">
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-400 text-white px-4 sm:px-6 py-7 sm:py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">系统设置</h1>
          <p className="text-rose-100 mt-1 text-xs sm:text-sm">配置基础价格、人工成本及公司信息</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <SettingsForm />
      </div>
    </div>
  );
}
