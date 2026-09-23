import React from 'react';
import { Review } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { Flag, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ReviewCardProps {
  review: Review;
  onDelete?: (reviewId: string) => void;
  onReport?: (review: Review) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onDelete, onReport }) => {
  const { user } = useAuth();
  const isOwner = user?.uid === review.userId;
  const isAdmin = user?.role === 'ADMIN';

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3 shadow-xs hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={review.userPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={review.userName}
            className="w-9 h-9 rounded-full object-cover border border-slate-200"
          />
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-tight">{review.userName}</h4>
            <span className="text-[11px] text-slate-400">{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RatingStars rating={review.rating} size="sm" />

          {/* Action buttons */}
          {(isOwner || isAdmin) && onDelete && (
            <button
              onClick={() => onDelete(review.id)}
              className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded-md hover:bg-rose-50"
              title="Delete Review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {!isOwner && onReport && (
            <button
              onClick={() => onReport(review)}
              className="p-1 text-slate-400 hover:text-amber-600 transition-colors rounded-md hover:bg-amber-50"
              title="Report inappropriate review"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-700 leading-relaxed font-sans pl-12">
        "{review.comment}"
      </p>
    </div>
  );
};
