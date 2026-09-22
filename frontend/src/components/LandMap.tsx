import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, MapPin } from 'lucide-react';

interface LandMapProps {
  polygonJson?: string;
  district: string;
  anchal: string;
  mauza: string;
  khata: string;
  khesra: string;
}

// Center helper to adjust view bounds dynamically
const MapBoundsAdjuster: React.FC<{ positions: [number, number][] }> = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
};

export const LandMap: React.FC<LandMapProps> = ({ polygonJson, district, anchal, mauza, khata, khesra }) => {
  const [positions, setPositions] = useState<[number, number][]>([]);
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');

  useEffect(() => {
    if (polygonJson) {
      try {
        const parsed = JSON.parse(polygonJson);
        if (parsed && parsed.coordinates && parsed.coordinates[0]) {
          // GeoJSON coordinates are [lng, lat], Leaflet expects [lat, lng]
          const latLngs: [number, number][] = parsed.coordinates[0].map((pt: number[]) => [pt[1], pt[0]]);
          setPositions(latLngs);
        }
      } catch (err) {
        console.error("Failed to parse parcel polygon GeoJSON", err);
      }
    }
  }, [polygonJson]);

  // Default fallback center: Bokaro, Jharkhand coordinates
  const defaultCenter: [number, number] = [23.6693, 86.1511];
  const centerPos = positions.length > 0 ? positions[0] : defaultCenter;

  const tileUrls = {
    street: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; OpenStreetMap contributors • JharBhuNaksha Spatial Layer'
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }
  };

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800 relative">
      <MapContainer center={centerPos} zoom={15} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          key={mapType}
          attribution={tileUrls[mapType].attribution}
          url={tileUrls[mapType].url}
        />

        {positions.length > 0 ? (
          <>
            <Polygon
              positions={positions}
              pathOptions={{
                color: mapType === 'satellite' ? '#38BDF8' : '#0284C7',
                fillColor: mapType === 'satellite' ? '#0284C7' : '#38BDF8',
                fillOpacity: mapType === 'satellite' ? 0.55 : 0.45,
                weight: 3
              }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <strong className="text-sky-700 block text-sm font-bold">Khata #{khata} / Khesra #{khesra}</strong>
                  <span>{mauza}, {anchal}, {district}</span>
                  {positions.length > 0 && (
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      Lat: {positions[0][0].toFixed(5)}, Lng: {positions[0][1].toFixed(5)}
                    </div>
                  )}
                </div>
              </Popup>
            </Polygon>
            <MapBoundsAdjuster positions={positions} />
          </>
        ) : null}
      </MapContainer>

      {/* Map Layer Switcher Control */}
      <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700 text-xs shadow-lg z-[1000] flex items-center space-x-1.5 text-white">
        <Layers className="w-3.5 h-3.5 text-sky-400" />
        <button
          onClick={() => setMapType('street')}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${mapType === 'street' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Street
        </button>
        <button
          onClick={() => setMapType('satellite')}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${mapType === 'satellite' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Satellite
        </button>
      </div>

      {/* Map Control Overlay Footer */}
      <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs shadow-md z-[1000] flex items-center space-x-2">
        <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">JharBhuNaksha GeoSpatial Layer</span>
      </div>
    </div>
  );
};
