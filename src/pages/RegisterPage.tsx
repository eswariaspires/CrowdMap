import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility states MUST be inside the component
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await register(
        name.trim(),
        email.trim(),
        password
      );

      navigate('/explore');

    } catch (err: any) {
      setError(err.message || 'Failed to create account.');

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl w-full max-w-md p-8 space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">

          <Link
            to="/"
            className="inline-flex items-center gap-2 group mb-2"
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src="/Logo.png"
                alt="CrowdMap Logo"
                className="w-10 h-10 object-contain"
              />
            </div>

            <span className="text-xl font-extrabold text-slate-900">
              Crowd<span className="text-brand-600">Map</span>
            </span>
          </Link>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create an Account
          </h1>

          <p className="text-xs text-slate-500">
            Join your community to contribute places and share reviews.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">

            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />

            <span>{error}</span>

          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div className="space-y-1.5">

            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Full Name
            </label>

            <div className="relative">

              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Chen"
                className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 placeholder:text-slate-400"
              />

            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">

            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Email Address
            </label>

            <div className="relative">

              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.chen@example.com"
                className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 placeholder:text-slate-400"
              />

            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">

            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Password
            </label>

            <div className="relative">

              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full text-xs pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>

            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">

            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Confirm Password
            </label>

            <div className="relative">

              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full text-xs pl-10 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label={
                  showConfirmPassword
                    ? 'Hide confirm password'
                    : 'Show confirm password'
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>

            </div>
          </div>

          {/* Create Account */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >

            <span>
              {loading
                ? 'Creating Account...'
                : 'Create Account'}
            </span>

            <ArrowRight className="w-4 h-4" />

          </button>

        </form>

        {/* Login */}
        <div className="text-center pt-2 border-t border-slate-100">

          <p className="text-xs text-slate-500">
            Already registered?{' '}

            <Link
              to="/login"
              className="font-bold text-brand-700 hover:underline"
            >
              Sign In
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
};