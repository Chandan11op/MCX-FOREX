import React from 'react';
import { ConnectionState } from '../../types/provider';

interface Props {
  state: ConnectionState;
}

export const ConnectionStatus: React.FC<Props> = ({ state }) => {
  const getBadgeStyle = () => {
    switch (state) {
      case 'CONNECTED':
        return 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400';
      case 'RECONNECTING':
        return 'bg-amber-950/40 border-amber-800/60 text-amber-400 animate-pulse';
      case 'DISCONNECTED':
        return 'bg-red-950/40 border-red-800/60 text-red-400';
      case 'STALE':
        return 'bg-slate-900 border-slate-700 text-slate-400';
    }
  };

  return (
    <div className={`px-2.5 py-1 rounded border text-xs font-mono font-medium flex items-center space-x-1.5 ${getBadgeStyle()}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${state === 'CONNECTED' ? 'bg-emerald-500' : state === 'RECONNECTING' ? 'bg-amber-500' : 'bg-red-500'}`} />
      <span>SYSTEM READY ({state})</span>
    </div>
  );
};
