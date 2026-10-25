import React, { useState, useRef, useEffect } from 'react';
import { SENTINEL2_BANDS, SPECTRAL_INDICES, SAMPLE_GEO_LOCATIONS } from '../data/geoData';
import { Satellite, Layers, Eye, Sliders, Info, Shield, RefreshCw } from 'lucide-react';

export const GeoSimulator: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState(SAMPLE_GEO_LOCATIONS[0]);
  const [bandMode, setBandMode] = useState<'true_color' | 'false_color' | 'ndvi' | 'ndwi' | 'nbr'>('ndvi');
  const [splitSlider, setSplitSlider] = useState<number>(50); // 0 to 100
  const [cloudMaskActive, setCloudMaskActive] = useState<boolean>(false);
  const [hoverPixel, setHoverPixel] = useState<{ x: number; y: number; ndvi: number; classLabel: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render synthetic multispectral satellite imagery onto HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    const splitX = Math.round((splitSlider / 100) * width);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const isDegradedSide = x > splitX;

        // Normalized coordinates 0..1
        const nx = x / width;
        const ny = y / height;

        // Terrain Features
        // River: winding curve
        const riverY = 0.5 + 0.15 * Math.sin(nx * 6.0) + 0.08 * Math.cos(nx * 12.0);
        const distToRiver = Math.abs(ny - riverY);
        const isWater = distToRiver < 0.045;

        // Deforestation / Burn patch (more prominent on degraded side)
        const isDeforestedPatch = isDegradedSide && nx > 0.45 && ny > 0.25 && ny < 0.8 && (Math.sin(nx * 20) * Math.cos(ny * 20) > -0.2);

        // Agricultural plots
        const isField = !isWater && !isDeforestedPatch && ((Math.floor(nx * 12) + Math.floor(ny * 8)) % 3 === 0);

        // Cloud simulation
        const isCloud = cloudMaskActive && (Math.hypot(nx - 0.8, ny - 0.2) < 0.12 || Math.hypot(nx - 0.2, ny - 0.75) < 0.08);

        // Synthetic Band Reflectances (0.0 to 1.0)
        let b02_blue = 0.1;
        let b03_green = 0.2;
        let b04_red = 0.15;
        let b08_nir = 0.85; // healthy vegetation
        let b12_swir = 0.15;

        if (isWater) {
          b02_blue = 0.45;
          b03_green = 0.40;
          b04_red = 0.15;
          b08_nir = 0.03; // water absorbs NIR
          b12_swir = 0.01;
        } else if (isDeforestedPatch) {
          b02_blue = 0.3;
          b03_green = 0.35;
          b04_red = 0.55; // high red bare soil
          b08_nir = 0.22; // low NIR
          b12_swir = 0.65; // high dry bare soil/char
        } else if (isField) {
          b02_blue = 0.12;
          b03_green = 0.38;
          b04_red = 0.22;
          b08_nir = 0.70;
          b12_swir = 0.20;
        }

        // Calculate Indices
        const ndvi = (b08_nir - b04_red) / (b08_nir + b04_red + 0.0001);
        const ndwi = (b03_green - b08_nir) / (b03_green + b08_nir + 0.0001);
        const nbr = (b08_nir - b12_swir) / (b08_nir + b12_swir + 0.0001);

        let r = 0, g = 0, b = 0;

        if (bandMode === 'true_color') {
          // RGB (B04, B03, B02)
          r = Math.min(255, Math.round(b04_red * 350));
          g = Math.min(255, Math.round(b03_green * 350));
          b = Math.min(255, Math.round(b02_blue * 350));
        } else if (bandMode === 'false_color') {
          // NIR, Red, Green (B08, B04, B03) - Healthy vegetation glows crimson
          r = Math.min(255, Math.round(b08_nir * 280));
          g = Math.min(255, Math.round(b04_red * 280));
          b = Math.min(255, Math.round(b03_green * 280));
        } else if (bandMode === 'ndvi') {
          // Color ramp: Water (Navy Blue) -> Bare/Char (Brown/Tan) -> Shrub (Yellow) -> Forest (Deep Emerald)
          if (ndvi < 0) {
            r = 30; g = 58; b = 138; // deep blue
          } else if (ndvi < 0.2) {
            r = 180; g = 130; b = 70; // bare soil tan
          } else if (ndvi < 0.45) {
            r = 217; g = 180; b = 50; // yellow/grass
          } else {
            // green gradient
            const factor = (ndvi - 0.45) / 0.55;
            r = Math.round(20 + (1 - factor) * 80);
            g = Math.round(140 + factor * 115);
            b = Math.round(30 + (1 - factor) * 40);
          }
        } else if (bandMode === 'ndwi') {
          // Water index
          if (ndwi > 0.1) {
            r = 14; g = 165; b = 233; // bright cyan water
          } else {
            r = 50; g = 55; b = 65; // muted terrestrial
          }
        } else if (bandMode === 'nbr') {
          // Burn ratio
          if (nbr < 0.1) {
            r = 225; g = 29; b = 72; // severe burn scar
          } else {
            r = 34; g = 197; b = 94; // healthy canopy
          }
        }

        if (isCloud) {
          r = 240; g = 245; b = 255;
        }

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Draw split-screen boundary line
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(splitX, 0);
    ctx.lineTo(splitX, height);
    ctx.stroke();

    // Labels on both sides
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('BASELINE 2020', 12, 20);
    ctx.fillText('MONITORED 2024 (DEGRADED)', Math.max(splitX + 12, width - 180), 20);

  }, [bandMode, splitSlider, cloudMaskActive, selectedLocation]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);

    const nx = x / canvas.width;
    const ny = y / canvas.height;
    const isDegraded = x > (splitSlider / 100) * canvas.width;
    const riverY = 0.5 + 0.15 * Math.sin(nx * 6.0) + 0.08 * Math.cos(nx * 12.0);
    const isWater = Math.abs(ny - riverY) < 0.045;
    const isDeforested = isDegraded && nx > 0.45 && ny > 0.25 && ny < 0.8 && (Math.sin(nx * 20) * Math.cos(ny * 20) > -0.2);

    let ndviVal = 0.78;
    let label = 'Dense Primary Rainforest';
    if (isWater) {
      ndviVal = -0.32;
      label = 'Open Freshwater River Basin';
    } else if (isDeforested) {
      ndviVal = 0.18;
      label = 'Clear-cut / Wildfire Degraded Surface';
    }

    setHoverPixel({ x, y, ndvi: ndviVal, classLabel: label });
  };

  return (
    <div className="space-y-6">
      {/* Top Controller Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="text-cyan-400 font-mono font-semibold">SENTINEL-2 / LANDSAT CLOUD PIPELINE</span>
            <span>·</span>
            <span>Cloud-Optimized GeoTIFF (COG) Stream</span>
            <span>·</span>
            <span>Dynamic TiTiler Processing</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Earth Observation Multispectral Remote Sensing Studio
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Monitoring Target:</label>
          <select
            value={selectedLocation.id}
            onChange={(e) => {
              const loc = SAMPLE_GEO_LOCATIONS.find((l) => l.id === e.target.value);
              if (loc) setSelectedLocation(loc);
            }}
            className="bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            {SAMPLE_GEO_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Canvas & Band Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Interactive Satellite Canvas */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Spectral Band Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                onClick={() => setBandMode('true_color')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  bandMode === 'true_color' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                True Color (RGB)
              </button>
              <button
                onClick={() => setBandMode('false_color')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  bandMode === 'false_color' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                False Color NIR (8-4-3)
              </button>
              <button
                onClick={() => setBandMode('ndvi')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  bandMode === 'ndvi' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                NDVI Vegetation Index
              </button>
              <button
                onClick={() => setBandMode('ndwi')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  bandMode === 'ndwi' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                NDWI Water Index
              </button>
              <button
                onClick={() => setBandMode('nbr')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  bandMode === 'nbr' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                NBR Burn Ratio
              </button>
            </div>

            {/* Cloud Mask Toggle */}
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={cloudMaskActive}
                onChange={(e) => setCloudMaskActive(e.target.checked)}
                className="accent-cyan-500 rounded"
              />
              <span>Apply SCL Cloud Mask</span>
            </label>
          </div>

          {/* Canvas Viewport */}
          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={640}
              height={360}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoverPixel(null)}
              className="w-full h-auto block"
            />

            {/* Hover Telemetry HUD overlay */}
            {hoverPixel && (
              <div className="absolute top-3 right-3 bg-slate-950/90 border border-cyan-500/40 backdrop-blur-sm p-3 rounded-lg text-xs font-mono space-y-1 text-slate-200 pointer-events-none shadow-lg">
                <div className="text-cyan-400 font-semibold">{hoverPixel.classLabel}</div>
                <div>X: {hoverPixel.x}px | Y: {hoverPixel.y}px</div>
                <div className="text-amber-400 font-bold">Calculated NDVI: {hoverPixel.ndvi.toFixed(3)}</div>
                <div className="text-[10px] text-slate-400">Formula: (B08 - B04) / (B08 + B04)</div>
              </div>
            )}
          </div>

          {/* Temporal Split-Screen Slider */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-emerald-400">&larr; Baseline 2020 Canopy</span>
              <span className="font-mono text-amber-400">Split Boundary: {splitSlider}%</span>
              <span className="font-semibold text-rose-400">Monitored 2024 Impact &rarr;</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={splitSlider}
              onChange={(e) => setSplitSlider(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        {/* Right Col: Spectral Band & STAC Details */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Active Spectral Formula</h3>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300">
              {SPECTRAL_INDICES.find((i) => i.name.toLowerCase().includes(bandMode.replace('_', ' ')))?.formula ||
                'RGB Composite (Red=B04, Green=B03, Blue=B02)'}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {SPECTRAL_INDICES.find((i) => i.name.toLowerCase().includes(bandMode.replace('_', ' ')))?.interpretation ||
                'Natural color simulation mimicking human vision.'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Target AOI Metadata</h3>
            <div className="text-xs space-y-2 text-slate-300">
              <div>
                <span className="text-slate-400 block">Coordinates:</span>
                <span className="font-mono text-cyan-400">{selectedLocation.coordinates}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Cloud Cover:</span>
                <span className="font-mono text-slate-200">{selectedLocation.cloudCover}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Baseline vs Degraded NDVI:</span>
                <span className="font-mono text-emerald-400">{selectedLocation.baselineNDVI}</span>
                <span className="mx-1 text-slate-500">&rarr;</span>
                <span className="font-mono text-rose-400">{selectedLocation.degradedNDVI}</span>
              </div>
              <p className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                {selectedLocation.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sentinel-2 Band Reference Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-white">
          Sentinel-2 MSI (Multispectral Instrument) Sensor Band Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 text-left">Band ID</th>
                <th className="py-2.5 px-3 text-left">Spectral Band Name</th>
                <th className="py-2.5 px-3 text-left">Central Wavelength</th>
                <th className="py-2.5 px-3 text-left">Spatial Resolution</th>
                <th className="py-2.5 px-3 text-left">Remote Sensing Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {SENTINEL2_BANDS.map((b) => (
                <tr key={b.id} className="hover:bg-slate-850">
                  <td className="py-2 px-3 font-bold text-cyan-400">{b.id}</td>
                  <td className="py-2 px-3 text-slate-200">{b.name}</td>
                  <td className="py-2 px-3 text-amber-300">{b.wavelength}</td>
                  <td className="py-2 px-3 text-emerald-300">{b.resolution}</td>
                  <td className="py-2 px-3 text-slate-300 font-sans">{b.useCase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
