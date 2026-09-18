import React from 'react';
import { Info } from 'lucide-react';
import { ProviderStatus } from '../../types/provider';

interface Props {
  status: ProviderStatus;
  compact?: boolean;
}

export const DataSourceStatus: React.FC<Props> = ({ status, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-xs">
        <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded font-mono">
          SOURCE: <strong className="text-blue-400">{status.source}</strong>
        </span>
        <span className="bg-amber-950/40 border border-amber-800/60 text-amber-300 px-2.5 py-1 rounded font-mono font-medium">
          MODE: {status.dataMode === 'END_OF_DAY' ? 'END OF DAY' : status.dataMode}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#131A29] border border-slate-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-blue-950/50 border border-blue-800/40 rounded text-blue-400 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
              SOURCE: {status.source}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              MODE: {status.dataMode === 'END_OF_DAY' ? 'END OF DAY / BHAVCOPY' : status.dataMode}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              STATUS: ● {status.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {status.notice || 'Current prototype uses MCX end-of-day/Bhavcopy data. It is not a real-time feed.'}
          </p>
        </div>
      </div>
      <div className="text-left sm:text-right font-mono text-xs text-slate-400 whitespace-nowrap">
        <span className="text-slate-500">LAST UPDATE:</span> {status.lastUpdated}
      </div>
    </div>
  );
};
