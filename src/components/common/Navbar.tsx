import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MapPin,
  PlusCircle,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  BookOpen,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// ===== Change your brand here =====
const LOGO_SRC = '/Logo.png';      // replace the file public/logo.svg with your own logo
const BRAND_FIRST = 'Crowd';
const BRAND_SECOND = 'Map';
const TAGLINE = 'Knowledge Hub';
// ==================================

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
const handleSectionNavigation = (section: string) => {
  if (location.pathname === '/') {
    requestAnimationFrame(() => {
      document.getElementById(section)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
    return;
  }

  navigate('/');

  setTimeout(() => {
    document.getElementById(section)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, 150);
};

const isSectionActive = (section: string) => {
  return location.pathname === '/' && location.hash === section;
};

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: Logo & Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={LOGO_SRC}
                alt={`${BRAND_FIRST}${BRAND_SECOND} logo`}
                className="w-10 h-10 rounded-xl object-contain shadow-md shadow-brand-700/20 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  {BRAND_FIRST}<span className="text-brand-600">{BRAND_SECOND}</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest -mt-0.5">
                  {TAGLINE}
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
<nav className="hidden md:flex items-center gap-1">

  {/* Explore Map */}
  <Link
    to="/explore"
    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive('/explore')
        ? 'bg-brand-50 text-brand-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`}
  >
    Explore Map
  </Link>

  {/* Categories */}
<button
  onClick={() => handleSectionNavigation('categories')}
  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isSectionActive('#categories')
      ? 'bg-brand-50 text-brand-700 font-semibold'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
  }`}
>
  Categories
</button>

  {/* How it Works */}
<button
  onClick={() => handleSectionNavigation('how-it-works')}
  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isSectionActive('#how-it-works')
      ? 'bg-brand-50 text-brand-700 font-semibold'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
  }`}
>
  How it Works
</button>

</nav>
          </div>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-3">

            <Link
              to="/add-location"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-brand-700 text-white hover:bg-brand-800 transition-colors shadow-sm shadow-brand-700/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Share Place</span>
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-700 max-w-[110px] truncate pr-1">
                    {user.name}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 divide-y divide-slate-100"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-3">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <span className={`inline-block mt-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.role} ROLE
                      </span>
                    </div>

                    {user.role === 'ADMIN' && (
                      <div className="p-2 bg-slate-900">
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold text-white hover:bg-slate-800 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            Admin Control Portal
                          </span>
                          <span>→</span>
                        </Link>
                      </div>
                    )}

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>
                      <Link
                        to="/saved"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        Saved Places
                      </Link>
                      <Link
                        to="/my-contributions"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <MapPin className="w-4 h-4 text-slate-400" />
                        My Contributions
                      </Link>
                      <Link
                        to="/my-reviews"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        My Reviews
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-slate-800"
          >
            Explore Map
          </Link>
          <Link
            to="/add-location"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-brand-700"
          >
            + Share a Place
          </Link>
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-bold text-purple-700"
                >
                  Admin Control Portal
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-700"
              >
                Profile ({user.name})
              </Link>
              <Link
                to="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-700"
              >
                Saved Places
              </Link>
              <Link
                to="/my-contributions"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-700"
              >
                My Contributions
              </Link>
              <Link
                to="/my-reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-700"
              >
                My Reviews
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="block w-full text-left py-2 text-base font-medium text-rose-600"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-xl bg-slate-100 font-bold text-xs text-slate-800"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-xl bg-brand-700 font-bold text-xs text-white"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
