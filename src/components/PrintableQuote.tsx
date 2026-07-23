'use client';
import { SavedQuote } from '@/lib/types';
import { fmt } from '@/lib/calculations';

export default function PrintableQuote({ quote }: { quote: SavedQuote }) {
  const { form, calc, settings, quoteNumber, createdAt } = quote;

  const date = new Date(createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const validUntil = new Date(
    new Date(createdAt).getTime() + settings.quoteValidityDays * 86400000
  ).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

  const cell = (content: React.ReactNode, style?: React.CSSProperties) => (
    <td style={{ padding: '10px 14px', border: '1px solid #f1f5f9', ...style }}>{content}</td>
  );

  return (
    <div style={{ fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif', color: '#1e293b', padding: '32px 40px', maxWidth: '780px', margin: '0 auto' }}>

      {/* Letterhead */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #f43f5e', paddingBottom: '20px', marginBottom: '20px' }}>
        <div>
          {settings.companyLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.companyLogo} alt="logo" style={{ height: '48px', marginBottom: '8px', objectFit: 'contain' }} />
          )}
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#e11d48', margin: '0 0 4px' }}>
            {settings.companyName}
          </h1>
          {settings.companyTagline && (
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 6px' }}>{settings.companyTagline}</p>
          )}
          {settings.companyAddress && (
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 2px' }}>地址：{settings.companyAddress}</p>
          )}
          {settings.companyPhone && (
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 2px' }}>电话：{settings.companyPhone}</p>
          )}
          {settings.companyEmail && (
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>邮箱：{settings.companyEmail}</p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#334155', margin: '0 0 10px', letterSpacing: '4px' }}>
            报 价 单
          </h2>
          <table style={{ fontSize: '12px', marginLeft: 'auto', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                ['报价编号', quoteNumber],
                ['报价日期', date],
                ['有效期至', validUntil],
              ].map(([label, val]) => (
                <tr key={label}>
                  <td style={{ color: '#94a3b8', paddingRight: '12px', paddingBottom: '3px' }}>{label}</td>
                  <td style={{ fontWeight: '600', color: '#334155' }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer */}
      <div style={{ background: '#fff1f2', borderRadius: '8px', padding: '14px 18px', marginBottom: '20px' }}>
        <p style={{ fontSize: '10px', fontWeight: '700', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>报价对象</p>
        <p style={{ fontSize: '17px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 3px' }}>{form.customerName || '—'}</p>
        {form.contactPerson && <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 2px' }}>联系人：{form.contactPerson}</p>}
        {form.customerPhone && <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>电话：{form.customerPhone}</p>}
      </div>

      {/* Product specs */}
      <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>产品规格</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
        <tbody>
          {[
            ['纸箱类型', '锁底式纸箱'],
            ['尺寸（长 × 宽 × 高）', `${form.length} × ${form.width} × ${form.height} mm`],
            ['坯料展开尺寸', `${calc.blankWidthMm.toFixed(0)} × ${calc.blankHeightMm.toFixed(0)} mm`],
            ['数量', `${form.quantity.toLocaleString()} 件`],
          ].map(([label, value], i) => (
            <tr key={label} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
              {cell(label, { color: '#64748b', fontWeight: '500', width: '40%' })}
              {cell(value, { color: '#1e293b', fontWeight: '600' })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pricing */}
      <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>费用明细</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
        <thead>
          <tr style={{ background: '#f43f5e' }}>
            <th style={{ padding: '10px 14px', color: '#fff', textAlign: 'left', fontWeight: '600' }}>项目</th>
            <th style={{ padding: '10px 14px', color: '#fff', textAlign: 'right', fontWeight: '600' }}>金额</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ background: '#fff' }}>
            {cell(`原材料及生产（${form.quantity.toLocaleString()} 件）`, { color: '#475569' })}
            {cell(`¥${fmt(calc.materialCostTotal + calc.laborCostTotal)}`, { textAlign: 'right', fontFamily: 'monospace', color: '#1e293b' })}
          </tr>
          <tr style={{ background: '#f8fafc' }}>
            {cell('印刷费用（制版费 + 单价费用）', { color: '#475569' })}
            {cell(`¥${fmt(calc.printingTotal)}`, { textAlign: 'right', fontFamily: 'monospace', color: '#1e293b' })}
          </tr>
          <tr style={{ background: '#f43f5e' }}>
            <td style={{ padding: '12px 14px', color: '#fff', fontWeight: '700', fontSize: '15px' }}>合 计</td>
            <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'monospace', color: '#fff', fontWeight: '700', fontSize: '16px' }}>¥{fmt(calc.grandTotal)}</td>
          </tr>
          <tr style={{ background: '#fff1f2' }}>
            {cell('单价', { color: '#e11d48', fontWeight: '600', border: '1px solid #fecdd3' })}
            {cell(`¥${fmt(calc.unitPrice)} / 件`, { textAlign: 'right', fontFamily: 'monospace', color: '#e11d48', fontWeight: '700', border: '1px solid #fecdd3' })}
          </tr>
        </tbody>
      </table>

      {form.notes && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '18px' }}>
          <p style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 5px' }}>备注</p>
          <p style={{ fontSize: '13px', color: '#475569', margin: 0, whiteSpace: 'pre-wrap' }}>{form.notes}</p>
        </div>
      )}

      {settings.paymentTerms && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 5px' }}>付款条款</p>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, whiteSpace: 'pre-wrap' }}>{settings.paymentTerms}</p>
        </div>
      )}

      {/* Signatures */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '44px' }}>
        {[
          ['授权签字及盖章', settings.companyName],
          ['客户确认签字', '日期'],
        ].map(([title, footer]) => (
          <div key={title}>
            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '8px' }}>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 32px' }}>{title}</p>
              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', margin: 0, borderTop: '1px solid #e2e8f0', paddingTop: '5px' }}>
                {footer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
