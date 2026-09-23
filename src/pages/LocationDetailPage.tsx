import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  ExternalLink, 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  Flag, 
  ArrowLeft, 
  Bookmark,
  BookmarkCheck,
  User as UserIcon,
  Navigation,
  Share2
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { RatingStars } from '../components/common/RatingStars';
import { VerifiedBadge, StatusBadge, CategoryBadge } from '../components/common/Badge';
import { MapView } from '../components/map/MapView';
import { ReviewCard } from '../components/reviews/ReviewCard';
import { ReviewForm } from '../components/reviews/ReviewForm';
import { ReportModal } from '../components/common/ReportModal';
import { Review } from '../types';

export const LocationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLocationById, getReviewsByLocationId, addReview, deleteReview, toggleSaveLocation, isLocationSaved } = useData();
  const { user } = useAuth();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'location' | 'review'; id: string; title?: string }>({
    type: 'location',
    id: id || '',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const location = id ? getLocationById(id) : undefined;
  const reviews = id ? getReviewsByLocationId(id) : [];

  const isSaved = user && location ? isLocationSaved(location.id, user.uid) : false;

  if (!location) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <MapPin className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Location Not Found</h2>
          <p className="text-xs text-slate-600 max-w-sm mb-6">
            The place you are looking for may have been removed or is unavailable.
          </p>
          <Link to="/explore" className="px-5 py-2.5 rounded-xl bg-brand-700 text-white font-semibold text-xs">
            Back to Explore Map
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const saved = await toggleSaveLocation(location.id, user.uid);
    showToast(saved ? 'Place saved to your collection.' : 'Place removed from saved.');
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    await addReview(location.id, rating, comment, user.uid, user.name, user.profileImage);
    showToast('Review submitted for moderation approval.');
  };

  const handleOpenReportLocation = () => {
    setReportTarget({ type: 'location', id: location.id, title: location.name });
    setReportModalOpen(true);
  };

  const handleOpenReportReview = (rev: Review) => {
    setReportTarget({ type: 'review', id: rev.id, title: `Review by ${rev.userName}` });
    setReportModalOpen(true);
  };

  const directionsUrl = location.googleMapsUrl || `https://maps.google.com/?q=${location.latitude},${location.longitude}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Actions Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-brand-700" />
            <span>Back to explore</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSave}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors border shadow-sm ${
                isSaved
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4 text-slate-500" />}
              <span>{isSaved ? 'Saved' : 'Save place'}</span>
            </button>

            <button
              onClick={handleOpenReportLocation}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200 relative">
            <img
              src={location.imageUrls[0] || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80'}
              alt={location.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-900 shadow-sm">
                {location.category}
              </span>
              {location.verificationStatus === 'APPROVED' && <VerifiedBadge />}
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-4">
            {location.imageUrls[1] ? (
              <div className="h-[184px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={location.imageUrls[1]} alt={location.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-[184px] rounded-2xl bg-slate-100/80 border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-medium">
                No additional photos
              </div>
            )}

            <div className="h-[184px] rounded-2xl overflow-hidden border border-slate-200 relative">
              <MapView
                locations={[location]}
                center={[location.latitude, location.longitude]}
                zoom={14}
                height="100%"
              />
            </div>
          </div>
        </div>

        {/* Header & Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Title & Metadata Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                    {location.name}
                  </h1>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>{location.address}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end bg-amber-50 border border-amber-200/80 px-4 py-2 rounded-2xl">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="text-xl font-bold text-slate-900">{location.averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{location.reviewCount} Reviews</span>
                </div>
              </div>

              {/* Action Buttons: Get Directions, Save, Write Review */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get directions</span>
                </a>

                <button
                  onClick={handleToggleSave}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs border transition-colors ${
                    isSaved
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4 text-slate-500" />}
                  <span>{isSaved ? 'Saved' : 'Save place'}</span>
                </button>
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">About</h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                  {location.description}
                </p>
              </div>

              {/* Contributor Metadata */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Shared by <strong className="text-slate-700">{location.createdByName || 'Community Member'}</strong></span>
                </div>
                <span>Added {new Date(location.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-700" />
                  <span>Reviews ({reviews.length})</span>
                </h2>
              </div>

              {/* Review Form */}
              <ReviewForm locationId={location.id} onSubmit={handleReviewSubmit} />

              {/* Reviews Feed */}
              {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-sm">
                  <p className="text-xs text-slate-600">No reviews yet. Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <ReviewCard
                      key={rev.id}
                      review={rev}
                      onDelete={(revId) => deleteReview(revId)}
                      onReport={(r) => handleOpenReportReview(r)}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6 sticky top-20">
            
            {/* Directions & Navigation Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Location & Directions</h3>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Maps for Directions</span>
              </a>
            </div>

            {/* Map Mini Embed */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Coordinates</h3>
              <div className="h-56 rounded-xl overflow-hidden border border-slate-200">
                <MapView
                  locations={[location]}
                  center={[location.latitude, location.longitude]}
                  zoom={15}
                  height="100%"
                />
              </div>
              <p className="text-[11px] font-mono text-slate-500 text-center">
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </p>
            </div>

          </div>

        </div>

      </main>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType={reportTarget.type}
        targetId={reportTarget.id}
        targetTitle={reportTarget.title}
      />

      <Footer />
    </div>
  );
};
