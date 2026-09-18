import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { HistoricalDataPoint } from '../../types/market';

interface PriceChartProps {
  data: HistoricalDataPoint[];
  commodityName: string;
  onTimeframeChange?: (timeframe: string) => void;
  activeTimeframe?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  commodityName,
  onTimeframeChange,
  activeTimeframe = '1M',
}) => {
  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y'];
  const [selected, setSelected] = useState<string>(activeTimeframe);

  const handleSelect = (tf: string) => {
    setSelected(tf);
    if (onTimeframeChange) onTimeframeChange(tf);
  };

  const isPositive = data.length > 1 && data[data.length - 1].close >= data[0].close;
  const strokeColor = isPositive ? '#10B981' : '#EF4444';
  const fillColor = isPositive ? '#10B981' : '#EF4444';

  return (
    <div className="bg-[#131A29] border border-slate-800 rounded-lg p-4 font-mono">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            HISTORICAL PRICE CHART • {commodityName.toUpperCase()}
          </h3>
          <span className="text-[11px] text-slate-500">
            EOD Market Prices (₹)
          </span>
        </div>

        {/* Timeframe selector */}
        <div className="flex space-x-1 bg-[#0D131F] border border-slate-800 p-1 rounded">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => handleSelect(tf)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                selected === tf
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={fillColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={fillColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0B0F17',
                borderColor: '#334155',
                borderRadius: '6px',
                color: '#F8FAFC',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono',
              }}
              formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Close Price']}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={strokeColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#chartGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
