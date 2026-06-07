export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  gst: string;
  dl: string;
}

const STORAGE_KEY = 'marg_company_settings';

const defaults: CompanySettings = {
  name: 'PHARMA DISTRIBUTORS',
  address: '123, Medical Complex, Grant Road, Mumbai - 400001',
  phone: '+91-22-2288-1234',
  email: 'info@pharmadist.com',
  gst: '27AABCU9603R1Z1',
  dl: 'MH/2024/12345',
};

export function getCompanySettings(): CompanySettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaults, ...JSON.parse(stored) };
  } catch {}
  return { ...defaults };
}

export function saveCompanySettings(settings: CompanySettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
