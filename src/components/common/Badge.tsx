import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Edit3 } from 'lucide-react';
import { VerificationStatus } from '../../types';

export const VerifiedBadge: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => (
  <span className={`inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full ${
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
  }`}>
    <ShieldCheck className={size === 'sm' ? 'w-3 h-3 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
    <span>Verified</span>
  </span>
);

export const StatusBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  switch (status) {
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Published</span>
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Under review</span>
        </span>
      );
    case 'NEEDS_CHANGES':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
          <span>Needs changes</span>
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>Rejected</span>
        </span>
      );
    default:
      return null;
  }
};

export const CategoryBadge: React.FC<{ category: string }> = ({ category }) => (
  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
    {category}
  </span>
);

export const Badge = CategoryBadge;

