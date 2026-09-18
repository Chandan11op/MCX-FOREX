export interface CountryCurrency {
  country: string;
  code: string; // ISO 2-letter country code for flag/label
  currency: string;
  symbol: string;
}

export const SUPPORTED_COUNTRIES: CountryCurrency[] = [
  { country: 'India', code: 'IN', currency: 'INR', symbol: '₹' },
  { country: 'United States', code: 'US', currency: 'USD', symbol: '$' },
  { country: 'United Kingdom', code: 'GB', currency: 'GBP', symbol: '£' },
  { country: 'European Union', code: 'EU', currency: 'EUR', symbol: '€' },
  { country: 'Japan', code: 'JP', currency: 'JPY', symbol: '¥' },
  { country: 'Australia', code: 'AU', currency: 'AUD', symbol: 'A$' },
  { country: 'Canada', code: 'CA', currency: 'CAD', symbol: 'C$' },
  { country: 'Singapore', code: 'SG', currency: 'SGD', symbol: 'S$' },
  { country: 'United Arab Emirates', code: 'AE', currency: 'AED', symbol: 'AED ' },
  { country: 'Saudi Arabia', code: 'SA', currency: 'SAR', symbol: 'SAR ' },
];
