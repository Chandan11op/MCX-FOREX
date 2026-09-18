import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, History, FileText, Calculator, Download } from 'lucide-react';

export const Navigation: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Markets', path: '/markets', icon: TrendingUp },
    { label: 'Historical', path: '/historical', icon: History },
    { label: 'Contracts', path: '/contracts', icon: FileText },
    { label: 'Pricing', path: '/pricing', icon: Calculator },
    { label: 'Data Export', path: '/export', icon: Download },
  ];

  return (
    <nav className="bg-[#0D131F] border-b border-slate-800/80 px-4 sm:px-6">
      <div className="flex space-x-1 overflow-x-auto scrollbar-none py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3.5 py-2 text-xs font-medium font-mono rounded transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-950/60 text-blue-400 border border-blue-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
