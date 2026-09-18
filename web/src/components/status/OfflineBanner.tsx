import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [reconnectedNotice, setReconnectedNotice] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setReconnectedNotice(true);
      const timer = setTimeout(() => setReconnectedNotice(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setReconnectedNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !reconnectedNotice) return null;

  return (
    <div className={`px-4 py-2 text-xs font-mono flex items-center justify-between border-b ${
      !isOnline 
        ? 'bg-amber-950/80 border-amber-800/80 text-amber-200' 
        : 'bg-emerald-950/80 border-emerald-800/80 text-emerald-200'
    }`}>
      <div className="flex items-center space-x-2">
        {!isOnline ? <WifiOff className="w-4 h-4 text-amber-400" /> : <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />}
        <span>
          {!isOnline 
            ? 'OFFLINE MODE: Connection lost. Displaying last available MCX Bhavcopy market data.' 
            : 'RECONNECTED: Connection restored. Refreshing market snapshot data...'}
        </span>
      </div>
      {!isOnline && (
        <span className="text-[10px] bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700/60 font-semibold">
          STALE CACHE
        </span>
      )}
    </div>
  );
};
