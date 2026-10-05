import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileImage: (url: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toProfile = (r: any): UserProfile => ({
  uid: r.id,
  name: r.name,
  email: r.email,
  role: r.role,
  profileImage: r.profile_image ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at ?? undefined,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProfile = useCallback(async (authUser: SupabaseUser | null) => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
    if (data) {
      setUser(toProfile(data));
    } else {
      // Profile row is created by a database trigger; fall back just in case it is not there yet
      setUser({
        uid: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        role: 'USER',
        createdAt: authUser.created_at,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => loadProfile(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // defer, so we never call Supabase inside this callback directly
      setTimeout(() => loadProfile(session?.user ?? null), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
  };

  const register = async (name: string, email: string, pass: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { name } },
    });
    if (error) throw error;
    // With "Confirm email" ON in Supabase there is no session until the user clicks the email link.
    if (data.session && data.user) await loadProfile(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfileImage = async (url: string) => {
    if (!user) return;
    const updatedAt = new Date().toISOString();
    const { error } = await supabase.from('profiles').update({ profile_image: url, updated_at: updatedAt }).eq('id', user.uid);
    if (error) throw error;
    setUser({ ...user, profileImage: url, updatedAt });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfileImage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
