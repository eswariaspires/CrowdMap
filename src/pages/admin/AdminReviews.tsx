import React, { useState } from 'react';
import { MessageSquare, Trash2, Star, CheckCircle2, AlertTriangle, Clock, X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { RatingStars } from '../../components/common/RatingStars';
import { Review, ReviewStatus } from '../../types';

export const AdminReviews: React.FC = () => {
  const { reviews, locations, approveReview, rejectReview, deleteReview } = useData();

  const [activeTab, setActiveTab] = useState<'ALL' | ReviewStatus>('PENDING');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Inappropriate language or promotional spam');

  const filteredReviews = reviews.filter((rev) => {
    if (activeTab === 'ALL') return true;
    return rev.status === activeTab;
  });

  const handleApprove = async (id: string) => {
    await approveReview(id);
  };

  const handleConfirmReject = async () => {
    if (selectedReview) {
      await rejectReview(selectedReview.id, rejectionReason);
      setRejectionModalOpen(false);
      setSelectedReview(null);
    }
  };

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">APPROVED</span>;
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">PENDING REVIEW</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">REJECTED</span>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="Review Moderation & Verification Center"
          subtitle="Audit, approve, or reject user ratings and reviews before they count toward public location averages."
        />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs w-fit">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => {
              const count = tab === 'ALL'
                ? reviews.length
                : reviews.filter(r => r.status === tab).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === tab
                      ? 'bg-brand-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab === 'PENDING' ? 'PENDING VERIFICATION' : tab}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-4">Location</th>
                    <th className="py-4 px-4">Rating</th>
                    <th className="py-4 px-6">Review Comment</th>
                    <th className="py-4 px-4">Submitted</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-6 text-right">Verification Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredReviews.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No reviews matching status "{activeTab}".
                      </td>
                    </tr>
                  ) : (
                    filteredReviews.map((rev) => {
                      const loc = locations.find(l => l.id === rev.locationId);
                      return (
                        <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <img
                                src={rev.userPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                alt={rev.userName}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200"
                              />
                              <span className="font-bold text-slate-900">{rev.userName}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-brand-700 font-semibold">{loc ? loc.name : rev.locationId}</td>

                          <td className="py-4 px-4">
                            <RatingStars rating={rev.rating} size="sm" showNumeric />
                          </td>

                          <td className="py-4 px-6 text-slate-700 max-w-xs">
                            <p className="line-clamp-2">"{rev.comment}"</p>
                            {rev.rejectionReason && (
                              <span className="block text-[10px] text-rose-600 font-semibold mt-1">
                                Rejection Reason: {rev.rejectionReason}
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-4 px-4">
                            {getStatusBadge(rev.status)}
                          </td>

                          <td className="py-4 px-6 text-right space-x-2">
                            {rev.status !== 'APPROVED' && (
                              <button
                                onClick={() => handleApprove(rev.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                              >
                                Approve
                              </button>
                            )}

                            {rev.status !== 'REJECTED' && (
                              <button
                                onClick={() => {
                                  setSelectedReview(rev);
                                  setRejectionModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
                              >
                                Reject
                              </button>
                            )}

                            <button
                              onClick={() => deleteReview(rev.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                              title="Delete review record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      {/* Review Rejection Modal */}
      {rejectionModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Reject User Review</h3>
            <p className="text-xs text-slate-500">Provide a reason for rejecting this review by "{selectedReview.userName}".</p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="e.g., Offensive language, fake rating, promotional spam..."
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
