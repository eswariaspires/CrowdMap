import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Bookmark, Star, MapPin, ArrowRight, Trash2 } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const SavedPlacesPage: React.FC = () => {
  const { user } = useAuth();
  const { getSavedLocations, toggleSaveLocation } = useData();

  const savedLocations = user ? getSavedLocations(user.uid) : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-brand-700 font-semibold text-xs tracking-wider uppercase mb-1">
              <Bookmark className="w-4 h-4" />
              Saved Collection
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Saved Places
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Quickly access places and resources you've bookmarked across the platform.
            </p>
          </div>
          {savedLocations.length > 0 && (
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 px-4 py-2.5 rounded-xl hover:bg-brand-100 transition-colors self-start md:self-auto"
            >
              <span>Explore more places</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {savedLocations.length === 0 ? (
          /* Empty State as per Requirement 46 */
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Your saved places will appear here.
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Explore nearby locations and save useful places to easily find them whenever you need them.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <MapPin className="w-4 h-4" />
              <span>Explore nearby</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedLocations.map((loc) => (
              <div
                key={loc.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img
                    src={loc.imageUrls[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge category={loc.category} />
                  </div>
                  <button
                    onClick={() => user && toggleSaveLocation(loc.id, user.uid)}
                    title="Remove from saved"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-600 hover:text-rose-600 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors line-clamp-1">
                        {loc.name}
                      </h3>
                      {loc.averageRating > 0 && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{loc.averageRating}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 flex items-start gap-1 mb-3 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                      <span>{loc.address}</span>
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {loc.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      Verified place
                    </span>
                    <Link
                      to={`/location/${loc.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800"
                    >
                      <span>View place</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
