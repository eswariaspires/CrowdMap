import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, MessageSquare, ArrowRight } from 'lucide-react';
import { LocationItem } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { VerifiedBadge, StatusBadge } from '../common/Badge';

interface LocationCardProps {
  location: LocationItem;
  showStatus?: boolean;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, showStatus = false }) => {
  const primaryImage = location.imageUrls && location.imageUrls.length > 0
    ? location.imageUrls[0]
    : 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1">
      {/* Image Banner */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img
          src={primaryImage}
          alt={location.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

        {/* Category & Status badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow-sm backdrop-blur-xs">
            {location.category}
          </span>
          {showStatus ? (
            <StatusBadge status={location.verificationStatus} />
          ) : (
            location.verificationStatus === 'APPROVED' && <VerifiedBadge size="sm" />
          )}
        </div>

        {/* Google Maps External Navigation Button */}
        {location.googleMapsUrl && (
          <a
            href={location.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-md backdrop-blur-xs transition-colors"
            title="Open in Google Maps"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/location/${location.id}`} className="hover:text-brand-700 transition-colors">
              <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">
                {location.name}
              </h3>
            </Link>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{location.address}</span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {location.description}
          </p>
        </div>

        {/* Footer info */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <RatingStars
            rating={location.averageRating}
            size="sm"
            showNumeric
            reviewCount={location.reviewCount}
          />

          <Link
            to={`/location/${location.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
