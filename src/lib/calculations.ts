import { Settings, QuoteFormData, QuoteCalc } from './types';

export function calculate(form: QuoteFormData, settings: Settings): QuoteCalc {
  const { length: L, width: W, height: H, quantity } = form;

  // Bottom-lock box blank sheet formula
  const blankWidthMm = 2 * L + 2 * H + settings.glueFlapMm;
  const blankHeightMm = W + 2 * H;

  // Area per unit in sq dm with coefficient adjustment
  const blankAreaSqDm = (blankWidthMm * blankHeightMm / 10000) * settings.coefficientAdjustment;

  // Material — per-quote price overrides settings; markup adds on top
  const effectiveMaterialUnitPrice = form.materialUnitPrice > 0 ? form.materialUnitPrice : settings.materialUnitPrice;
  const materialCostPerUnit = blankAreaSqDm * effectiveMaterialUnitPrice;
  const materialCostTotal = materialCostPerUnit * quantity;
  const materialMarkupAmount = materialCostTotal * (form.materialMarkupPct / 100);

  // Printing
  const plateCharge = form.plateCharge;
  const printCostPerUnit = form.printUnitPrice;
  const printCostTotal = printCostPerUnit * quantity;
  const printingTotal = plateCharge + printCostTotal;

  // Labor
  const complexityCoeff = settings.complexityCoefficients[form.complexity];
  const laborCostTotal = form.basicWorkingHours * settings.laborHourlyRate * complexityCoeff;

  // Totals
  const subtotal = materialCostTotal + materialMarkupAmount + printingTotal + laborCostTotal;
  const profitAmount = subtotal * (form.profitMargin / 100);
  const grandTotal = subtotal + profitAmount;
  const unitPrice = quantity > 0 ? grandTotal / quantity : 0;

  return {
    blankWidthMm,
    blankHeightMm,
    blankAreaSqDm,
    effectiveMaterialUnitPrice,
    materialCostPerUnit,
    materialCostTotal,
    materialMarkupAmount,
    plateCharge,
    printCostPerUnit,
    printCostTotal,
    printingTotal,
    complexityCoeff,
    laborCostTotal,
    subtotal,
    profitAmount,
    grandTotal,
    unitPrice,
  };
}

export function fmt(n: number): string {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
