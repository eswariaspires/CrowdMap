import React from 'react';
import { LocationItem } from '../../types';
import { LocationCard } from './LocationCard';
import { MapPinOff } from 'lucide-react';

interface LocationGridProps {
  locations: LocationItem[];
  loading?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  showStatus?: boolean;
}

export const LocationGrid: React.FC<LocationGridProps> = ({
  locations,
  loading = false,
  emptyTitle = 'No locations found',
  emptySubtitle = 'Try adjusting your search criteria or filters to explore more community places.',
  showStatus = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
            <div className="h-44 bg-slate-200 rounded-xl"></div>
            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-10 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs max-w-md mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-4">
          <MapPinOff className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">{emptyTitle}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">{emptySubtitle}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {locations.map((loc) => (
        <LocationCard key={loc.id} location={loc} showStatus={showStatus} />
      ))}
    </div>
  );
};
