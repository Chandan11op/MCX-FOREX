import React, { useState, useEffect } from 'react';
import { X, RefreshCw, BarChart2, TrendingUp, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { CommodityCode, CandleInterval, HistoricalCandle, MarketSnapshot } from '@mcx/shared-types';
import { COMMODITY_NAMES, formatINR, formatTime } from '@mcx/shared-utils';

interface ChartModalProps {
  commodity: CommodityCode | null;
  snapshot: MarketSnapshot | undefined;
  onClose: () => void;
}

const INTERVALS: CandleInterval[] = ['1m', '5m', '15m', '30m', '1h', '1d'];

export const ChartModal: React.FC<ChartModalProps> = ({ commodity, snapshot, onClose }) => {
  const [selectedInterval, setSelectedInterval] = useState<CandleInterval>('1m');
  const [candles, setCandles] = useState<HistoricalCandle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!commodity) return;

    const fetchCandles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/commodities/${commodity}/candles?interval=${selectedInterval}&limit=50`);
        if (res.ok) {
          const data: HistoricalCandle[] = await res.json();
          setCandles(data);
        }
      } catch (err) {
        console.error('Failed to load candles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandles();
    const interval = setInterval(fetchCandles, 3000);
    return () => clearInterval(interval);
  }, [commodity, selectedInterval]);

  if (!commodity) return null;

  const meta = COMMODITY_NAMES[commodity];
  const isUp = snapshot ? snapshot.change >= 0 : true;

  const chartData = candles.map((c) => ({
    time: formatTime(c.timestamp),
    price: c.close,
    open: c.open,
    high: c.high,
    low: c.low,
    volume: c.volume,
  }));

  const minPrice = candles.length > 0 ? Math.min(...candles.map((c) => c.low)) * 0.998 : 0;
  const maxPrice = candles.length > 0 ? Math.max(...candles.map((c) => c.high)) * 1.002 : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-dark-700 flex items-center justify-between bg-dark-950">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-dark-800 border border-dark-700">
              <BarChart2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {meta?.name || commodity} ({snapshot?.tradingSymbol || commodity})
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-dark-800 text-slate-400 border border-dark-700">
                  MCX • {meta?.unit}
                </span>
              </div>
              <p className="text-xs text-slate-400">{meta?.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Price badge */}
            <div className="text-right">
              <div className="text-xl font-bold font-mono text-white">
                {snapshot ? formatINR(snapshot.ltp) : '₹--'}
              </div>
              <div className={`text-xs font-mono font-semibold flex items-center justify-end ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isUp ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                {snapshot ? `${isUp ? '+' : ''}${snapshot.change} (${snapshot.changePercent}%)` : '--'}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white border border-dark-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timeframe Interval Selector */}
        <div className="px-4 py-2 bg-dark-900 border-b border-dark-800 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Interval:</span>
            {INTERVALS.map((intv) => (
              <button
                key={intv}
                onClick={() => setSelectedInterval(intv)}
                className={`px-3 py-1 text-xs font-mono font-semibold rounded-md transition ${
                  selectedInterval === intv
                    ? 'bg-amber-500 text-dark-950 font-bold'
                    : 'bg-dark-800 text-slate-400 hover:bg-dark-700 hover:text-white'
                }`}
              >
                {intv}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            Live Streaming
          </div>
        </div>

        {/* Chart Content Area */}
        <div className="p-4 flex-1 flex flex-col min-h-[350px]">
          {/* Price Area Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isUp ? '#10B981' : '#EF4444'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={isUp ? '#10B981' : '#EF4444'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#4B5563" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis
                  domain={[minPrice, maxPrice]}
                  stroke="#4B5563"
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  tickFormatter={(val) => `₹${val.toFixed(0)}`}
                  orientation="right"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: number) => [formatINR(val), 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isUp ? '#10B981' : '#EF4444'}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Volume Histogram */}
          <div className="h-20 w-full mt-2 pt-2 border-t border-dark-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Volume Breakdown</div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <Bar dataKey="volume" fill="#4B5563" opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="p-3 bg-dark-950 border-t border-dark-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>High: <span className="text-white">{snapshot ? formatINR(snapshot.high) : '--'}</span></div>
          <div>Low: <span className="text-white">{snapshot ? formatINR(snapshot.low) : '--'}</span></div>
          <div>Open: <span className="text-white">{snapshot ? formatINR(snapshot.open) : '--'}</span></div>
          <div>Prev Close: <span className="text-white">{snapshot ? formatINR(snapshot.prevClose) : '--'}</span></div>
        </div>
      </div>
    </div>
  );
};
