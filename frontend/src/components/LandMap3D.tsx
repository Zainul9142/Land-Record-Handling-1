import React, { useState, useEffect } from 'react';
import { 
  Box, Layers, RotateCcw, Compass, MapPin, CheckCircle2, 
  Play, Pause, Sun, Moon, Maximize2, Shield, Eye, Grid, Waves, Trees
} from 'lucide-react';

interface LandMap3DProps {
  polygonJson?: string;
  district: string;
  anchal: string;
  mauza: string;
  khata: string;
  khesra: string;
  areaAcre: number;
}

export const LandMap3D: React.FC<LandMap3DProps> = ({ 
  polygonJson, district, anchal, mauza, khata, khesra, areaAcre 
}) => {
  const [extrusionHeight, setExtrusionHeight] = useState<number>(45);
  const [terrainElevation, setTerrainElevation] = useState<number>(20);
  const [rotationAngle, setRotationAngle] = useState<number>(30);
  const [pitchAngle, setPitchAngle] = useState<number>(55);
  const [sunAngle, setSunAngle] = useState<number>(45);
  const [viewMode, setViewMode] = useState<'cadastral' | 'terrain' | 'satellite' | 'wireframe'>('satellite');
  const [coordsCount, setCoordsCount] = useState<number>(4);
  const [autoSpin, setAutoSpin] = useState<boolean>(false);
  const [showBuffers, setShowBuffers] = useState<boolean>(true);
  const [showBeacons, setShowBeacons] = useState<boolean>(true);
  const [selectedUnit, setSelectedUnit] = useState<'ACRE' | 'DECIMAL' | 'SQFT' | 'SQM' | 'BIGHA'>('ACRE');

  useEffect(() => {
    if (polygonJson) {
      try {
        const parsed = JSON.parse(polygonJson);
        if (parsed?.coordinates?.[0]) {
          setCoordsCount(parsed.coordinates[0].length - 1);
        }
      } catch (err) {
        console.error("3D polygon parse error", err);
      }
    }
  }, [polygonJson]);

  // 360 Auto-spin Orbit Effect
  useEffect(() => {
    if (!autoSpin) return;
    const interval = setInterval(() => {
      setRotationAngle(prev => (prev >= 180 ? -180 : prev + 1.5));
    }, 40);
    return () => clearInterval(interval);
  }, [autoSpin]);

  const applyCameraPreset = (preset: 'ISO' | 'TOP_DOWN' | 'HIGH_EXTRUSION' | 'ELEVATED_TOPO') => {
    if (preset === 'ISO') {
      setExtrusionHeight(45);
      setTerrainElevation(20);
      setRotationAngle(30);
      setPitchAngle(55);
    } else if (preset === 'TOP_DOWN') {
      setExtrusionHeight(10);
      setTerrainElevation(0);
      setRotationAngle(0);
      setPitchAngle(15);
    } else if (preset === 'HIGH_EXTRUSION') {
      setExtrusionHeight(85);
      setTerrainElevation(30);
      setRotationAngle(45);
      setPitchAngle(65);
    } else if (preset === 'ELEVATED_TOPO') {
      setExtrusionHeight(25);
      setTerrainElevation(50);
      setRotationAngle(-40);
      setPitchAngle(45);
    }
  };

  // Measurement conversions
  const getConvertedArea = () => {
    const val = areaAcre || 1.0;
    switch (selectedUnit) {
      case 'DECIMAL':
        return `${(val * 100).toFixed(1)} Decimals (डिसमिल)`;
      case 'SQFT':
        return `${(val * 43560).toLocaleString(undefined, { maximumFractionDigits: 0 })} Sq. Ft`;
      case 'SQM':
        return `${(val * 4046.86).toLocaleString(undefined, { maximumFractionDigits: 1 })} Sq. Meters`;
      case 'BIGHA':
        return `${(val * 1.6).toFixed(2)} Standard Bigha (बीघा)`;
      default:
        return `${val.toFixed(2)} Standard Acres (एकड़)`;
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl text-slate-100 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-bold text-sm">
            <Box className="w-5 h-5 text-sky-400" />
            <span>3D Cadastral Spatial Parcel & Elevation Simulator</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
            <span className="flex items-center space-x-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>GeoJSON Boundary ({coordsCount} Cadastral Beacons)</span>
            </span>
            <span>• {mauza}, {anchal}, {district}</span>
          </div>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setAutoSpin(!autoSpin)}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1 transition-all cursor-pointer ${
              autoSpin ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {autoSpin ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{autoSpin ? "Orbiting" : "360° Orbit"}</span>
          </button>

          <div className="h-4 w-px bg-slate-800"></div>

          <button
            onClick={() => setViewMode('satellite')}
            className={`px-2.5 py-1 rounded-xl font-semibold transition-colors cursor-pointer ${
              viewMode === 'satellite' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite 3D
          </button>
          <button
            onClick={() => setViewMode('terrain')}
            className={`px-2.5 py-1 rounded-xl font-semibold transition-colors cursor-pointer ${
              viewMode === 'terrain' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Topography
          </button>
          <button
            onClick={() => setViewMode('wireframe')}
            className={`px-2.5 py-1 rounded-xl font-semibold transition-colors cursor-pointer ${
              viewMode === 'wireframe' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Wireframe
          </button>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
        {/* Preset Angles */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-semibold text-[11px]">Camera:</span>
          <button
            onClick={() => applyCameraPreset('ISO')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
          >
            Isometric
          </button>
          <button
            onClick={() => applyCameraPreset('TOP_DOWN')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
          >
            Plan (Top-Down)
          </button>
          <button
            onClick={() => applyCameraPreset('ELEVATED_TOPO')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
          >
            Elevation Tilt
          </button>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-1.5 text-slate-300 text-[11px] cursor-pointer">
            <input
              type="checkbox"
              checked={showBuffers}
              onChange={(e) => setShowBuffers(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-sky-500"
            />
            <span>Road & Eco Buffers</span>
          </label>
          <label className="flex items-center space-x-1.5 text-slate-300 text-[11px] cursor-pointer">
            <input
              type="checkbox"
              checked={showBeacons}
              onChange={(e) => setShowBeacons(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500"
            />
            <span>Survey Beacons (P1-P4)</span>
          </label>
        </div>
      </div>

      {/* 3D Realistic Perspective Canvas */}
      <div className="w-full h-[460px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl relative overflow-hidden border border-slate-800 flex items-center justify-center select-none">
        
        {/* Dynamic Sun Lighting Glow */}
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-300"
          style={{
            background: viewMode === 'terrain' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.18)',
            transform: `translate(${Math.cos(sunAngle * Math.PI / 180) * 120}px, ${Math.sin(sunAngle * Math.PI / 180) * 100}px)`
          }}
        ></div>

        {/* Spatial Cadastral Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-35 pointer-events-none"></div>

        {/* 3D Compass Overlay */}
        <div className="absolute top-4 left-4 p-2 bg-slate-900/90 rounded-2xl border border-slate-700 shadow-xl flex items-center space-x-2 text-xs pointer-events-none z-10">
          <div 
            className="w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center transition-transform"
            style={{ transform: `rotate(${-rotationAngle}deg)` }}
          >
            <span className="font-bold text-rose-500 text-[10px] transform -translate-y-1">N</span>
          </div>
          <span className="text-[10px] font-mono text-slate-300">{Math.round(rotationAngle)}° Azimuth</span>
        </div>

        {/* Elevation Status Tag */}
        <div className="absolute top-4 right-4 p-2 bg-slate-900/90 rounded-2xl border border-slate-700 shadow-xl text-right text-xs pointer-events-none z-10">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Terrain Altitude</span>
          <span className="font-mono text-emerald-400 font-bold">218m ASL (Slope 2.1%)</span>
        </div>

        {/* 3D Isometric Extrusion Container */}
        <div
          className="relative transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing"
          style={{
            transform: `perspective(1100px) rotateX(${pitchAngle}deg) rotateZ(${rotationAngle}deg) translateY(-25px)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Base Foundation Terrain Slab */}
          <div className="w-80 h-80 bg-slate-900/95 border-2 border-dashed border-sky-500/30 rounded-3xl flex items-center justify-center relative shadow-2xl">
            
            {/* Surrounding Road / Canal Buffer Lines */}
            {showBuffers && (
              <>
                <div className="absolute -top-8 left-0 right-0 h-4 bg-amber-500/20 border-y border-amber-500/40 rounded flex items-center justify-center">
                  <span className="text-[8px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                    Official Revenue Road Buffer (12m PWD Road)
                  </span>
                </div>
                <div className="absolute -bottom-8 left-0 right-0 h-4 bg-sky-500/20 border-y border-sky-500/40 rounded flex items-center justify-center">
                  <span className="text-[8px] font-mono text-sky-300 font-bold uppercase tracking-wider">
                    Natural Drainage / Canal Setback Zone (15m Buffer)
                  </span>
                </div>
              </>
            )}

            {/* 3D Extruded Cadastral Geometry */}
            <div
              className={`relative transition-all duration-300 rounded-2xl shadow-2xl flex items-center justify-center ${
                viewMode === 'wireframe'
                  ? 'bg-amber-500/10 border-2 border-amber-400 shadow-amber-500/20'
                  : viewMode === 'terrain'
                  ? 'bg-gradient-to-tr from-emerald-900 via-emerald-600 to-teal-400 border-2 border-emerald-300 shadow-emerald-500/50'
                  : 'bg-gradient-to-tr from-sky-800 via-indigo-700 to-sky-400 border-2 border-sky-300 shadow-sky-500/50'
              }`}
              style={{
                width: '230px',
                height: '175px',
                clipPath: 'polygon(5% 15%, 90% 0%, 100% 85%, 12% 100%)',
                transform: `translateZ(${extrusionHeight + terrainElevation}px)`,
                filter: 'drop-shadow(0 30px 45px rgba(0,0,0,0.9))'
              }}
            >
              {/* Parcel Identity Hologram Banner */}
              <div className="p-4 text-center space-y-1 transform -rotate-6">
                <span className="font-mono font-extrabold text-xs text-white block bg-slate-950/90 px-3 py-1.5 rounded-xl border border-white/20 shadow-lg">
                  Khata #{khata} / Khesra #{khesra}
                </span>
                <span className="text-[10px] font-bold text-sky-100 block drop-shadow-md">
                  {areaAcre} Acres • {mauza}
                </span>
              </div>
            </div>

            {/* Cadastral Corner Beacons (P1, P2, P3, P4) */}
            {showBeacons && (
              <>
                <div 
                  className="absolute -top-1 left-4 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shadow-lg border border-white"
                  style={{ transform: `translateZ(${extrusionHeight + terrainElevation + 15}px)` }}
                >
                  P1
                </div>
                <div 
                  className="absolute top-0 right-4 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shadow-lg border border-white"
                  style={{ transform: `translateZ(${extrusionHeight + terrainElevation + 15}px)` }}
                >
                  P2
                </div>
                <div 
                  className="absolute bottom-2 right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shadow-lg border border-white"
                  style={{ transform: `translateZ(${extrusionHeight + terrainElevation + 15}px)` }}
                >
                  P3
                </div>
                <div 
                  className="absolute bottom-1 left-2 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shadow-lg border border-white"
                  style={{ transform: `translateZ(${extrusionHeight + terrainElevation + 15}px)` }}
                >
                  P4
                </div>
              </>
            )}

          </div>
        </div>

        {/* Bottom Interactive Sliders HUD */}
        <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs z-10">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center space-x-2 flex-1 max-w-[200px]">
              <span className="text-slate-400 font-semibold text-[10px] uppercase">Extrusion:</span>
              <input
                type="range"
                min={5}
                max={100}
                value={extrusionHeight}
                onChange={(e) => setExtrusionHeight(Number(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
            <div className="flex items-center space-x-2 flex-1 max-w-[200px]">
              <span className="text-slate-400 font-semibold text-[10px] uppercase">Elevation:</span>
              <input
                type="range"
                min={0}
                max={60}
                value={terrainElevation}
                onChange={(e) => setTerrainElevation(Number(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          {/* Unit Converter Tabs */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['ACRE', 'DECIMAL', 'SQFT', 'SQM', 'BIGHA'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setSelectedUnit(u)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                  selectedUnit === u ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Converted Area Summary */}
      <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-semibold">Standardized Cadastral Area:</span>
        <span className="font-mono text-sky-400 font-extrabold text-sm">{getConvertedArea()}</span>
      </div>
    </div>
  );
};
