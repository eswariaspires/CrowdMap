import React, { useState } from 'react';
import { 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  X, 
  Eye, 
  Check, 
  Ban,
  Edit3
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { StatusBadge } from '../../components/common/Badge';
import { MapView } from '../../components/map/MapView';
import { LocationItem, VerificationStatus } from '../../types';

export const AdminLocations: React.FC = () => {
  const { locations, approveLocation, rejectLocation, requestChangesLocation } = useData();
  
  const [activeTab, setActiveTab] = useState<'ALL' | VerificationStatus>('PENDING');
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);

  // Rejection / Request Changes Modal State
  const [actionModal, setActionModal] = useState<'REJECT' | 'REQUEST_CHANGES' | null>(null);
  const [modalReason, setModalReason] = useState('');

  const filteredLocations = locations.filter((loc) => {
    if (activeTab === 'ALL') return true;
    return loc.verificationStatus === activeTab;
  });

  const handleApprove = async (id: string) => {
    await approveLocation(id);
    if (selectedLocation?.id === id) {
      setSelectedLocation(prev => prev ? { ...prev, verificationStatus: 'APPROVED' } : null);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedLocation || !actionModal) return;

    if (actionModal === 'REJECT') {
      await rejectLocation(selectedLocation.id, modalReason || 'Inaccurate or inappropriate location submission');
      setSelectedLocation(prev => prev ? { ...prev, verificationStatus: 'REJECTED', rejectionReason: modalReason } : null);
    } else if (actionModal === 'REQUEST_CHANGES') {
      await requestChangesLocation(selectedLocation.id, modalReason || 'Incomplete details provided. Please review address and description.');
      setSelectedLocation(prev => prev ? { ...prev, verificationStatus: 'NEEDS_CHANGES', rejectionReason: modalReason } : null);
    }

    setActionModal(null);
    setModalReason('');
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="Location Verification Center"
          subtitle="Review, verify, request changes, or reject community place submissions."
        />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
            {(['PENDING', 'APPROVED', 'NEEDS_CHANGES', 'REJECTED', 'ALL'] as const).map((tab) => {
              const labelMap: Record<string, string> = {
                PENDING: 'Pending',
                APPROVED: 'Published',
                NEEDS_CHANGES: 'Needs Changes',
                REJECTED: 'Rejected',
                ALL: 'All Submissions'
              };
              const count = tab === 'ALL'
                ? locations.length
                : locations.filter(l => l.verificationStatus === tab).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === tab
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{labelMap[tab]}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Locations Queue Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Contributor</th>
                    <th className="py-4 px-4">Submitted</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredLocations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No locations matching tab selection.
                      </td>
                    </tr>
                  ) : (
                    filteredLocations.map((loc) => (
                      <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={loc.imageUrls[0] || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=150&q=80'}
                              alt={loc.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{loc.name}</span>
                              <span className="text-[11px] text-slate-400 line-clamp-1">{loc.address}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-semibold text-slate-700">{loc.category}</td>

                        <td className="py-4 px-4 text-slate-600">{loc.createdByName || 'Community User'}</td>

                        <td className="py-4 px-4 text-slate-400">{new Date(loc.createdAt).toLocaleDateString()}</td>

                        <td className="py-4 px-4">
                          <StatusBadge status={loc.verificationStatus} />
                        </td>

                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => setSelectedLocation(loc)}
                            className="px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Inspect
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

      {/* Moderation Workspace Split Modal (Requirement 33 & 34) */}
      {selectedLocation && !actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-5xl p-6 shadow-2xl space-y-5 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-extrabold text-slate-900 text-xl">{selectedLocation.name}</h3>
                <StatusBadge status={selectedLocation.verificationStatus} />
              </div>
              <button onClick={() => setSelectedLocation(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Inspection View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Submitted Information */}
              <div className="lg:col-span-7 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block">Category</span>
                    <span className="font-bold text-slate-800 text-sm">{selectedLocation.category}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block">Contributor</span>
                    <span className="font-bold text-slate-800 text-sm">{selectedLocation.createdByName || 'Community Member'}</span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block">Address</span>
                  <span className="font-medium text-slate-700 text-xs">{selectedLocation.address}</span>
                </div>

                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Description</span>
                  <p className="text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed whitespace-pre-line">
                    {selectedLocation.description}
                  </p>
                </div>

                {selectedLocation.rejectionReason && (
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900">
                    <span className="font-bold block mb-0.5">Current Moderator Note:</span>
                    <span>{selectedLocation.rejectionReason}</span>
                  </div>
                )}

                {/* Submitted Photos */}
                {selectedLocation.imageUrls.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-xs block mb-2">Submitted Photographs</span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {selectedLocation.imageUrls.map((url, i) => (
                        <img key={i} src={url} alt="Submitted photo" className="w-24 h-24 object-cover rounded-xl border border-slate-200" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Interactive Map & Coordinates */}
              <div className="lg:col-span-5 space-y-3">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-xs block">Map & Coordinates</span>
                <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                  <MapView
                    locations={[selectedLocation]}
                    center={[selectedLocation.latitude, selectedLocation.longitude]}
                    zoom={15}
                    height="100%"
                  />
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] font-mono text-slate-600 text-center border border-slate-200">
                  Lat: {selectedLocation.latitude.toFixed(5)}, Lng: {selectedLocation.longitude.toFixed(5)}
                </div>
              </div>

            </div>

            {/* Action Buttons Workspace (Publish, Request Changes, Reject) */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {selectedLocation.googleMapsUrl && (
                <a
                  href={selectedLocation.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-brand-700 flex items-center gap-1 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> External Maps Link
                </a>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => {
                    setActionModal('REJECT');
                    setModalReason('Inaccurate or inappropriate location details');
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Reject
                </button>

                <button
                  onClick={() => {
                    setActionModal('REQUEST_CHANGES');
                    setModalReason('Please update the address and description with clearer details.');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Request changes
                </button>

                <button
                  onClick={() => handleApprove(selectedLocation.id)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm inline-flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> Publish
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Action Reason Input Modal (Request changes or Reject) */}
      {actionModal && selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              {actionModal === 'REQUEST_CHANGES' ? 'Request Changes from Contributor' : 'Reject Submission'}
            </h3>
            <p className="text-xs text-slate-500">
              {actionModal === 'REQUEST_CHANGES'
                ? 'Provide an explanation for the user on what needs to be updated.'
                : 'Provide a reason for rejecting this location.'}
            </p>

            <textarea
              rows={3}
              value={modalReason}
              onChange={(e) => setModalReason(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder={actionModal === 'REQUEST_CHANGES' ? 'e.g. Please clarify exact entrance or room number...' : 'e.g. Duplicate location entry...'}
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold ${
                  actionModal === 'REQUEST_CHANGES' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Submit Action
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
