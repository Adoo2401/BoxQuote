export interface Settings {
  materialUnitPrice: number;
  glueFlapMm: number;
  coefficientAdjustment: number;
  laborHourlyRate: number;
  complexityCoefficients: { simple: number; medium: number; complex: number };
  complexityLabels: { simple: string; medium: string; complex: string };
  companyName: string;
  companyTagline: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyLogo: string;
  defaultProfitMargin: number;
  quoteValidityDays: number;
  paymentTerms: string;
}

export type ComplexityLevel = 'simple' | 'medium' | 'complex';

export interface QuoteFormData {
  customerName: string;
  contactPerson: string;
  customerPhone: string;
  length: number;
  width: number;
  height: number;
  quantity: number;
  materialUnitPrice: number;
  materialMarkupPct: number;
  plateCharge: number;
  printUnitPrice: number;
  basicWorkingHours: number;
  complexity: ComplexityLevel;
  profitMargin: number;
  notes: string;
}

export interface QuoteCalc {
  blankWidthMm: number;
  blankHeightMm: number;
  blankAreaSqDm: number;
  effectiveMaterialUnitPrice: number;
  materialCostPerUnit: number;
  materialCostTotal: number;
  materialMarkupAmount: number;
  plateCharge: number;
  printCostPerUnit: number;
  printCostTotal: number;
  printingTotal: number;
  complexityCoeff: number;
  laborCostTotal: number;
  subtotal: number;
  profitAmount: number;
  grandTotal: number;
  unitPrice: number;
}

export interface SavedQuote {
  id: string;
  quoteNumber: string;
  createdAt: string;
  form: QuoteFormData;
  calc: QuoteCalc;
  settings: Settings;
}
