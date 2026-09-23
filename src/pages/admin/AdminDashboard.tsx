import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  PieChart,
  ShieldCheck
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { StatCard } from '../../components/admin/StatCard';
import { StatusBadge } from '../../components/common/Badge';

export const AdminDashboard: React.FC = () => {
  const { locations, reviews, reports, categories, approveLocation, rejectLocation } = useData();

  const totalLocations = locations.length;
  const pendingLocations = locations.filter(l => l.verificationStatus === 'PENDING');
  const approvedLocations = locations.filter(l => l.verificationStatus === 'APPROVED');
  const rejectedLocations = locations.filter(l => l.verificationStatus === 'REJECTED');
  const totalReviews = reviews.length;
  const openReports = reports.filter(r => r.status === 'OPEN');

  // Category distribution
  const categoryCounts = categories.map(cat => ({
    name: cat.name,
    count: locations.filter(l => l.category === cat.name).length,
    color: cat.color
  }));

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="Good afternoon, Admin"
          subtitle="Here's what's happening across CrowdMap platform today."
        />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Total Users"
              value={142}
              icon={Users}
              change="+12% this week"
              colorBg="bg-blue-50 text-blue-600"
            />
            <StatCard
              title="Total Locations"
              value={totalLocations}
              icon={MapPin}
              change="+8 new entries"
              colorBg="bg-brand-50 text-brand-700"
            />
            <StatCard
              title="Pending Verification"
              value={pendingLocations.length}
              icon={Clock}
              change={pendingLocations.length > 0 ? 'Requires Review' : 'All Clear'}
              isPositive={pendingLocations.length === 0}
              colorBg="bg-amber-50 text-amber-600"
            />
            <StatCard
              title="Total Reviews"
              value={totalReviews}
              icon={MessageSquare}
              change="+24 reviews"
              colorBg="bg-purple-50 text-purple-600"
            />
          </div>

          {/* Verification Banner */}
          {pendingLocations.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5 text-white animate-spin" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    {pendingLocations.length} Pending Location {pendingLocations.length === 1 ? 'Submission' : 'Submissions'}
                  </h3>
                  <p className="text-xs text-amber-100 font-medium">
                    Submissions require administrator verification before appearing publicly on Leaflet map.
                  </p>
                </div>
              </div>

              <Link
                to="/admin/locations"
                className="px-4 py-2 rounded-xl bg-white text-amber-900 font-bold text-xs hover:bg-amber-50 transition-colors shrink-0 shadow-sm"
              >
                Review Queue →
              </Link>
            </div>
          )}

          {/* Charts & Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Category Breakdown (Donut/Bar Chart Representation) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-brand-700" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Locations by Category</h3>
                </div>
                <span className="text-xs font-semibold text-slate-400">Database Breakdown</span>
              </div>

              <div className="space-y-3 pt-2">
                {categoryCounts.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>{cat.name}</span>
                      <span>{cat.count} locations</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${totalLocations > 0 ? Math.max((cat.count / totalLocations) * 100, 4) : 0}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Status Distribution */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Verification Status Distribution</h3>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-emerald-900 block">APPROVED & LIVE</span>
                      <span className="text-[11px] text-emerald-700">Visible on public map</span>
                    </div>
                  </div>
                  <span className="text-xl font-black text-emerald-900">{approvedLocations.length}</span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <div>
                      <span className="text-xs font-bold text-amber-900 block">PENDING VERIFICATION</span>
                      <span className="text-[11px] text-amber-700">Waiting for admin review</span>
                    </div>
                  </div>
                  <span className="text-xl font-black text-amber-900">{pendingLocations.length}</span>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <div>
                      <span className="text-xs font-bold text-rose-900 block">REJECTED / REMOVED</span>
                      <span className="text-[11px] text-rose-700">Inaccurate or inappropriate</span>
                    </div>
                  </div>
                  <span className="text-xl font-black text-rose-900">{rejectedLocations.length}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Pending Submissions Quick Action Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Recent Pending Submissions</h3>
              <Link to="/admin/locations" className="text-xs font-bold text-brand-700 hover:underline">
                View All →
              </Link>
            </div>

            {pendingLocations.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No pending locations requiring verification right now.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                      <th className="py-3 px-4">Location Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Submitted By</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingLocations.map((loc) => (
                      <tr key={loc.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{loc.name}</td>
                        <td className="py-3 px-4 text-slate-600">{loc.category}</td>
                        <td className="py-3 px-4 text-slate-600">{loc.createdByName || 'User'}</td>
                        <td className="py-3 px-4 text-slate-400">{new Date(loc.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => approveLocation(loc.id)}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectLocation(loc.id, 'Inaccurate coordinates')}
                            className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold hover:bg-rose-700"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};
