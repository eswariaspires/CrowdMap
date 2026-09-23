import React from 'react';
import { Settings, Shield, Database, Server, MapPin } from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { useData } from '../../contexts/DataContext';

export const AdminSettings: React.FC = () => {
  const { categories } = useData();

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="Platform Configuration & Settings"
          subtitle="Manage active resource categories, moderation thresholds, and cloud configurations."
        />

        <main className="p-6 space-y-6 max-w-4xl w-full mx-auto">
          
          {/* Application Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <Server className="w-5 h-5 text-brand-700" />
              Cloud Application Metadata
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-400 block uppercase tracking-wider">Project Name</span>
                <span className="font-bold text-slate-900 text-sm">CROWD KNOWLEDGE MAP</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-400 block uppercase tracking-wider">Database Engine</span>
                <span className="font-bold text-emerald-700 text-sm">Google Cloud Firestore</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-400 block uppercase tracking-wider">Storage Bucket</span>
                <span className="font-bold text-blue-700 text-sm">Firebase Cloud Storage</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-400 block uppercase tracking-wider">Map Engine</span>
                <span className="font-bold text-slate-900 text-sm">Leaflet + OpenStreetMap</span>
              </div>
            </div>
          </div>

          {/* Active Categories List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-600" />
              Active Resource Categories ({categories.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{cat.name}</span>
                    <span className="text-[11px] text-slate-500">{cat.description}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};
