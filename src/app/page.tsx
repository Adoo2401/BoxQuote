'use client';
import { useState, useMemo, useEffect } from 'react';
import { QuoteFormData, SavedQuote, Settings } from '@/lib/types';
import { calculate } from '@/lib/calculations';
import { DEFAULT_SETTINGS } from '@/lib/storage';
import { getSettings, saveQuote, genQuoteNumber } from '@/lib/actions';
import { downloadQuotePDF } from '@/lib/downloadPDF';
import QuoteForm from '@/components/QuoteForm';
import QuoteBreakdown from '@/components/QuoteBreakdown';

const BLANK_FORM: QuoteFormData = {
  customerName: '',
  contactPerson: '',
  customerPhone: '',
  length: 0,
  width: 0,
  height: 0,
  quantity: 0,
  materialUnitPrice: 0,
  materialMarkupPct: 0,
  plateCharge: 0,
  printUnitPrice: 0,
  basicWorkingHours: 1,
  complexity: 'simple',
  profitMargin: 20,
  notes: '',
};

export default function QuotePage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [form, setForm] = useState<QuoteFormData>(BLANK_FORM);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setForm((prev) => ({
        ...prev,
        materialUnitPrice: s.materialUnitPrice,
        profitMargin: s.defaultProfitMargin,
      }));
      setLoading(false);
    });
  }, []);

  const calc = useMemo(() => {
    if (!form.length || !form.width || !form.height || !form.quantity) return null;
    return calculate(form, settings);
  }, [form, settings]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function buildQuote(): Promise<SavedQuote> {
    const quoteNumber = await genQuoteNumber();
    return {
      id: crypto.randomUUID(),
      quoteNumber,
      createdAt: new Date().toISOString(),
      form,
      calc: calc!,
      settings,
    };
  }

  async function handleSave() {
    if (!calc || saving) return;
    setSaving(true);
    try {
      const q = await buildQuote();
      await saveQuote(q);
      showToast('报价单已保存！');
    } finally {
      setSaving(false);
    }
  }

  async function handlePrint() {
    if (!calc || downloading) return;
    setDownloading(true);
    try {
      const q = await buildQuote();
      await downloadQuotePDF(q);
    } catch (e) {
      console.error('PDF generation failed:', e);
      showToast('PDF 生成失败：' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50/30">
        {/* Hero */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-400 text-white px-4 sm:px-6 py-7 sm:py-10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">新建报价单</h1>
            <p className="text-rose-100 mt-1 text-xs sm:text-sm">填写客户需求，系统自动计算费用明细</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">正在加载设置...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6">
              <div className="lg:col-span-3">
                <QuoteForm form={form} settings={settings} onChange={setForm} />
              </div>
              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-20">
                  <QuoteBreakdown
                    calc={calc}
                    form={form}
                    settings={settings}
                    onSave={handleSave}
                    onPrint={handlePrint}
                    saving={saving}
                    downloading={downloading}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto flex justify-center sm:block z-50">
          <div className="bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold">
            ✓ {toast}
          </div>
        </div>
      )}
    </>
  );
}
