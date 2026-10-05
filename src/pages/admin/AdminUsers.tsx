import React, { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, UserCheck, Loader2 } from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types';

export const AdminUsers: React.FC = () => {
  const { locations, reviews } = useData();
  const { user: me } = useAuth();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setError(null);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setUsers(
        (data ?? []).map((r: any) => ({
          uid: r.id,
          name: r.name,
          email: r.email,
          role: r.role,
          profileImage: r.profile_image ?? undefined,
          createdAt: r.created_at,
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const changeRole = async (target: UserProfile, newRole: 'USER' | 'ADMIN') => {
    const action = newRole === 'ADMIN' ? 'make an ADMIN' : 'remove admin rights from';
    if (!window.confirm(`Are you sure you want to ${action} ${target.name} (${target.email})?`)) return;

    setBusyId(target.uid);
    setError(null);
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', target.uid);
    if (error) setError(error.message);
    await loadUsers();
    setBusyId(null);
  };

  const formatDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString() : '-');

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="User Directory & Authorization Audit"
          subtitle="Manage registered accounts, roles, and contribution activity."
        />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold px-4 py-3">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">Registered User Accounts ({users.length})</h3>
              <span className="text-[11px] text-slate-400 font-mono">Roles enforced by Supabase Row Level Security</span>
            </div>

            {loading ? (
              <div className="p-10 flex items-center justify-center gap-2 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">No registered users yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                      <th className="py-4 px-6">User</th>
                      <th className="py-4 px-4">Email</th>
                      <th className="py-4 px-4">Role</th>
                      <th className="py-4 px-4">Joined</th>
                      <th className="py-4 px-4">Contributions</th>
                      <th className="py-4 px-4">Reviews</th>
                      <th className="py-4 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {users.map((usr) => {
                      const contribCount = locations.filter((l) => l.createdBy === usr.uid).length;
                      const reviewCount = reviews.filter((r) => r.userId === usr.uid).length;
                      const isMe = me?.uid === usr.uid;
                      const isAdmin = usr.role === 'ADMIN';

                      return (
                        <tr key={usr.uid} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {usr.profileImage ? (
                                <img
                                  src={usr.profileImage}
                                  alt={usr.name}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-brand-700 text-white flex items-center justify-center font-bold text-sm">
                                  {usr.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                              )}
                              <span className="font-bold text-slate-900">
                                {usr.name} {isMe && <span className="text-[10px] text-slate-400 font-semibold">(you)</span>}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-slate-600 font-mono">{usr.email}</td>

                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                              {usr.role}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-slate-400">{formatDate(usr.createdAt)}</td>
                          <td className="py-4 px-4 font-bold text-slate-800">{contribCount} places</td>
                          <td className="py-4 px-4 font-bold text-slate-800">{reviewCount} reviews</td>

                          <td className="py-4 px-4">
                            {isMe ? (
                              <span className="text-[11px] text-slate-300">-</span>
                            ) : (
                              <button
                                onClick={() => changeRole(usr, isAdmin ? 'USER' : 'ADMIN')}
                                disabled={busyId === usr.uid}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors disabled:opacity-50 ${
                                  isAdmin
                                    ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                    : 'border-purple-200 text-purple-700 hover:bg-purple-50'
                                }`}
                              >
                                {busyId === usr.uid ? 'Saving...' : isAdmin ? 'Remove admin' : 'Make admin'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
