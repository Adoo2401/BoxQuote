'use server';

import { connectDB } from './mongodb';
import QuoteModel from './models/Quote';
import AppSettingsModel from './models/AppSettings';
import { Settings, SavedQuote } from './types';
import { DEFAULT_SETTINGS } from './storage';

// ─── Settings ────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<Settings> {
  await connectDB();
  const doc = await AppSettingsModel.findOne({ key: 'global' }).select('data -_id').lean() as { data?: Partial<Settings> } | null;
  return doc?.data ? { ...DEFAULT_SETTINGS, ...doc.data } : DEFAULT_SETTINGS;
}

export async function updateSettings(s: Settings): Promise<void> {
  await connectDB();
  await AppSettingsModel.findOneAndUpdate(
    { key: 'global' },
    { key: 'global', data: s },
    { upsert: true, new: true }
  );
}

// ─── Quotes ──────────────────────────────────────────────────────────────────

export async function getQuotes(): Promise<SavedQuote[]> {
  await connectDB();
  const docs = await QuoteModel.find().sort({ createdAt: -1 }).select('-_id -__v').lean();
  return docs as SavedQuote[];
}

export async function saveQuote(q: SavedQuote): Promise<void> {
  await connectDB();
  await QuoteModel.findOneAndUpdate({ id: q.id }, q, { upsert: true, new: true });
}

export async function removeQuote(id: string): Promise<void> {
  await connectDB();
  await QuoteModel.deleteOne({ id });
}

export async function genQuoteNumber(): Promise<string> {
  await connectDB();
  const d = new Date();
  const prefix = `QT-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const count = await QuoteModel.countDocuments({ quoteNumber: { $regex: `^${prefix}` } });
  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
}
