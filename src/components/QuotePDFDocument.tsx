import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import { SavedQuote } from '@/lib/types';
import { fmt } from '@/lib/calculations';

// Font is registered externally in downloadPDF.ts before this component is used.

const ROSE       = '#e11d48';
const ROSE_LIGHT = '#fff1f2';
const SLATE_900  = '#000000';
const SLATE_700  = '#1e293b';
const SLATE_500  = '#334155';
const SLATE_400  = '#475569';
const SLATE_100  = '#e2e8f0';
const SLATE_50   = '#f1f5f9';
const WHITE      = '#ffffff';

const s = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingBottom: 60,
    paddingHorizontal: 44,
    fontFamily: 'NotoSC',
    fontSize: 12,
    color: SLATE_900,
    backgroundColor: WHITE,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 18,
    marginBottom: 18,
    borderBottomWidth: 3,
    borderBottomColor: ROSE,
  },
  headerLeft:  { flex: 1, paddingRight: 24 },
  headerRight: { alignItems: 'flex-end' },
  logo:        { height: 46, marginBottom: 8 },
  companyName: { fontSize: 18, fontWeight: 700, color: ROSE, marginBottom: 3 },
  companyMeta: { fontSize: 9,  color: SLATE_500, marginBottom: 2 },
  quoteTitle:  { fontSize: 24, fontWeight: 700, color: SLATE_700, letterSpacing: 4, marginBottom: 12 },
  metaRow:     { flexDirection: 'row', marginBottom: 3 },
  metaLabel:   { fontSize: 9, color: SLATE_400, width: 52 },
  metaValue:   { fontSize: 9, fontWeight: 700, color: SLATE_700 },

  /* Customer */
  customerBox:   { backgroundColor: ROSE_LIGHT, borderRadius: 8, padding: 14, marginBottom: 16 },
  customerBadge: { fontSize: 8, fontWeight: 700, color: ROSE, letterSpacing: 1, marginBottom: 6 },
  customerName:  { fontSize: 15, fontWeight: 700, color: SLATE_900, marginBottom: 4 },
  customerMeta:  { fontSize: 10, color: SLATE_500, marginBottom: 2 },

  /* Section title */
  sectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: SLATE_400,
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 16,
  },

  /* Spec table */
  specRow:    { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: SLATE_100 },
  specRowAlt: { backgroundColor: SLATE_50 },
  specLabel:  { flex: 1, color: SLATE_500 },
  specValue:  { fontWeight: 700, color: SLATE_900, width: 200, textAlign: 'right' },

  /* Pricing table */
  tableHead:     { flexDirection: 'row', backgroundColor: ROSE, paddingVertical: 9, paddingHorizontal: 12 },
  tableHeadText: { flex: 1, color: WHITE, fontWeight: 700 },
  tableHeadAmt:  { color: WHITE, fontWeight: 700, width: 110, textAlign: 'right' },
  tableRow:      { flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: SLATE_100 },
  tableRowAlt:   { backgroundColor: SLATE_50 },
  tableCell:     { flex: 1, color: SLATE_500 },
  tableAmt:      { width: 110, textAlign: 'right', color: SLATE_900, fontWeight: 600 },

  /* Totals */
  totalRow:  { flexDirection: 'row', backgroundColor: ROSE,       paddingVertical: 11, paddingHorizontal: 12 },
  totalLabel:{ flex: 1, color: WHITE,  fontWeight: 700, fontSize: 13 },
  totalAmt:  { width: 110, textAlign: 'right', color: WHITE,  fontWeight: 700, fontSize: 13 },
  unitRow:   { flexDirection: 'row', backgroundColor: ROSE_LIGHT, paddingVertical: 9,  paddingHorizontal: 12 },
  unitLabel: { flex: 1, color: ROSE,   fontWeight: 700 },
  unitAmt:   { width: 110, textAlign: 'right', color: ROSE,   fontWeight: 700 },

  /* Notes / Terms */
  notesBox:  { backgroundColor: SLATE_50, borderWidth: 1, borderColor: SLATE_100, borderRadius: 6, padding: 12, marginTop: 6 },
  notesText: { fontSize: 10, color: SLATE_500, lineHeight: 1.5 },
  termsText: { fontSize: 9,  color: SLATE_400, lineHeight: 1.5, marginTop: 4 },

  /* Signatures */
  sigRow:     { flexDirection: 'row', marginTop: 40 },
  sigBox:     { flex: 1, marginRight: 30 },
  sigBoxLast: { flex: 1 },
  sigTitle:   { fontSize: 9, color: SLATE_400, marginBottom: 36 },
  sigLine:    { borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 6 },
  sigFooter:  { fontSize: 9, color: SLATE_500, fontWeight: 700 },

  /* Page footer (fixed) */
  pageFooter: {
    position: 'absolute',
    bottom: 24,
    left: 44,
    right: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: SLATE_100,
    paddingTop: 8,
  },
  pageFooterText: { fontSize: 8, color: SLATE_400 },
});

export function QuotePDFDocument({ quote }: { quote: SavedQuote }) {
  const { form, calc, settings, quoteNumber, createdAt } = quote;

  const date = new Date(createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const validUntil = new Date(
    new Date(createdAt).getTime() + settings.quoteValidityDays * 86400000
  ).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

  const metaRows: [string, string][] = [
    ['报价编号', quoteNumber],
    ['报价日期', date],
    ['有效期至', validUntil],
  ];

  const specs: [string, string][] = [
    ['纸箱类型', '锁底式纸箱'],
    ['尺寸（长 × 宽 × 高）', `${form.length} × ${form.width} × ${form.height} mm`],
    ['坯料展开尺寸', `${calc.blankWidthMm.toFixed(0)} × ${calc.blankHeightMm.toFixed(0)} mm`],
    ['数量', `${form.quantity.toLocaleString()} 件`],
  ];

  const priceRows: [string, string][] = [
    [
      `原材料费用（¥${calc.effectiveMaterialUnitPrice}/dm² × ${form.quantity.toLocaleString()} 件）`,
      `¥${fmt(calc.materialCostTotal)}`,
    ],
    ...(calc.materialMarkupAmount > 0
      ? [[`材料加价（${form.materialMarkupPct}%）`, `¥${fmt(calc.materialMarkupAmount)}`] as [string, string]]
      : []),
    [`人工费用（${form.basicWorkingHours}h × ×${calc.complexityCoeff}）`, `¥${fmt(calc.laborCostTotal)}`],
    ['印刷费用（制版费 + 单价费用）', `¥${fmt(calc.printingTotal)}`],
  ];

  return (
    <Document title={`报价单 ${quoteNumber}`} author={settings.companyName}>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            {settings.companyLogo ? <Image src={settings.companyLogo} style={s.logo} /> : null}
            <Text style={s.companyName}>{settings.companyName}</Text>
            {settings.companyTagline ? <Text style={s.companyMeta}>{settings.companyTagline}</Text> : null}
            {settings.companyAddress ? <Text style={s.companyMeta}>地址：{settings.companyAddress}</Text> : null}
            {settings.companyPhone   ? <Text style={s.companyMeta}>电话：{settings.companyPhone}</Text>   : null}
            {settings.companyEmail   ? <Text style={s.companyMeta}>邮箱：{settings.companyEmail}</Text>   : null}
          </View>
          <View style={s.headerRight}>
            <Text style={s.quoteTitle}>报 价 单</Text>
            {metaRows.map(([label, val]) => (
              <View key={label} style={s.metaRow}>
                <Text style={s.metaLabel}>{label}</Text>
                <Text style={s.metaValue}>{val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Customer ── */}
        <View style={s.customerBox}>
          <Text style={s.customerBadge}>报价对象</Text>
          <Text style={s.customerName}>{form.customerName || '—'}</Text>
          {form.contactPerson ? <Text style={s.customerMeta}>联系人：{form.contactPerson}</Text> : null}
          {form.customerPhone ? <Text style={s.customerMeta}>电话：{form.customerPhone}</Text>   : null}
        </View>

        {/* ── Product Specs ── */}
        <Text style={s.sectionTitle}>产品规格</Text>
        <View>
          {specs.map(([label, value], i) => (
            <View key={label} style={[s.specRow, i % 2 === 1 ? s.specRowAlt : {}]}>
              <Text style={s.specLabel}>{label}</Text>
              <Text style={s.specValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* ── Pricing ── */}
        <Text style={s.sectionTitle}>费用明细</Text>
        <View>
          <View style={s.tableHead}>
            <Text style={s.tableHeadText}>项目</Text>
            <Text style={s.tableHeadAmt}>金额</Text>
          </View>
          {priceRows.map(([label, amt], i) => (
            <View key={label} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
              <Text style={s.tableCell}>{label}</Text>
              <Text style={s.tableAmt}>{amt}</Text>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>合　计</Text>
            <Text style={s.totalAmt}>¥{fmt(calc.grandTotal)}</Text>
          </View>
          <View style={s.unitRow}>
            <Text style={s.unitLabel}>单价</Text>
            <Text style={s.unitAmt}>¥{fmt(calc.unitPrice)} / 件</Text>
          </View>
        </View>

        {/* ── Notes ── */}
        {form.notes ? (
          <>
            <Text style={s.sectionTitle}>备注</Text>
            <View style={s.notesBox}>
              <Text style={s.notesText}>{form.notes}</Text>
            </View>
          </>
        ) : null}

        {/* ── Terms ── */}
        {settings.paymentTerms ? (
          <>
            <Text style={s.sectionTitle}>付款条款</Text>
            <Text style={s.termsText}>{settings.paymentTerms}</Text>
          </>
        ) : null}

        {/* ── Signatures ── */}
        <View style={s.sigRow}>
          {[
            { title: '授权签字及盖章', footer: settings.companyName },
            { title: '客户确认签字',   footer: '日期' },
          ].map(({ title, footer }, i) => (
            <View key={title} style={i === 0 ? s.sigBox : s.sigBoxLast}>
              <Text style={s.sigTitle}>{title}</Text>
              <View style={s.sigLine}>
                <Text style={s.sigFooter}>{footer}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Page footer ── */}
        <View style={s.pageFooter} fixed>
          <Text style={s.pageFooterText}>{settings.companyName} · {quoteNumber}</Text>
          <Text style={s.pageFooterText}>报价日期：{date}</Text>
        </View>

      </Page>
    </Document>
  );
}
