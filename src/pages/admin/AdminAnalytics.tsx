import React from 'react';
import { TrendingUp, BarChart3, PieChart, Activity, ShieldCheck } from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { useData } from '../../contexts/DataContext';

export const AdminAnalytics: React.FC = () => {
  const { locations, reviews, categories } = useData();

  const totalLocations = locations.length;
  const approvedLocations = locations.filter(l => l.verificationStatus === 'APPROVED').length;
  const pendingLocations = locations.filter(l => l.verificationStatus === 'PENDING').length;
  const rejectedLocations = locations.filter(l => l.verificationStatus === 'REJECTED').length;

  const approvalRate = totalLocations > 0 ? ((approvedLocations / totalLocations) * 100).toFixed(1) : '0';

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="Platform Analytics & Monitoring"
          subtitle="Real-time growth metrics, verification success rates, and category popularities."
        />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Verification Rate</span>
              <span className="text-2xl font-black text-emerald-700 block">{approvalRate}%</span>
              <span className="text-[11px] text-slate-400 font-medium">Approved Submissions</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Submissions</span>
              <span className="text-2xl font-black text-slate-900 block">{totalLocations}</span>
              <span className="text-[11px] text-emerald-600 font-semibold">+18% growth this month</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Reviews Engaged</span>
              <span className="text-2xl font-black text-purple-700 block">{reviews.length}</span>
              <span className="text-[11px] text-slate-400 font-medium">Avg 4.6★ rating</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Directories</span>
              <span className="text-2xl font-black text-brand-700 block">{categories.length}</span>
              <span className="text-[11px] text-slate-400 font-medium">Study, Food, Wi-Fi, etc.</span>
            </div>
          </div>

          {/* Breakdown Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Verification Statistics */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-700" />
                Verification Pipeline Statistics
              </h3>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-800">Approved Locations ({approvedLocations})</span>
                    <span className="text-slate-500">{((approvedLocations / (totalLocations || 1)) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(approvedLocations / (totalLocations || 1)) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-800">Pending Review ({pendingLocations})</span>
                    <span className="text-slate-500">{((pendingLocations / (totalLocations || 1)) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(pendingLocations / (totalLocations || 1)) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-rose-800">Rejected Submissions ({rejectedLocations})</span>
                    <span className="text-slate-500">{((rejectedLocations / (totalLocations || 1)) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(rejectedLocations / (totalLocations || 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Categories */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-700" />
                Popular Resource Categories
              </h3>

              <div className="space-y-3 pt-2">
                {categories.map((cat) => {
                  const count = locations.filter(l => l.category === cat.name).length;
                  return (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>{cat.name}</span>
                        <span>{count} entries</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${totalLocations > 0 ? (count / totalLocations) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};
