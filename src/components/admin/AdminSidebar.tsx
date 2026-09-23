import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  MessageSquare, 
  Flag, 
  Users, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  ArrowLeft,
  Layers,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Location Verification', path: '/admin/locations', icon: MapPin },
    { label: 'Content Moderation', path: '/admin/reports', icon: Flag },
    { label: 'Review Moderation', path: '/admin/reviews', icon: MessageSquare },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Category Management', path: '/admin/categories', icon: Layers },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0 select-none">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-700/30">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight">CrowdMap</h1>
            <span className="text-[10px] font-bold text-brand-400 tracking-widest uppercase block -mt-1">
              Admin Management Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
          Management & Verification
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? 'bg-brand-700 text-white shadow-md shadow-brand-700/20 font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-300' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Exit Link */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <Link
          to="/explore"
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Exit Admin to Public Map</span>
        </Link>
      </div>

      {/* Profile Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={user?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
            alt="Admin"
            className="w-8 h-8 rounded-full object-cover border border-slate-700"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-emerald-400 font-mono font-medium">SUPER ADMIN</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
