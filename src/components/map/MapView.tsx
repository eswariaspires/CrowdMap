import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { LocationItem } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { VerifiedBadge } from '../common/Badge';
import { Link } from 'react-router-dom';
import { MapPin, Navigation } from 'lucide-react';

// Custom SVG Leaflet Pin Icons
const createCustomIcon = (category: string, isSelected: boolean = false) => {
  const categoryColors: Record<string, string> = {
    Study: '#0d9488', // teal
    Food: '#d97706', // amber
    'Wi-Fi': '#2563eb', // blue
    Repair: '#ea580c', // orange
    Shopping: '#9333ea', // purple
    Healthcare: '#e11d48', // rose
    Transport: '#4f46e5', // indigo
    Other: '#475569', // slate
  };

  const color = categoryColors[category] || '#0d9488';
  const size = isSelected ? 40 : 32;

  const svgHtml = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border: 3px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
    ">
      <div style="
        width: ${size * 0.4}px;
        height: ${size * 0.4}px;
        background-color: #ffffff;
        border-radius: 50%;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// Picker Click Handler Component
const MapClickHandler: React.FC<{ onSelect?: (lat: number, lng: number) => void }> = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      if (onSelect) {
        onSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// Map Fly-To controller
const MapFlyTo: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

interface MapViewProps {
  locations: LocationItem[];
  center?: [number, number];
  zoom?: number;
  selectedLocationId?: string;
  onMarkerClick?: (location: LocationItem) => void;
  pickerMode?: boolean;
  selectedLatLng?: { lat: number; lng: number } | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  locations,
  center = [42.3601, -71.0589],
  zoom = 13,
  selectedLocationId,
  onMarkerClick,
  pickerMode = false,
  selectedLatLng,
  onLocationSelect,
  height = '100%',
}) => {
  return (
    <div style={{ height, width: '100%' }} className="relative rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFlyTo center={center} zoom={zoom} />

        {pickerMode && <MapClickHandler onSelect={onLocationSelect} />}

        {/* Location Markers */}
        {!pickerMode &&
          locations.map((loc) => {
            const isSelected = loc.id === selectedLocationId;
            return (
              <Marker
                key={loc.id}
                position={[loc.latitude, loc.longitude]}
                icon={createCustomIcon(loc.category, isSelected)}
                eventHandlers={{
                  click: () => onMarkerClick && onMarkerClick(loc),
                }}
              >
                <Popup>
                  <div className="p-3 w-64">
                    {loc.imageUrls && loc.imageUrls.length > 0 && (
                      <div className="h-28 -mx-3 -mt-3 mb-2 overflow-hidden bg-slate-100 relative">
                        <img
                          src={loc.imageUrls[0]}
                          alt={loc.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
                          {loc.category}
                        </span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">{loc.name}</h4>
                        {loc.verificationStatus === 'APPROVED' && <VerifiedBadge size="sm" />}
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1">{loc.address}</p>

                      <div className="flex items-center justify-between pt-1">
                        <RatingStars rating={loc.averageRating} size="sm" showNumeric reviewCount={loc.reviewCount} />
                      </div>

                      <div className="pt-2">
                        <Link
                          to={`/location/${loc.id}`}
                          className="block w-full text-center py-1.5 px-3 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs transition-colors shadow-xs"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Picker Mode Marker */}
        {pickerMode && selectedLatLng && (
          <Marker
            position={[selectedLatLng.lat, selectedLatLng.lng]}
            icon={createCustomIcon('Other', true)}
          >
            <Popup>
              <div className="p-2 text-xs font-semibold text-slate-800">
                📍 Selected Location Point<br/>
                <span className="text-[10px] text-slate-500 font-mono">
                  {selectedLatLng.lat.toFixed(5)}, {selectedLatLng.lng.toFixed(5)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {pickerMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span>Click anywhere on map to pin location coordinates</span>
        </div>
      )}
    </div>
  );
};
