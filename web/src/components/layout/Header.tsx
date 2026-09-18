import React from 'react';
import { DataSourceStatus } from '../status/DataSourceStatus';
import { ConnectionStatus } from '../status/ConnectionStatus';
import { ProviderStatus } from '../../types/provider';
import { useCurrency } from '../../context/CurrencyContext';
import { SUPPORTED_COUNTRIES } from '../../data/countries';
import { Globe, HelpCircle } from 'lucide-react';

interface HeaderProps {
  providerStatus: ProviderStatus;
}

export const Header: React.FC<HeaderProps> = ({ providerStatus }) => {
  const { selectedCountry, setCountryByCurrency, isLoadingCurrency } = useCurrency();

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/95 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-3">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        {/* Left Side: Brand & Country Selector */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded border border-blue-500/40 bg-blue-950/40 flex items-center justify-center font-mono font-bold text-blue-400 text-base shadow-sm">
              MCX
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold font-mono text-slate-100 tracking-tight leading-tight">
                  MCX MARKET TERMINAL
                </h1>
                <span className="text-[10px] font-mono font-semibold bg-amber-950/80 border border-amber-800/60 text-amber-400 px-1.5 py-0.5 rounded">
                  PROTOTYPE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Commodity Intelligence & Pricing Engine
              </p>
            </div>
          </div>

          {/* Country / Currency Selector Dropdown */}
          <div className="relative group flex items-center bg-[#131A29] border border-slate-700/80 hover:border-blue-500 rounded px-2.5 py-1.5 transition-colors">
            <Globe className="w-4 h-4 text-blue-400 mr-2 shrink-0" />
            <select
              value={selectedCountry.currency}
              onChange={(e) => setCountryByCurrency(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.currency} value={c.currency} className="bg-[#131A29] text-slate-200">
                  {c.country} — {c.currency} ({c.symbol})
                </option>
              ))}
            </select>
            {isLoadingCurrency && <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping ml-1" />}

            {/* Currency Tooltip */}
            <div className="relative group/tip ml-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover/tip:block w-64 bg-[#090C12] border border-slate-700 text-[11px] text-slate-300 p-2.5 rounded shadow-xl font-sans z-50 pointer-events-none">
                Country selection changes the quote currency used to display commodity prices. It does not change the underlying commodity market or exchange.
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Data Source, Mode & Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <DataSourceStatus status={providerStatus} compact />
          <ConnectionStatus state="CONNECTED" />
          <div className="hidden lg:block text-right font-mono text-[11px] text-slate-400 border-l border-slate-800 pl-3">
            <div className="text-slate-500 text-[10px] uppercase">Last Updated</div>
            <div>{providerStatus.lastUpdated}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
