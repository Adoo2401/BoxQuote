import { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  materialUnitPrice: 0.5,
  glueFlapMm: 35,
  coefficientAdjustment: 1.0,
  laborHourlyRate: 50,
  complexityCoefficients: { simple: 1.0, medium: 1.5, complex: 2.0 },
  complexityLabels: { simple: '简单', medium: '中等', complex: '复杂' },
  companyName: '我的包装公司',
  companyTagline: '优质包装解决方案',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  companyLogo: '',
  defaultProfitMargin: 20,
  quoteValidityDays: 30,
  paymentTerms: '',
};
