'use client';
import { useState, useEffect } from 'react';
import { SavedQuote } from '@/lib/types';
import { getQuotes, removeQuote } from '@/lib/actions';
import { fmt } from '@/lib/calculations';
import { downloadQuotePDF } from '@/lib/downloadPDF';

export default function HistoryTable() {
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [loadingQuotes, setLoadingQuotes] = useState(true);

  useEffect(() => {
    getQuotes().then((q) => { setQuotes(q); setLoadingQuotes(false); });
  }, []);

  async function handleDelete(id: string) {
    await removeQuote(id);
    setQuotes((q) => q.filter((x) => x.id !== id));
    setConfirmDelete(null);
  }

  async function handleDownload(q: SavedQuote) {
    setDownloadingId(q.id);
    try {
      await downloadQuotePDF(q);
    } catch (e) {
      console.error('PDF generation failed:', e);
      alert('PDF 生成失败：' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <>
      <div>
        {loadingQuotes ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">正在加载历史记录...</p>
            </div>
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-16 sm:py-24">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl sm:text-5xl">📭</span>
            </div>
            <p className="text-slate-500 font-semibold text-base sm:text-lg">暂无保存的报价单</p>
            <p className="text-slate-300 text-sm mt-1">去创建第一个报价吧！</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-2xl border border-rose-100 p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-rose-500">{quotes.length}</p>
                <p className="text-xs text-slate-400 mt-1">报价单总数</p>
              </div>
              <div className="bg-white rounded-2xl border border-rose-100 p-4 text-center">
                <p className="text-xl sm:text-2xl font-bold text-slate-700 font-mono">
                  ¥{fmt(quotes.reduce((s, q) => s + q.calc.grandTotal, 0))}
                </p>
                <p className="text-xs text-slate-400 mt-1">总报价金额</p>
              </div>
              <div className="bg-white rounded-2xl border border-rose-100 p-4 text-center col-span-2 sm:col-span-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-700 font-mono">
                  ¥{fmt(quotes.reduce((s, q) => s + q.calc.grandTotal, 0) / (quotes.length || 1))}
                </p>
                <p className="text-xs text-slate-400 mt-1">平均报价金额</p>
              </div>
            </div>

            {/* Quote cards */}
            {quotes.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all overflow-hidden"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                        <span className="text-xl sm:text-2xl">📦</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg whitespace-nowrap">
                            {q.quoteNumber}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(q.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-700 text-sm sm:text-base truncate">
                          {q.form.customerName || '未命名客户'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                          {q.form.length}×{q.form.width}×{q.form.height} mm
                          <span className="mx-1.5">·</span>
                          {q.form.quantity.toLocaleString()} 件
                          <span className="mx-1.5">·</span>
                          {q.form.complexity === 'simple'
                            ? q.settings.complexityLabels.simple
                            : q.form.complexity === 'medium'
                            ? q.settings.complexityLabels.medium
                            : q.settings.complexityLabels.complex}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg sm:text-xl font-bold text-rose-600">¥{fmt(q.calc.grandTotal)}</p>
                      <p className="text-xs text-slate-400">¥{fmt(q.calc.unitPrice)}/件</p>
                    </div>
                  </div>

                  {/* Cost breakdown mini */}
                  <div className="mt-3 pt-3 border-t border-rose-50 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-slate-400">材料</p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-600">¥{fmt(q.calc.materialCostTotal)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">印刷</p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-600">¥{fmt(q.calc.printingTotal)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">人工</p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-600">¥{fmt(q.calc.laborCostTotal)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-3 border-t border-rose-50 flex gap-2 justify-end">
                    <button
                      onClick={() => handleDownload(q)}
                      disabled={downloadingId === q.id}
                      className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border-2 border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {downloadingId === q.id ? '⏳ 生成中...' : '📄 下载 PDF'}
                    </button>
                    {confirmDelete === q.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">确认删除？</span>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          确认
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(q.id)}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border-2 border-red-100 text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors"
                      >
                        🗑️ <span>删除</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
