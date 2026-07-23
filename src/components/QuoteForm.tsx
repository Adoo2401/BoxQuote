'use client';
import { QuoteFormData, Settings, ComplexityLevel } from '@/lib/types';
import NumericInput from './NumericInput';

interface Props {
  form: QuoteFormData;
  settings: Settings;
  onChange: (form: QuoteFormData) => void;
}

const inputCls =
  'w-full rounded-xl border border-rose-100 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-100 focus:outline-none transition-all placeholder:text-slate-300';

function Card({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
        <span className="text-lg sm:text-xl">{emoji}</span>
        <h2 className="font-semibold text-slate-600 text-sm">{title}</h2>
      </div>
      <div className="p-4 sm:p-5 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function QuoteForm({ form, settings, onChange }: Props) {
  function set<K extends keyof QuoteFormData>(key: K, val: QuoteFormData[K]) {
    onChange({ ...form, [key]: val });
  }

  const levels: { value: ComplexityLevel; label: string; coeff: number }[] = [
    { value: 'simple', label: settings.complexityLabels.simple, coeff: settings.complexityCoefficients.simple },
    { value: 'medium', label: settings.complexityLabels.medium, coeff: settings.complexityCoefficients.medium },
    { value: 'complex', label: settings.complexityLabels.complex, coeff: settings.complexityCoefficients.complex },
  ];

  const hasBlank = form.length > 0 && form.width > 0 && form.height > 0;
  const blankW = 2 * form.length + 2 * form.height + settings.glueFlapMm;
  const blankH = form.width + 2 * form.height;
  const areaSqDm = ((blankW * blankH) / 10000) * settings.coefficientAdjustment;

  return (
    <div className="space-y-4">
      {/* 客户信息 */}
      <Card title="客户信息" emoji="👤">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="客户 / 公司名称 *">
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => set('customerName', e.target.value)}
              placeholder="例：某某包装有限公司"
              className={inputCls}
            />
          </Field>
          <Field label="联系人">
            <input
              type="text"
              value={form.contactPerson}
              onChange={(e) => set('contactPerson', e.target.value)}
              placeholder="姓名"
              className={inputCls}
            />
          </Field>
          <Field label="联系电话">
            <input
              type="text"
              value={form.customerPhone}
              onChange={(e) => set('customerPhone', e.target.value)}
              placeholder="手机号码"
              className={inputCls}
            />
          </Field>
        </div>
      </Card>

      {/* 纸箱尺寸 */}
      <Card title="纸箱尺寸" emoji="📐">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Field label="长（mm）*">
            <NumericInput value={form.length} onChange={(v) => set('length', v)} placeholder="300" className={inputCls} />
          </Field>
          <Field label="宽（mm）*">
            <NumericInput value={form.width} onChange={(v) => set('width', v)} placeholder="200" className={inputCls} />
          </Field>
          <Field label="高（mm）*">
            <NumericInput value={form.height} onChange={(v) => set('height', v)} placeholder="150" className={inputCls} />
          </Field>
        </div>
        <Field label="数量（件）*">
          <NumericInput value={form.quantity} onChange={(v) => set('quantity', v)} placeholder="1000" className={inputCls} />
        </Field>

        {hasBlank && (
          <div className="p-3 sm:p-3.5 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
            <p className="text-xs font-bold text-rose-400 uppercase tracking-wide mb-1.5">展开坯料计算结果</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-600">
              <span className="font-mono font-bold text-slate-800">
                {blankW.toFixed(0)} × {blankH.toFixed(0)} mm
              </span>
              <span className="text-slate-300">|</span>
              <span>
                ×{settings.coefficientAdjustment} 系数 →{' '}
                <span className="font-semibold text-rose-600">{areaSqDm.toFixed(4)} dm²/件</span>
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* 原材料费用 */}
      <Card title="原材料费用" emoji="🧾">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="材料单价（¥/dm²）">
            <NumericInput
              value={form.materialUnitPrice}
              onChange={(v) => set('materialUnitPrice', v)}
              placeholder={String(settings.materialUnitPrice)}
              className={inputCls}
            />
            <p className="text-xs text-slate-400 mt-1">设置默认值：¥{settings.materialUnitPrice}/dm²</p>
          </Field>
          <Field label="材料加价（%）">
            <NumericInput
              value={form.materialMarkupPct}
              onChange={(v) => set('materialMarkupPct', v)}
              placeholder="0"
              className={inputCls}
            />
            <p className="text-xs text-slate-400 mt-1">在材料成本基础上加价</p>
          </Field>
        </div>
      </Card>

      {/* 印刷费用 */}
      <Card title="印刷费用" emoji="🖨️">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="制版费（¥，一次性）">
            <NumericInput value={form.plateCharge} onChange={(v) => set('plateCharge', v)} placeholder="0" className={inputCls} />
          </Field>
          <Field label="印刷单价（¥/件）">
            <NumericInput value={form.printUnitPrice} onChange={(v) => set('printUnitPrice', v)} placeholder="0.00" className={inputCls} />
          </Field>
        </div>
      </Card>

      {/* 人工费用 */}
      <Card title="人工费用" emoji="🔧">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="基本工时（小时）">
            <NumericInput value={form.basicWorkingHours} onChange={(v) => set('basicWorkingHours', v)} placeholder="1" className={inputCls} />
          </Field>
        </div>
        <Field label="复杂程度">
          <div className="grid grid-cols-3 gap-2 mt-1">
            {levels.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => set('complexity', c.value)}
                className={`py-3 px-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                  form.complexity === c.value
                    ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white border-rose-400 shadow-lg shadow-rose-100 scale-[1.02]'
                    : 'bg-white text-slate-500 border-rose-100 hover:border-rose-300 hover:text-rose-500'
                }`}
              >
                <div>{c.label}</div>
                <div className={`text-xs mt-0.5 ${form.complexity === c.value ? 'text-rose-100' : 'text-slate-400'}`}>
                  ×{c.coeff}
                </div>
              </button>
            ))}
          </div>
        </Field>
      </Card>

      {/* 报价选项 */}
      <Card title="报价选项" emoji="💰">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">利润率</label>
            <span className="text-xl sm:text-2xl font-bold text-rose-500">{form.profitMargin}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={form.profitMargin}
            onChange={(e) => set('profitMargin', parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-rose-500 bg-rose-100"
          />
          <div className="flex justify-between text-xs text-slate-300 mt-1.5">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
        <Field label="备注 / 特殊要求">
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="交货时间、材料规格、特殊工艺等..."
            rows={3}
            className={inputCls + ' resize-none'}
          />
        </Field>
      </Card>
    </div>
  );
}
