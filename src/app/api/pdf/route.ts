import { NextRequest, NextResponse } from 'next/server';
import type { SavedQuote } from '@/lib/types';
import { fmt } from '@/lib/calculations';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfmake = require('pdfmake/js/index.js') as any;
pdfmake.setLocalAccessPolicy(() => true);
pdfmake.setUrlAccessPolicy(() => true);

function getFontSrc(request: NextRequest): string {
  // Node.js/Vercel: use file path
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    const p = path.join(process.cwd(), 'public/fonts/NotoSansSC-Bold.ttf');
    fs.accessSync(p);
    return p;
  } catch {
    // Cloudflare: fetch from own origin
    const host = request.headers.get('host') ?? 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${host}/fonts/NotoSansSC-Bold.ttf`;
  }
}

export async function POST(request: NextRequest) {
  let quote: SavedQuote;
  try {
    quote = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const fontSrc = getFontSrc(request);
    pdfmake.addFonts({ NotoSC: { normal: fontSrc, bold: fontSrc } });

    const { form, calc, settings, quoteNumber, createdAt } = quote;
    const date = new Date(createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    const validUntil = new Date(new Date(createdAt).getTime() + settings.quoteValidityDays * 86400000)
      .toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

    const ROSE = '#e11d48';
    const SLATE = '#1e293b';
    const GREY = '#475569';
    const LIGHT = '#f1f5f9';

    const docDef = {
      defaultStyle: { font: 'NotoSC', fontSize: 11, color: SLATE },
      pageSize: 'A4',
      pageMargins: [44, 44, 44, 60] as [number, number, number, number],
      content: [
        // Header
        {
          columns: [
            {
              stack: [
                { text: settings.companyName, fontSize: 18, bold: true, color: ROSE },
                ...(settings.companyTagline ? [{ text: settings.companyTagline, fontSize: 9, color: GREY, margin: [0, 2, 0, 0] }] : []),
                ...(settings.companyAddress ? [{ text: `地址：${settings.companyAddress}`, fontSize: 9, color: GREY }] : []),
                ...(settings.companyPhone ? [{ text: `电话：${settings.companyPhone}`, fontSize: 9, color: GREY }] : []),
                ...(settings.companyEmail ? [{ text: `邮箱：${settings.companyEmail}`, fontSize: 9, color: GREY }] : []),
              ],
            },
            {
              stack: [
                { text: '报  价  单', fontSize: 22, bold: true, color: SLATE, alignment: 'right' },
                { text: `报价编号：${quoteNumber}`, fontSize: 9, color: GREY, alignment: 'right', margin: [0, 8, 0, 2] },
                { text: `报价日期：${date}`, fontSize: 9, color: GREY, alignment: 'right' },
                { text: `有效期至：${validUntil}`, fontSize: 9, color: GREY, alignment: 'right' },
              ],
            },
          ],
          margin: [0, 0, 0, 12],
        },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 507, y2: 0, lineWidth: 3, lineColor: ROSE }], margin: [0, 0, 0, 14] },

        // Customer box
        {
          fillColor: '#fff1f2',
          table: {
            widths: ['*'],
            body: [[{
              stack: [
                { text: '报价对象', fontSize: 8, bold: true, color: ROSE, margin: [0, 0, 0, 4] },
                { text: form.customerName || '—', fontSize: 14, bold: true },
                ...(form.contactPerson ? [{ text: `联系人：${form.contactPerson}`, fontSize: 10, color: GREY }] : []),
                ...(form.customerPhone ? [{ text: `电话：${form.customerPhone}`, fontSize: 10, color: GREY }] : []),
              ],
              border: [false, false, false, false],
              margin: [12, 10, 12, 10],
            }]],
          },
          margin: [0, 0, 0, 16],
        },

        // Specs
        { text: '产品规格', fontSize: 8, bold: true, color: GREY, margin: [0, 0, 0, 6] },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              ['纸箱类型', { text: '锁底式纸箱', bold: true, alignment: 'right' }],
              ['尺寸（长 × 宽 × 高）', { text: `${form.length} × ${form.width} × ${form.height} mm`, bold: true, alignment: 'right' }],
              ['坯料展开尺寸', { text: `${calc.blankWidthMm.toFixed(0)} × ${calc.blankHeightMm.toFixed(0)} mm`, bold: true, alignment: 'right' }],
              ['数量', { text: `${form.quantity.toLocaleString()} 件`, bold: true, alignment: 'right' }],
            ].map((row, i) => row.map(cell => ({
              ...(typeof cell === 'string' ? { text: cell, color: GREY } : cell),
              fillColor: i % 2 === 1 ? LIGHT : undefined,
              border: [false, false, false, true],
              borderColor: ['', '', '', '#e2e8f0'],
              margin: [8, 7, 8, 7],
            }))),
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 16],
        },

        // Pricing
        { text: '费用明细', fontSize: 8, bold: true, color: GREY, margin: [0, 0, 0, 6] },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: '项目', bold: true, color: '#ffffff', fillColor: ROSE, border: [false, false, false, false], margin: [8, 8, 8, 8] },
                { text: '金额', bold: true, color: '#ffffff', fillColor: ROSE, alignment: 'right', border: [false, false, false, false], margin: [8, 8, 8, 8] },
              ],
              ...[
                [`原材料费用（¥${calc.effectiveMaterialUnitPrice}/dm² × ${form.quantity.toLocaleString()} 件）`, `¥${fmt(calc.materialCostTotal)}`],
                ...(calc.materialMarkupAmount > 0 ? [[`材料加价（${form.materialMarkupPct}%）`, `¥${fmt(calc.materialMarkupAmount)}`]] : []),
                [`人工费用（${form.basicWorkingHours}h × ${calc.complexityCoeff}）`, `¥${fmt(calc.laborCostTotal)}`],
                ['印刷费用（制版费 + 单价费用）', `¥${fmt(calc.printingTotal)}`],
              ].map((row, i) => [
                { text: row[0], color: GREY, fillColor: i % 2 === 1 ? LIGHT : undefined, border: [false, false, false, true], borderColor: ['', '', '', '#e2e8f0'], margin: [8, 8, 8, 8] },
                { text: row[1], bold: true, alignment: 'right', fillColor: i % 2 === 1 ? LIGHT : undefined, border: [false, false, false, true], borderColor: ['', '', '', '#e2e8f0'], margin: [8, 8, 8, 8] },
              ]),
              [
                { text: '合　计', bold: true, fontSize: 13, color: '#ffffff', fillColor: ROSE, border: [false, false, false, false], margin: [8, 10, 8, 10] },
                { text: `¥${fmt(calc.grandTotal)}`, bold: true, fontSize: 13, color: '#ffffff', fillColor: ROSE, alignment: 'right', border: [false, false, false, false], margin: [8, 10, 8, 10] },
              ],
              [
                { text: '单价', bold: true, color: ROSE, fillColor: '#fff1f2', border: [false, false, false, false], margin: [8, 8, 8, 8] },
                { text: `¥${fmt(calc.unitPrice)} / 件`, bold: true, color: ROSE, fillColor: '#fff1f2', alignment: 'right', border: [false, false, false, false], margin: [8, 8, 8, 8] },
              ],
            ],
          },
          margin: [0, 0, 0, 16],
        },

        ...(form.notes ? [
          { text: '备注', fontSize: 8, bold: true, color: GREY, margin: [0, 0, 0, 6] },
          { text: form.notes, fontSize: 10, color: GREY, margin: [0, 0, 0, 16] },
        ] : []),

        ...(settings.paymentTerms ? [
          { text: '付款条款', fontSize: 8, bold: true, color: GREY, margin: [0, 0, 0, 6] },
          { text: settings.paymentTerms, fontSize: 9, color: GREY, margin: [0, 0, 0, 16] },
        ] : []),

        { text: '', margin: [0, 20, 0, 0] },
        {
          columns: [
            {
              stack: [
                { text: '授权签字及盖章', fontSize: 9, color: GREY },
                { canvas: [{ type: 'line', x1: 0, y1: 30, x2: 220, y2: 30, lineWidth: 1, lineColor: '#cbd5e1' }] },
                { text: settings.companyName, fontSize: 9, bold: true, color: SLATE, margin: [0, 4, 0, 0] },
              ],
            },
            {
              stack: [
                { text: '客户确认签字', fontSize: 9, color: GREY },
                { canvas: [{ type: 'line', x1: 0, y1: 30, x2: 220, y2: 30, lineWidth: 1, lineColor: '#cbd5e1' }] },
                { text: '日期', fontSize: 9, bold: true, color: SLATE, margin: [0, 4, 0, 0] },
              ],
            },
          ],
        },
      ],
      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          { text: `${settings.companyName} · ${quoteNumber}`, fontSize: 8, color: GREY },
          { text: `第 ${currentPage} / ${pageCount} 页`, fontSize: 8, color: GREY, alignment: 'right' },
        ],
        margin: [44, 8, 44, 0],
      }),
    };

    const doc = pdfmake.createPdf(docDef);
    const buffer: Buffer = await doc.getBuffer();

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${quote.quoteNumber}.pdf"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('PDF render error:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'PDF API running. POST a SavedQuote to generate PDF.' });
}
