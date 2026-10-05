import React, { useState, useEffect, useRef } from 'react';
import { Dna, Play, Sparkles, Sliders, Volume2, Check } from 'lucide-react';
import { SpecimenProfile, DietType, BehavioralMode, SymmetryType } from '../types/xenobiology';
import { soundEngine } from '../services/soundEngine';

interface XenogenesisSequencerProps {
  initialProfile?: SpecimenProfile | null;
  onSynthesize: (profile: SpecimenProfile) => void;
  onClose?: () => void;
}

export const XenogenesisSequencer: React.FC<XenogenesisSequencerProps> = ({
  initialProfile,
  onSynthesize,
  onClose
}) => {
  const [name, setName] = useState<string>(initialProfile?.name || 'Vespera Ctenophora');
  const [latinName, setLatinName] = useState<string>(initialProfile?.latinName || 'Vespera synaptica');
  const [family, setFamily] = useState<string>(initialProfile?.family || 'Vesperulidae');
  const [description, setDescription] = useState<string>(
    initialProfile?.description || 'A synthetic organism developed through recombinant xenogenetic sequencing. Uses rhythmic cilia to harvest ambient electromagnetic radiation.'
  );
  const [diet, setDiet] = useState<DietType>(initialProfile?.diet || 'photonic');
  const [wavelength, setWavelength] = useState<number>(initialProfile?.wavelength || 485);
  const [flagellaCount, setFlagellaCount] = useState<number>(initialProfile?.flagellaCount || 8);
  const [membraneRadius, setMembraneRadius] = useState<number>(initialProfile?.membraneRadius || 26);
  const [pulsationRate, setPulsationRate] = useState<number>(initialProfile?.pulsationRate || 1.2);
  const [behavioralMode, setBehavioralMode] = useState<BehavioralMode>(initialProfile?.behavioralMode || 'harmonic_resonance');
  const [symmetry, setSymmetry] = useState<SymmetryType>(initialProfile?.symmetry || 'radial_8');
  const [rootFrequency, setRootFrequency] = useState<number>(initialProfile?.rootFrequency || 432);

  // Compute color based on wavelength (nm)
  const computeColorsFromWavelength = (nm: number) => {
    if (nm < 420) return { primary: '#8b5cf6', core: '#c4b5fd' }; // Violet
    if (nm < 470) return { primary: '#3b82f6', core: '#93c5fd' }; // Blue
    if (nm < 510) return { primary: '#06b6d4', core: '#67e8f9' }; // Cyan
    if (nm < 560) return { primary: '#10b981', core: '#6ee7b7' }; // Green
    if (nm < 610) return { primary: '#f59e0b', core: '#fde68a' }; // Amber
    return { primary: '#f43f5e', core: '#fda4af' }; // Crimson
  };

  const { primary: primaryColor, core: coreColor } = computeColorsFromWavelength(wavelength);

  // Live Microscope Canvas Preview
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      phase += 0.04 * pulsationRate;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = '#07090e';
      ctx.fillRect(0, 0, w, h);

      // Microscopic circular reticle
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 120, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - 130, cy);
      ctx.lineTo(cx + 130, cy);
      ctx.moveTo(cx, cy - 130);
      ctx.lineTo(cx, cy + 130);
      ctx.stroke();

      const pulseScale = 1 + Math.sin(phase) * 0.1;
      const rad = membraneRadius * 1.5 * pulseScale;

      ctx.save();
      ctx.translate(cx, cy);

      // Draw Flagella
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.6;

      for (let f = 0; f < flagellaCount; f++) {
        const baseAngle = (f / flagellaCount) * Math.PI * 2;
        const len = rad * 1.5;
        const startX = Math.cos(baseAngle) * (rad * 0.9);
        const startY = Math.sin(baseAngle) * (rad * 0.9);

        const wave = Math.sin(phase * 2 + f) * 8;
        const midX = startX + Math.cos(baseAngle) * (len * 0.5) - Math.sin(baseAngle) * wave;
        const midY = startY + Math.sin(baseAngle) * (len * 0.5) + Math.cos(baseAngle) * wave;
        const endX = startX + Math.cos(baseAngle) * len;
        const endY = startY + Math.sin(baseAngle) * len;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(midX, midY, endX, endY);
        ctx.stroke();

        ctx.fillStyle = coreColor;
        ctx.fillRect(endX - 1.5, endY - 1.5, 3, 3);
      }

      // Outer Glow Gradient
      const grad = ctx.createRadialGradient(0, 0, rad * 0.2, 0, 0, rad * 1.4);
      grad.addColorStop(0, coreColor);
      grad.addColorStop(0.5, primaryColor);
      grad.addColorStop(0.85, 'rgba(6, 182, 212, 0.15)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();

      const sides = symmetry === 'radial_8' ? 8 : symmetry === 'radial_5' ? 5 : symmetry === 'radial_3' ? 3 : 6;
      for (let s = 0; s < sides; s++) {
        const a = (s / sides) * Math.PI * 2;
        const rVar = rad * (1 + Math.sin(phase + s) * 0.06);
        const px = Math.cos(a) * rVar;
        const py = Math.sin(a) * rVar;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Nucleus
      ctx.fillStyle = coreColor;
      ctx.shadowColor = coreColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, rad * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Organelles
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(rad * 0.1, -rad * 0.1, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [membraneRadius, pulsationRate, flagellaCount, symmetry, primaryColor, coreColor]);

  const handleAuditionTone = () => {
    soundEngine.init();
    soundEngine.playOrganismPulse(rootFrequency);
  };

  const handleCommitSynthesis = () => {
    const newSpecimen: SpecimenProfile = {
      id: `specimen-synth-${Date.now()}`,
      name,
      latinName,
      family,
      description,
      diet,
      wavelength,
      primaryColor,
      coreColor,
      flagellaCount,
      membraneRadius,
      pulsationRate,
      behavioralMode,
      symmetry,
      rootFrequency,
      speculativeEcology: `Cultivated in vitro at ${rootFrequency}Hz acoustic resonance. Adapts readily to aqueous microclimates.`,
      isCustom: true
    };

    soundEngine.playBioPulseWave();
    onSynthesize(newSpecimen);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-[#07090e] overflow-y-auto">
      {/* Left Column: Live Microscopy Visualizer */}
      <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 bg-[#07090e]/60">
        <div className="w-full max-w-sm flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
              MAGNIFICATION 1200X
            </span>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            {wavelength} nm
          </span>
        </div>

        <div className="relative w-72 h-72 rounded-full border border-slate-700/80 p-2 shadow-inner bg-[#0b0e17] overflow-hidden flex items-center justify-center">
          <canvas
            ref={previewCanvasRef}
            width={288}
            height={288}
            className="w-full h-full block rounded-full"
          />
        </div>

        <div className="mt-5 w-full max-w-sm flex items-center justify-between text-xs font-mono text-slate-400">
          <span>RESONANCE: <strong className="text-amber-400">{rootFrequency} Hz</strong></span>
          <button
            onClick={handleAuditionTone}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded flex items-center gap-1.5 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Audition Sound</span>
          </button>
        </div>
      </div>

      {/* Right Column: Gene Sequencing & Parameter Controls */}
      <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-[#0b0e17]">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Dna className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg font-bold text-slate-100 font-display">
                Xenogenesis Chamber
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Synthesize novel morphology, membrane kinetics, and photophore luminescence parameters.
            </p>
          </div>

          {/* Species Naming */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">COMMON NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">TAXONOMIC BINOMIAL</label>
              <input
                type="text"
                value={latinName}
                onChange={(e) => setLatinName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded text-slate-200 italic focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Morphological Symmetry */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-2">STRUCTURAL SYMMETRY</label>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono">
              {(['radial_8', 'radial_5', 'radial_3', 'spiral'] as SymmetryType[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSymmetry(s)}
                  className={`py-1.5 px-2 rounded border text-center transition-colors ${
                    symmetry === s
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Wavelength Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">BIOLUMINESCENT WAVELENGTH</span>
              <span className="text-cyan-400 tabular-nums">{wavelength} nm</span>
            </div>
            <input
              type="range"
              min="400"
              max="660"
              step="5"
              value={wavelength}
              onChange={(e) => setWavelength(parseInt(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Membrane Radius & Flagella Count */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">RADIUS</span>
                <span className="text-slate-200 tabular-nums">{membraneRadius} μm</span>
              </div>
              <input
                type="range"
                min="16"
                max="36"
                value={membraneRadius}
                onChange={(e) => setMembraneRadius(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">CILIA / FLAGELLA</span>
                <span className="text-slate-200 tabular-nums">{flagellaCount}</span>
              </div>
              <input
                type="range"
                min="2"
                max="14"
                value={flagellaCount}
                onChange={(e) => setFlagellaCount(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Pulsation Rate & Root Acoustic Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">PULSE RATE</span>
                <span className="text-slate-200 tabular-nums">{pulsationRate.toFixed(2)} Hz</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={pulsationRate}
                onChange={(e) => setPulsationRate(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">ACOUSTIC FREQ</span>
                <span className="text-amber-400 tabular-nums">{rootFrequency} Hz</span>
              </div>
              <input
                type="range"
                min="120"
                max="720"
                step="6"
                value={rootFrequency}
                onChange={(e) => setRootFrequency(parseInt(e.target.value))}
                className="w-full accent-amber-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Metabolism */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-2">METABOLIC PATHWAY</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {(['photonic', 'chemosynthetic', 'radiotrophic', 'piezoelectric'] as DietType[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDiet(d)}
                  className={`py-1.5 px-2 rounded border text-center capitalize transition-colors ${
                    diet === d
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-end gap-3 mt-6">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleCommitSynthesis}
            className="px-5 py-2.5 text-xs font-semibold font-mono text-[#07090e] bg-cyan-400 hover:bg-cyan-300 rounded transition-all shadow-md shadow-cyan-950 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>SYNTHESIZE & INOCULATE TERRARIUM</span>
          </button>
        </div>
      </div>
    </div>
  );
};
