import { CommodityCode } from '@mcx/shared-types';

export function formatINR(val: number, decimals: number = 2): string {
  if (isNaN(val)) return '₹0.00';
  return '₹' + val.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatNumber(val: number, decimals: number = 2): string {
  if (isNaN(val)) return '0.00';
  return val.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(val: number): string {
  if (isNaN(val)) return '0.00%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(2)}%`;
}

export function formatVolume(val: number): string {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(2) + 'M';
  if (val >= 1_000) return (val / 1_000).toFixed(1) + 'K';
  return val.toString();
}

export function formatTime(timestamp: number): string {
  if (!timestamp) return '--:--:--';
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatDateTime(timestamp: number): string {
  if (!timestamp) return '--';
  const d = new Date(timestamp);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export const COMMODITY_NAMES: Record<CommodityCode, { name: string; unit: string; description: string }> = {
  GOLD: {
    name: 'Gold',
    unit: '10g',
    description: 'Gold 995 Purity 1 Kg / 100g Futures',
  },
  SILVER: {
    name: 'Silver',
    unit: '1 Kg',
    description: 'Silver 999 Purity 30 Kg Futures',
  },
  COPPER: {
    name: 'Copper',
    unit: '1 Kg',
    description: 'Copper Primary 2500 Kg Futures',
  },
  CRUDE_OIL: {
    name: 'Crude Oil',
    unit: '1 BBL',
    description: 'Crude Oil 100 Barrels Futures',
  },
  NATURAL_GAS: {
    name: 'Natural Gas',
    unit: '1 mmBtu',
    description: 'Natural Gas 1250 mmBtu Futures',
  },
};
