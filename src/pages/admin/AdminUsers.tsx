import React from 'react';
import { Users, ShieldCheck, UserCheck } from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { useData } from '../../contexts/DataContext';

export const AdminUsers: React.FC = () => {
  const { locations, reviews } = useData();

  const userDirectory = [
    {
      uid: 'seed-admin-999',
      name: 'Platform Moderator',
      email: 'admin@crowdmap.com',
      role: 'ADMIN',
      joined: '2026-07-01',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    },
    {
      uid: 'seed-user-123',
      name: 'Alex Chen',
      email: 'alex.chen@example.com',
      role: 'USER',
      joined: '2026-08-01',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    {
      uid: 'user-maria',
      name: 'Maria Santos',
      email: 'maria.santos@example.com',
      role: 'USER',
      joined: '2026-08-05',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    },
    {
      uid: 'user-devon',
      name: 'Devon Vance',
      email: 'devon.vance@example.com',
      role: 'USER',
      joined: '2026-08-10',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    }
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="User Directory & Authorization Audit"
          subtitle="Audit registered user accounts, assigned roles, and contribution activity."
        />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">Registered User Accounts ({userDirectory.length})</h3>
              <span className="text-[11px] text-slate-400 font-mono">Roles enforced via Firestore Security Rules</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-4">Email</th>
                    <th className="py-4 px-4">Role</th>
                    <th className="py-4 px-4">Joined Date</th>
                    <th className="py-4 px-4">Contributions</th>
                    <th className="py-4 px-4">Reviews</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {userDirectory.map((usr) => {
                    const contribCount = locations.filter(l => l.createdBy === usr.uid || (usr.uid === 'seed-user-123' && l.createdBy === 'user-alex')).length;
                    const reviewCount = reviews.filter(r => r.userId === usr.uid || (usr.uid === 'seed-user-123' && r.userId === 'user-sarah')).length;

                    return (
                      <tr key={usr.uid} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={usr.avatar}
                              alt={usr.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                            <span className="font-bold text-slate-900">{usr.name}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-600 font-mono">{usr.email}</td>

                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            usr.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {usr.role === 'ADMIN' ? <ShieldCheck className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                            {usr.role}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-slate-400">{usr.joined}</td>

                        <td className="py-4 px-4 font-bold text-slate-800">{contribCount} places</td>

                        <td className="py-4 px-4 font-bold text-slate-800">{reviewCount} reviews</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};
