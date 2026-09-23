import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf8]">
        <div className="w-8 h-8 border-4 border-brand-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in -> Redirect to /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in as normal USER trying to access ADMIN routes -> Access Denied
  if (requireAdmin && user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">Access Denied — Admin Authorization Required</h2>
        <p className="text-xs text-slate-400 max-w-md leading-relaxed">
          Your current account (<strong className="text-white">{user.email}</strong>) has the <strong className="text-emerald-400">USER</strong> role. Normal users cannot access administrative verification routes or elevate themselves to Admin per Firestore security policies.
        </p>
        <div className="pt-2 flex items-center gap-3">
          <a href="/explore" className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200">
            Return to Public Map
          </a>
          <a href="/login" className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 font-bold text-xs text-white">
            Sign In as Admin
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
