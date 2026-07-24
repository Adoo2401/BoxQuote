import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer, Font, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { QuotePDFDocument } from '@/components/QuotePDFDocument';
import type { SavedQuote } from '@/lib/types';

// File path works on Node.js (Vercel/local). On Cloudflare, set NEXT_PUBLIC_APP_URL env var.
const fontSrc = (() => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/fonts/NotoSansSC-Bold.ttf`;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    return path.join(process.cwd(), 'public/fonts/NotoSansSC-Bold.ttf');
  } catch {
    return `http://localhost:3000/fonts/NotoSansSC-Bold.ttf`;
  }
})();

Font.register({
  family: 'NotoSC',
  fonts: [
    { src: fontSrc, fontWeight: 'normal' },
    { src: fontSrc, fontWeight: 'bold' },
  ],
});

// GET /api/pdf — diagnostic: renders a simple test PDF with built-in fonts
export async function GET() {
  const styles = StyleSheet.create({
    page: { padding: 40 },
    title: { fontSize: 24, color: '#e11d48', marginBottom: 12 },
    body: { fontSize: 12, color: '#0f172a', marginBottom: 8 },
    box: { backgroundColor: '#fff1f2', padding: 12, marginBottom: 10 },
  });

  const buf = await renderToBuffer(
    React.createElement(Document, null,
      React.createElement(Page, { size: 'A4', style: styles.page },
        React.createElement(Text, { style: styles.title }, 'PDF Test - Built-in Font'),
        React.createElement(View, { style: styles.box },
          React.createElement(Text, { style: styles.body }, 'If you can read this, the PDF engine works.'),
          React.createElement(Text, { style: styles.body }, 'Font test: Helvetica (built-in)')
        )
      )
    ) as any
  );

  return new NextResponse(new Uint8Array(buf), {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="test.pdf"' },
  });
}

export async function POST(request: NextRequest) {
  let quote: SavedQuote;
  try {
    quote = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(
      React.createElement(QuotePDFDocument, { quote }) as any
    );
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
