import { MarketConnectionStatus } from '@mcx/shared-types';

export const TERMINAL_COLORS = {
  bgDark: '#0B0F19',
  cardDark: '#111827',
  borderDark: '#1F2937',
  upGreen: '#10B981',
  upGreenBg: 'rgba(16, 185, 129, 0.15)',
  downRed: '#EF4444',
  downRedBg: 'rgba(239, 68, 68, 0.15)',
  goldAccent: '#F59E0B',
  silverAccent: '#94A3B8',
  copperAccent: '#EA580C',
  crudeAccent: '#6366F1',
  ngAccent: '#06B6D4',
};

export const STATUS_BADGES: Record<MarketConnectionStatus, { label: string; color: string; bg: string }> = {
  LIVE: {
    label: 'LIVE',
    color: '#10B981',
    bg: '#064E3B',
  },
  STALE: {
    label: 'STALE',
    color: '#F59E0B',
    bg: '#78350F',
  },
  RECONNECTING: {
    label: 'RECONNECTING',
    color: '#3B82F6',
    bg: '#1E3A8A',
  },
  MARKET_CLOSED: {
    label: 'MARKET CLOSED',
    color: '#6B7280',
    bg: '#374151',
  },
  DATA_UNAVAILABLE: {
    label: 'DATA UNAVAILABLE',
    color: '#EF4444',
    bg: '#7F1D1D',
  },
};
