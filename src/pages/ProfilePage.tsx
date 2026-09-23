import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { User as UserIcon, ShieldCheck, MapPin, MessageSquare, Camera, LogOut, CheckCircle2, Bookmark, Settings, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { uploadImageToStorage } from '../services/storageService';

export const ProfilePage: React.FC = () => {
  const { user, logout, updateProfileImage } = useAuth();
  const { locations, reviews, getSavedLocations } = useData();
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);

  const userLocations = locations.filter(l => l.createdBy === user?.uid || l.createdBy === 'user-alex');
  const approvedCount = userLocations.filter(l => l.verificationStatus === 'APPROVED').length;
  const userReviews = reviews.filter(r => r.userId === user?.uid || r.userId === 'user-sarah');
  const savedLocations = user ? getSavedLocations(user.uid) : [];

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setUploading(true);
        const file = e.target.files[0];
        const url = await uploadImageToStorage(file, 'profiles');
        await updateProfileImage(url);
      } catch (err) {
        console.error('Error updating avatar:', err);
      } finally {
        setUploading(false);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group shrink-0">
            <img
              src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
            <label className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full cursor-pointer hover:bg-brand-700 transition-colors shadow-sm">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">{user.name}</h1>
                <p className="text-xs text-slate-500 font-medium">{user.email}</p>
              </div>

              <span className={`self-center sm:self-start px-3 py-1 rounded-full text-xs font-bold ${
                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {user.role} ACCOUNT
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Community member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-slate-900 block">{userLocations.length}</span>
                <span className="text-xs text-slate-500 font-semibold">Shared Places</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm bg-amber-50/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-amber-900 block">{savedLocations.length}</span>
                <span className="text-xs text-amber-700 font-semibold">Saved Places</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-slate-900 block">{userReviews.length}</span>
                <span className="text-xs text-slate-500 font-semibold">Reviews Written</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Sections */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100 shadow-sm">
          
          <Link to="/saved" className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Saved Places</h3>
                <p className="text-xs text-slate-500">Bookmarked locations for quick access</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link to="/my-contributions" className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">My Contributions</h3>
                <p className="text-xs text-slate-500">Track and manage places you have shared</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link to="/my-reviews" className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">My Reviews</h3>
                <p className="text-xs text-slate-500">Manage your ratings and community comments</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>

          {user.role === 'ADMIN' && (
            <Link to="/admin" className="flex items-center justify-between p-5 bg-purple-50/50 hover:bg-purple-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-purple-900">Admin Platform Moderation</h3>
                  <p className="text-xs text-purple-700">Verify submissions, manage reports, and platform health</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-700" />
            </Link>
          )}
        </div>

        <div className="pt-4 text-center">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-5 py-2.5 rounded-xl hover:bg-rose-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </main>

      <Footer />
    </div>
  );
};
