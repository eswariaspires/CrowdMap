import React, { useState } from 'react';
import { RatingStars } from '../common/RatingStars';
import { Send, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ReviewFormProps {
  locationId: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ locationId, onSubmit }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please enter your review comment.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(rating, comment.trim());
      setComment('');
      setRating(5);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
        <p className="text-xs text-slate-600 font-medium mb-2">You must be logged in to leave a community rating & review.</p>
        <a href="/login" className="inline-block px-3.5 py-1.5 rounded-lg bg-brand-700 text-white font-semibold text-xs hover:bg-brand-800">
          Sign In to Review
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900">Write a Review & Rating</h3>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium">
          ✓ Thank you! Your review has been submitted and aggregated.
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 block">Your Rating (1 to 5 Stars)</label>
        <RatingStars rating={rating} size="lg" interactive onRatingChange={setRating} />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 block">Your Experience & Feedback</label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share helpful details for community members (e.g. noise level, outlet availability, quiet hours, staff)..."
          className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-800 placeholder-slate-400"
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Send className="w-3.5 h-3.5" />
        <span>{submitting ? 'Submitting...' : 'Post Review'}</span>
      </button>
    </form>
  );
};
