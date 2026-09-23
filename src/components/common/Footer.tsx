import React from 'react';
import { MapPin, Shield, Server, Database, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-700 text-white flex items-center justify-center shadow-sm">
                <MapPin className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">CrowdMap</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Discover what matters around you. Share what you know. Help keep local information useful.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Explore Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/explore" className="hover:text-white transition-colors">Interactive Map</Link></li>
              <li><a href="/#categories" className="hover:text-white transition-colors">Resource Categories</a></li>
              <li><Link to="/add-location" className="hover:text-white transition-colors">Share a Place</Link></li>
              <li><Link to="/saved" className="hover:text-white transition-colors">Saved Collection</Link></li>
            </ul>
          </div>

          {/* Col 3: Platform Features */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Community Knowledge</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Moderated Verification</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-brand-400" /> OpenStreetMap Integration</li>
              <li className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-amber-400" /> Real-time Knowledge Engine</li>
            </ul>
          </div>

          {/* Col 4: Account & Portal */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Account & Moderation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/profile" className="hover:text-white transition-colors">User Profile</Link></li>
              <li><Link to="/my-contributions" className="hover:text-white transition-colors">My Contributions</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin Moderation Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 CrowdMap. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/explore" className="hover:text-slate-300">Explore Map</Link>
            <Link to="/admin" className="hover:text-slate-300">Admin Suite</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
