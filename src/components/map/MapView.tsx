import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { LocationItem } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { VerifiedBadge } from '../common/Badge';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const DEFAULT_CENTER: [number, number] = [16.5062, 80.6480]; // Vijayawada

const isValidCenter = (c: any): c is [number, number] =>
  Array.isArray(c) && c.length === 2 && Number.isFinite(c[0]) && Number.isFinite(c[1]);

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

// Map Fly-To controller (ignores invalid coordinates instead of crashing)
const MapFlyTo: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (!isValidCenter(center) || !Number.isFinite(zoom)) return;
    try {
      map.invalidateSize();
      const size = map.getSize();
      if (size.x > 0 && size.y > 0) {
        map.flyTo(center, zoom, { duration: 1.2 });
      } else {
        // container has no size yet: flyTo would produce NaN, so jump without animation
        map.setView(center, zoom, { animate: false });
      }
    } catch (err) {
      console.warn('Map move skipped:', err);
    }
    // depend on the numbers, not the array object, so it only flies when the center really changes
  }, [center?.[0], center?.[1], zoom, map]);
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
  center = DEFAULT_CENTER,
  zoom = 13,
  selectedLocationId,
  onMarkerClick,
  pickerMode = false,
  selectedLatLng,
  onLocationSelect,
  height = '100%',
}) => {
  const safeCenter: [number, number] = isValidCenter(center) ? center : DEFAULT_CENTER;
  const safeZoom = Number.isFinite(zoom) ? zoom : 13;
  const validLocations = locations.filter(
    (l) => Number.isFinite(l.latitude) && Number.isFinite(l.longitude)
  );
  const validPicked =
    selectedLatLng && Number.isFinite(selectedLatLng.lat) && Number.isFinite(selectedLatLng.lng)
      ? selectedLatLng
      : null;

  return (
    <div style={{ height, width: '100%' }} className="relative rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer
        center={safeCenter}
        zoom={safeZoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFlyTo center={safeCenter} zoom={safeZoom} />

        {pickerMode && <MapClickHandler onSelect={onLocationSelect} />}

        {/* Location Markers */}
        {!pickerMode &&
          validLocations.map((loc) => {
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
        {pickerMode && validPicked && (
          <Marker
            position={[validPicked.lat, validPicked.lng]}
            icon={createCustomIcon('Other', true)}
          >
            <Popup>
              <div className="p-2 text-xs font-semibold text-slate-800">
                📍 Selected Location Point<br/>
                <span className="text-[10px] text-slate-500 font-mono">
                  {validPicked.lat.toFixed(5)}, {validPicked.lng.toFixed(5)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {pickerMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span>Click the map to set the exact location</span>
        </div>
      )}
    </div>
  );
};
