'use client';
import { useState, useEffect, useRef } from 'react';
import { Settings } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/storage';
import { getSettings, updateSettings } from '@/lib/actions';
import NumericInput from './NumericInput';

const inputCls =
  'w-full rounded-xl border border-rose-100 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-100 focus:outline-none transition-all placeholder:text-slate-300';

function Card({ title, emoji, desc, children }: { title: string; emoji: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
      <div className="flex items-start gap-3 px-4 sm:px-5 py-3.5 sm:py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
        <span className="text-xl sm:text-2xl mt-0.5">{emoji}</span>
        <div>
          <h2 className="font-semibold text-slate-700 text-sm sm:text-base">{title}</h2>
          {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="p-4 sm:p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function SettingsForm() {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getSettings().then(setS); }, []);

  function set<K extends keyof Settings>(key: K, val: Settings[K]) {
    setS((prev) => ({ ...prev, [key]: val }));
  }
  function setCoeff(level: 'simple' | 'medium' | 'complex', val: number) {
    setS((prev) => ({ ...prev, complexityCoefficients: { ...prev.complexityCoefficients, [level]: val } }));
  }
  function setLabel(level: 'simple' | 'medium' | 'complex', val: string) {
    setS((prev) => ({ ...prev, complexityLabels: { ...prev.complexityLabels, [level]: val } }));
  }
  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('companyLogo', reader.result as string);
    reader.readAsDataURL(file);
  }
  async function handleSave() {
    await updateSettings(s);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      {/* 原材料 */}
      <Card title="原材料与计算公式" emoji="🧾" desc="更改单价后，所有新建报价将自动使用新价格">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Field label="材料单价（¥/dm²）" hint="每平方分米价格">
            <NumericInput value={s.materialUnitPrice} onChange={(v) => set('materialUnitPrice', v)} className={inputCls} />
          </Field>
          <Field label="粘合翼（mm）" hint="加到坯料宽度">
            <NumericInput value={s.glueFlapMm} onChange={(v) => set('glueFlapMm', v)} className={inputCls} />
          </Field>
          <Field label="系数调整" hint="根据实际刀版微调">
            <NumericInput value={s.coefficientAdjustment} onChange={(v) => set('coefficientAdjustment', v)} className={inputCls} />
          </Field>
        </div>
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 overflow-x-auto">
          <p className="text-xs text-slate-500 font-mono whitespace-nowrap">
            公式：(2L + 2H + {s.glueFlapMm}mm) × (W + 2H) × {s.coefficientAdjustment} × ¥{s.materialUnitPrice}/dm²
          </p>
        </div>
      </Card>

      {/* 人工 */}
      <Card title="人工费用配置" emoji="🔧" desc="设置工时单价和各复杂程度的系数，支持自定义名称">
        <Field label="基本工时单价（¥/小时）">
          <NumericInput value={s.laborHourlyRate} onChange={(v) => set('laborHourlyRate', v)} className={inputCls + ' sm:max-w-xs'} />
        </Field>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">复杂程度等级</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['simple', 'medium', 'complex'] as const).map((level) => (
              <div key={level} className="p-3.5 rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50/50 to-pink-50/30 space-y-2.5">
                <p className="text-xs font-bold text-rose-400 uppercase tracking-wide">
                  {level === 'simple' ? '简单' : level === 'medium' ? '中等' : '复杂'}
                </p>
                <Field label="标签名称">
                  <input type="text" value={s.complexityLabels[level]}
                    onChange={(e) => setLabel(level, e.target.value)} className={inputCls} />
                </Field>
                <Field label="系数">
                  <NumericInput value={s.complexityCoefficients[level]} onChange={(v) => setCoeff(level, v)} className={inputCls} />
                </Field>
                <p className="text-xs text-slate-400">
                  实际费率：¥{(s.laborHourlyRate * s.complexityCoefficients[level]).toFixed(2)}/小时
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 公司信息 */}
      <Card title="公司信息" emoji="🏢" desc="显示在打印的PDF报价单抬头上">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Field label="公司名称">
            <input type="text" value={s.companyName}
              onChange={(e) => set('companyName', e.target.value)}
              placeholder="某某包装有限公司" className={inputCls} />
          </Field>
          <Field label="公司口号">
            <input type="text" value={s.companyTagline}
              onChange={(e) => set('companyTagline', e.target.value)}
              placeholder="优质包装解决方案" className={inputCls} />
          </Field>
          <Field label="地址">
            <input type="text" value={s.companyAddress}
              onChange={(e) => set('companyAddress', e.target.value)}
              placeholder="省市区街道" className={inputCls} />
          </Field>
          <Field label="电话">
            <input type="text" value={s.companyPhone}
              onChange={(e) => set('companyPhone', e.target.value)}
              placeholder="0755-12345678" className={inputCls} />
          </Field>
          <Field label="邮箱">
            <input type="email" value={s.companyEmail}
              onChange={(e) => set('companyEmail', e.target.value)}
              placeholder="sales@example.com" className={inputCls} />
          </Field>
        </div>

        {/* Logo upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">公司 LOGO</label>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {s.companyLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.companyLogo} alt="logo"
                className="h-14 sm:h-16 object-contain rounded-xl border border-rose-100 p-2 bg-white" />
            ) : (
              <div className="h-14 sm:h-16 w-28 sm:w-32 rounded-xl border-2 border-dashed border-rose-200 flex items-center justify-center text-slate-400 text-xs">
                暂无 LOGO
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => logoRef.current?.click()}
                className="px-4 py-2 rounded-xl text-sm font-semibold border-2 border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors">
                📁 上传 LOGO
              </button>
              {s.companyLogo && (
                <button type="button" onClick={() => set('companyLogo', '')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors">
                  删除
                </button>
              )}
            </div>
            <input ref={logoRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
          </div>
          <p className="text-xs text-slate-400 mt-2">建议 PNG 或 JPG 格式，将显示在打印报价单上</p>
        </div>
      </Card>

      {/* 默认设置 */}
      <Card title="报价默认值" emoji="📋" desc="新建报价时的默认填写值">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Field label="默认利润率（%）">
            <NumericInput value={s.defaultProfitMargin} onChange={(v) => set('defaultProfitMargin', v)} className={inputCls} />
          </Field>
          <Field label="报价有效期（天）">
            <NumericInput value={s.quoteValidityDays} onChange={(v) => set('quoteValidityDays', v)} className={inputCls} />
          </Field>
        </div>
        <Field label="付款条款（印在报价单上）">
          <textarea value={s.paymentTerms}
            onChange={(e) => set('paymentTerms', e.target.value)}
            placeholder="例：需支付 50% 定金，余款在发货前结清。"
            rows={3}
            className={inputCls + ' resize-none'} />
        </Field>
      </Card>

      {/* Save */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={handleSave}
          className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-100 hover:from-rose-600 hover:to-pink-600 hover:shadow-rose-200 active:scale-[0.99] transition-all">
          {saved ? '✓ 设置已保存！' : '💾 保存设置'}
        </button>
        <button onClick={() => setS(DEFAULT_SETTINGS)}
          className="sm:w-auto px-5 py-3.5 rounded-xl font-semibold text-sm border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors">
          恢复默认
        </button>
      </div>

      {saved && (
        <p className="text-center text-sm text-emerald-500 font-medium">
          ✓ 所有设置已保存，新建报价将使用这些数值
        </p>
      )}
    </div>
  );
}
