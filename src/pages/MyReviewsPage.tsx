import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Star, Trash2, ArrowRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { RatingStars } from '../components/common/RatingStars';

export const MyReviewsPage: React.FC = () => {
  const { reviews, locations, deleteReview } = useData();
  const { user } = useAuth();

  const userReviews = reviews.filter(r => r.userId === user?.uid || r.userId === 'user-sarah');

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf8]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Reviews & Ratings</h1>
          <p className="text-xs text-slate-500 font-medium">Manage the feedback you've shared across community locations.</p>
        </div>

        {userReviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No reviews written yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Explore local study spots, food joints, or Wi-Fi points and leave your first review!
            </p>
            <Link to="/explore" className="inline-block px-5 py-2.5 rounded-xl bg-brand-700 text-white font-bold text-xs">
              Explore Map
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userReviews.map((rev) => {
              const loc = locations.find(l => l.id === rev.locationId);
              return (
                <div key={rev.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link to={`/location/${rev.locationId}`} className="font-bold text-base text-slate-900 hover:text-brand-700">
                        {loc ? loc.name : `Location #${rev.locationId}`}
                      </Link>
                      <span className="block text-[11px] text-slate-400">
                        Posted on {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <RatingStars rating={rev.rating} size="sm" />
                      <button
                        onClick={() => deleteReview(rev.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    "{rev.comment}"
                  </p>
                </div>
              );
            })}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
