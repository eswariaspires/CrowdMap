import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Edit3, 
  X, 
  Send
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { StatusBadge } from '../components/common/Badge';
import { LocationItem } from '../types';

export const MyContributionsPage: React.FC = () => {
  const { locations, resubmitLocation } = useData();
  const { user } = useAuth();

  // Edit Modal State for resubmitting
  const [editingLoc, setEditingLoc] = useState<LocationItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const userLocations = locations.filter(l => l.createdBy === user?.uid || l.createdBy === 'user-alex');

  const totalCount = userLocations.length;
  const approvedCount = userLocations.filter(l => l.verificationStatus === 'APPROVED').length;
  const pendingCount = userLocations.filter(l => l.verificationStatus === 'PENDING').length;
  const needsChangesCount = userLocations.filter(l => l.verificationStatus === 'NEEDS_CHANGES').length;
  const rejectedCount = userLocations.filter(l => l.verificationStatus === 'REJECTED').length;

  const handleOpenEdit = (loc: LocationItem) => {
    setEditingLoc(loc);
    setEditName(loc.name);
    setEditDescription(loc.description);
    setEditAddress(loc.address);
  };

  const handleSaveResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoc) return;
    try {
      setSubmitting(true);
      await resubmitLocation(editingLoc.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        address: editAddress.trim(),
      });
      setEditingLoc(null);
    } catch (err) {
      console.error('Error resubmitting:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Contributions</h1>
            <p className="text-xs text-slate-600 mt-1">Track your community location submissions and moderation status.</p>
          </div>

          <Link
            to="/add-location"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Share a Place</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Shared</span>
            <span className="text-2xl font-black text-slate-900 block mt-1">{totalCount}</span>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-200/80 p-5 shadow-sm bg-emerald-50/20">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Published
            </span>
            <span className="text-2xl font-black text-emerald-900 block mt-1">{approvedCount}</span>
          </div>

          <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-sm bg-amber-50/20">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Under Review
            </span>
            <span className="text-2xl font-black text-amber-900 block mt-1">{pendingCount}</span>
          </div>

          <div className="bg-white rounded-2xl border border-blue-200/80 p-5 shadow-sm bg-blue-50/20">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" /> Needs Changes
            </span>
            <span className="text-2xl font-black text-blue-900 block mt-1">{needsChangesCount}</span>
          </div>
        </div>

        {/* List of Contributions */}
        {userLocations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">You haven't shared a place yet.</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Know a quiet study spot, affordable meal location, or free Wi-Fi space? Share it with people around you!
            </p>
            <Link to="/add-location" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-700 text-white font-semibold text-xs hover:bg-brand-800 transition-colors shadow-sm">
              <PlusCircle className="w-4 h-4" />
              <span>Share a place</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Submitted</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {userLocations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={loc.imageUrls[0] || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=150&q=80'}
                            alt={loc.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{loc.name}</span>
                            <span className="text-[11px] text-slate-500 line-clamp-1">{loc.address}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-700">
                        {loc.category}
                      </td>

                      <td className="py-4 px-4 text-slate-500">
                        {new Date(loc.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={loc.verificationStatus} />
                        {loc.rejectionReason && (
                          <div className="mt-1.5 p-2 bg-rose-50 border border-rose-200/80 rounded-lg text-[11px] text-rose-800">
                            <span className="font-bold">Moderator feedback: </span>
                            <span>{loc.rejectionReason}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {loc.verificationStatus === 'NEEDS_CHANGES' && (
                            <button
                              onClick={() => handleOpenEdit(loc)}
                              className="inline-flex items-center gap-1 font-bold text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Fix & Resubmit</span>
                            </button>
                          )}
                          <Link
                            to={`/location/${loc.id}`}
                            className="inline-flex items-center gap-1 font-bold text-xs text-slate-700 hover:text-brand-700 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Resubmit / Edit Modal */}
        {editingLoc && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  Update & Resubmit Contribution
                </h3>
                <button
                  onClick={() => setEditingLoc(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editingLoc.rejectionReason && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                  <span className="font-bold block mb-0.5">Requested change reason:</span>
                  <span>{editingLoc.rejectionReason}</span>
                </div>
              )}

              <form onSubmit={handleSaveResubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Place Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingLoc(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Resubmitting...' : 'Resubmit for review'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
