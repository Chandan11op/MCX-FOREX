import React from 'react';
import { X, Activity, Server, ShieldCheck, ShieldAlert, Wifi, Cpu, Layers } from 'lucide-react';
import { ProviderHealthStatus } from '@mcx/shared-types';
import { formatDateTime } from '@mcx/shared-utils';

interface ProviderHealthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  health: ProviderHealthStatus | null;
  latencyMs: number;
}

export const ProviderHealthDrawer: React.FC<ProviderHealthDrawerProps> = ({
  isOpen,
  onClose,
  health,
  latencyMs,
}) => {
  if (!isOpen) return null;

  const isConnected = health?.status === 'connected';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-dark-900 border-l border-dark-700 w-full max-w-md h-full flex flex-col shadow-2xl p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-700">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Provider Health & Telemetry</h3>
              <p className="text-xs text-slate-400">Diagnostic feed metrics & compliance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white border border-dark-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6 space-y-5">
          {/* Status Alert */}
          <div
            className={`p-4 rounded-xl border flex items-center space-x-3 ${
              isConnected
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`}
            />
            <div>
              <div className="text-sm font-bold">{health?.providerName || 'Market Data Feed'}</div>
              <div className="text-xs opacity-80">
                Status: {health?.status?.toUpperCase() || 'CONNECTING'}
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-950 p-3.5 rounded-xl border border-dark-800">
              <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
                <Wifi className="w-3.5 h-3.5 text-blue-400" />
                Network Latency
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {latencyMs > 0 ? `${latencyMs} ms` : `${health?.latencyMs || 8} ms`}
              </div>
            </div>

            <div className="bg-dark-950 p-3.5 rounded-xl border border-dark-800">
              <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Throughput
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {health?.messagesPerSec || 0} <span className="text-xs font-normal text-slate-400">msg/s</span>
              </div>
            </div>

            <div className="bg-dark-950 p-3.5 rounded-xl border border-dark-800">
              <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Subscribed Feeds
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {health?.subscribedCount || 5} <span className="text-xs font-normal text-slate-400">MCX</span>
              </div>
            </div>

            <div className="bg-dark-950 p-3.5 rounded-xl border border-dark-800">
              <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                Total Ticks
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {health?.totalTicksReceived?.toLocaleString() || 0}
              </div>
            </div>
          </div>

          {/* Details List */}
          <div className="bg-dark-950 rounded-xl border border-dark-800 p-4 space-y-3 font-mono text-xs">
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Provider Driver:</span>
              <span className="text-slate-200">{health?.providerId || 'mock'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Reconnect Count:</span>
              <span className="text-slate-200">{health?.reconnectCount || 0}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dark-800">
              <span className="text-slate-400">Last Tick Timestamp:</span>
              <span className="text-slate-200">{formatDateTime(health?.lastTickTimestamp || Date.now())}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Stale Threshold:</span>
              <span className="text-slate-200">5000 ms</span>
            </div>
          </div>

          {/* Compliance Card */}
          <div className="bg-dark-950 rounded-xl border border-dark-800 p-4 space-y-2">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Compliance Mode: {health?.dataAccessMode || 'prototype'}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              This instance is operating in Prototype Simulation mode. Before deploying public customer-facing displays, an authorized MCX redistribution license must be verified. Refer to <code className="text-amber-300">docs/MARKET-DATA-LICENSING.md</code>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-dark-700">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-xs font-semibold text-slate-200 transition"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
