'use client';
import { QuoteCalc, QuoteFormData, Settings } from '@/lib/types';
import { fmt } from '@/lib/calculations';

interface Props {
  calc: QuoteCalc | null;
  form: QuoteFormData;
  settings: Settings;
  onSave: () => void;
  onPrint: () => void;
  saving?: boolean;
  downloading?: boolean;
}

function CostRow({ label, sub, value }: { label: string; sub?: string; value: string }) {
  return (
    <div className="py-2.5 border-b border-rose-50 last:border-0">
      <div className="flex justify-between items-start gap-2">
        <span className="text-sm font-medium text-slate-600 leading-tight">{label}</span>
        <span className="font-mono text-sm text-slate-700 shrink-0">{value}</span>
      </div>
      {sub && <p className="text-xs text-slate-400 mt-0.5 leading-snug">{sub}</p>}
    </div>
  );
}

export default function QuoteBreakdown({ calc, form, settings, onSave, onPrint, saving, downloading }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
        <span className="text-lg sm:text-xl">💹</span>
        <h2 className="font-semibold text-slate-600 text-sm">实时费用明细</h2>
        {calc && (
          <span className="ml-auto text-xs bg-emerald-100 text-emerald-600 font-semibold px-2 py-0.5 rounded-full">
            已就绪
          </span>
        )}
      </div>

      {!calc ? (
        <div className="p-8 sm:p-10 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-3xl sm:text-4xl">📐</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">请输入纸箱尺寸和数量</p>
          <p className="text-slate-300 text-xs mt-1">结果将实时显示在这里</p>
        </div>
      ) : (
        <div className="p-4 sm:p-5">
          {/* Blank sheet summary */}
          <div className="rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 p-3 sm:p-4 mb-4 grid grid-cols-2 gap-y-2 gap-x-3">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">坯料尺寸</p>
              <p className="font-mono font-semibold text-slate-800 text-xs sm:text-sm">
                {calc.blankWidthMm.toFixed(0)} × {calc.blankHeightMm.toFixed(0)} mm
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">单件面积</p>
              <p className="font-mono font-semibold text-slate-800 text-xs sm:text-sm">
                {calc.blankAreaSqDm.toFixed(4)} dm²
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">材料单价</p>
              <p className="font-semibold text-slate-700 text-xs sm:text-sm">¥{calc.effectiveMaterialUnitPrice}/dm²</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">数量</p>
              <p className="font-semibold text-slate-700 text-xs sm:text-sm">{form.quantity.toLocaleString()} 件</p>
            </div>
          </div>

          {/* Cost rows */}
          <div className="mb-3">
            <CostRow
              label="原材料费用"
              sub={`${calc.blankAreaSqDm.toFixed(4)} dm² × ¥${calc.effectiveMaterialUnitPrice}/dm² × ${form.quantity.toLocaleString()} 件`}
              value={`¥${fmt(calc.materialCostTotal)}`}
            />
            {calc.materialMarkupAmount > 0 && (
              <CostRow
                label={`材料加价（${form.materialMarkupPct}%）`}
                sub="在材料成本基础上加价"
                value={`+¥${fmt(calc.materialMarkupAmount)}`}
              />
            )}
            {calc.plateCharge > 0 && (
              <CostRow
                label="印刷 — 制版费"
                sub="一次性费用"
                value={`¥${fmt(calc.plateCharge)}`}
              />
            )}
            {calc.printCostPerUnit > 0 && (
              <CostRow
                label="印刷 — 单价费用"
                sub={`¥${fmt(calc.printCostPerUnit)}/件 × ${form.quantity.toLocaleString()} 件`}
                value={`¥${fmt(calc.printCostTotal)}`}
              />
            )}
            {calc.plateCharge === 0 && calc.printCostPerUnit === 0 && (
              <CostRow
                label="印刷费用"
                sub="未填写印刷费用"
                value="¥0.00"
              />
            )}
            <CostRow
              label="人工费用"
              sub={`${form.basicWorkingHours}h × ¥${settings.laborHourlyRate}/h × ${calc.complexityCoeff}（${form.complexity}）`}
              value={`¥${fmt(calc.laborCostTotal)}`}
            />
          </div>

          {/* Subtotal divider */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 border-t border-dashed border-rose-200" />
            <span className="text-xs text-slate-400">小计</span>
            <div className="flex-1 border-t border-dashed border-rose-200" />
          </div>

          <div className="flex justify-between items-center py-1 mb-1">
            <span className="text-sm font-semibold text-slate-600">小计</span>
            <span className="font-mono font-semibold text-slate-700">¥{fmt(calc.subtotal)}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-slate-400">利润（{form.profitMargin}%）</span>
            <span className="font-mono text-sm text-slate-400">+¥{fmt(calc.profitAmount)}</span>
          </div>

          {/* Grand total card */}
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 p-4 sm:p-5 text-white shadow-xl shadow-rose-100">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="text-xs font-semibold text-rose-200 uppercase tracking-wider">报价总额</p>
                <p className="text-3xl sm:text-4xl font-bold mt-1 tracking-tight">¥{fmt(calc.grandTotal)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-rose-200 uppercase tracking-wider">单价</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">¥{fmt(calc.unitPrice)}</p>
                <p className="text-xs text-rose-200">每件</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 space-y-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-100 hover:from-rose-600 hover:to-pink-600 hover:shadow-lg hover:shadow-rose-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? '⏳ 保存中...' : '💾 保存报价单'}
            </button>
            <button
              onClick={onPrint}
              disabled={downloading}
              className="w-full py-3 rounded-xl font-semibold text-sm border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {downloading ? '⏳ 生成中...' : '📄 下载 PDF 报价单'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
