import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  colorBg?: string;
  colorText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  isPositive = true,
  colorBg = 'bg-brand-50 text-brand-700',
  colorText = 'text-brand-700',
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">{title}</span>
        <span className="text-2xl font-black text-slate-900 tracking-tight block">{value}</span>
        {change && (
          <span className={`text-[11px] font-semibold flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
            {change}
          </span>
        )}
      </div>

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorBg}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
