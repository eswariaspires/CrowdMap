import React, { useState } from 'react';
import { Flag, CheckCircle2, XCircle, Clock, ShieldAlert } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { ReportStatus } from '../../types';

export const AdminReports: React.FC = () => {
  const { reports, updateReportStatus } = useData();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredReports = reports.filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">OPEN</span>;
      case 'REVIEWED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">REVIEWED</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">RESOLVED</span>;
      case 'DISMISSED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">DISMISSED</span>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="Community Reports Handling Center"
          subtitle="Review content flags submitted by community members regarding inaccurate locations or abusive reviews."
        />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Status Filter Bar */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs w-fit">
            {['ALL', 'OPEN', 'REVIEWED', 'RESOLVED', 'DISMISSED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === status ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    <th className="py-4 px-6">Target</th>
                    <th className="py-4 px-4">Report Reason</th>
                    <th className="py-4 px-6">Details</th>
                    <th className="py-4 px-4">Reported By</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No reports matching status "{filterStatus}".
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-900 block">{rep.targetTitle || rep.targetId}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                            TYPE: {rep.targetType}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-amber-700 font-bold">{rep.reason}</td>

                        <td className="py-4 px-6 text-slate-600 max-w-xs leading-relaxed">
                          {rep.description || 'No additional comment.'}
                        </td>

                        <td className="py-4 px-4 text-slate-500">
                          {rep.reportedByName || 'Community Member'}
                        </td>

                        <td className="py-4 px-4">{getStatusBadge(rep.status)}</td>

                        <td className="py-4 px-6 text-right space-x-2">
                          {rep.status === 'OPEN' && (
                            <button
                              onClick={() => updateReportStatus(rep.id, 'REVIEWED', user?.uid)}
                              className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                            >
                              Mark Reviewed
                            </button>
                          )}
                          <button
                            onClick={() => updateReportStatus(rep.id, 'RESOLVED', user?.uid)}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => updateReportStatus(rep.id, 'DISMISSED', user?.uid)}
                            className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300"
                          >
                            Dismiss
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};
