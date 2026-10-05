import React, { useState } from 'react';
import { Compass, Sparkles, Loader2, ArrowRight, X, AlertCircle } from 'lucide-react';
import { SpecimenProfile } from '../types/xenobiology';
import { requestSpecimenSynthesis } from '../services/geminiService';
import { soundEngine } from '../services/soundEngine';

interface DeepResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpecimenDiscovered: (specimen: SpecimenProfile) => void;
}

export const DeepResearchModal: React.FC<DeepResearchModalProps> = ({
  isOpen,
  onClose,
  onSpecimenDiscovered
}) => {
  const [selectedBiome, setSelectedBiome] = useState<string>('Europa Hydrothermal Rift');
  const [customPrompt, setCustomPrompt] = useState<string>('Bioluminescent siphonophore with crystalline piezoelectric cilia');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [discoveredSpecimen, setDiscoveredSpecimen] = useState<SpecimenProfile | null>(null);

  if (!isOpen) return null;

  const biomes = [
    'Europa Hydrothermal Rift',
    'Enceladus Cryo-Plume Sea',
    'Titan Methane Lacustrine Matrix',
    'Proxima Centauri B Abyssal Trench',
  ];

  const handleLaunch = async () => {
    setIsSynthesizing(true);
    setDiscoveredSpecimen(null);
    soundEngine.init();

    try {
      const specimen = await requestSpecimenSynthesis(customPrompt, selectedBiome);
      setDiscoveredSpecimen(specimen);
      soundEngine.playBioPulseWave();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleInoculate = () => {
    if (discoveredSpecimen) {
      onSpecimenDiscovered(discoveredSpecimen);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#0b0e17] border border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-100 font-mono">
              Deep Xenology Expedition
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!discoveredSpecimen ? (
            <>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-2 uppercase">
                  Target Oceanographic Biome
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {biomes.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBiome(b)}
                      className={`p-2.5 rounded text-left text-xs font-medium border transition-colors ${
                        selectedBiome === b
                          ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-2 uppercase">
                  Field Acoustic & Sensor Directive
                </label>
                <textarea
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Specify physiological traits, photophore wavelength, or swimming kinematics..."
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 resize-none font-sans"
                />
              </div>

              <div className="p-3 bg-[#07090e] rounded border border-slate-800/80 text-xs text-slate-400 space-y-1 font-mono">
                <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Expedition Protocol</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  The deep sounding probe analyzes hydrothermal radiation flux and acoustic harmonics to reconstruct speculative extraterrestrial morphology.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-cyan-950/20 border border-cyan-800/60 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase">
                    Specimen Discovered
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {discoveredSpecimen.wavelength} nm
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 font-display">
                  {discoveredSpecimen.name}
                </h3>
                <p className="text-xs text-cyan-400 italic font-mono mb-3">
                  {discoveredSpecimen.latinName}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {discoveredSpecimen.description}
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-2 border-t border-cyan-900/60">
                  <div className="bg-[#07090e] p-2 rounded">
                    <span className="text-slate-500 block text-[10px]">METABOLISM</span>
                    <span className="text-slate-200 capitalize">{discoveredSpecimen.diet}</span>
                  </div>
                  <div className="bg-[#07090e] p-2 rounded">
                    <span className="text-slate-500 block text-[10px]">FREQUENCY</span>
                    <span className="text-amber-400">{discoveredSpecimen.rootFrequency} Hz</span>
                  </div>
                  <div className="bg-[#07090e] p-2 rounded">
                    <span className="text-slate-500 block text-[10px]">CILIA COUNT</span>
                    <span className="text-slate-200">{discoveredSpecimen.flagellaCount}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-400">
                <strong className="text-slate-300">HABITAT:</strong> {discoveredSpecimen.speculativeEcology}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#07090e] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            Close
          </button>

          {!discoveredSpecimen ? (
            <button
              onClick={handleLaunch}
              disabled={isSynthesizing}
              className="px-4 py-2 text-xs font-semibold font-mono text-[#07090e] bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-700 disabled:text-slate-400 rounded transition-colors flex items-center gap-2 shadow-sm"
            >
              {isSynthesizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Probing Ocean Depths...</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5" />
                  <span>Dispatch Probe</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleInoculate}
              className="px-4 py-2 text-xs font-semibold font-mono text-[#07090e] bg-cyan-400 hover:bg-cyan-300 rounded transition-colors flex items-center gap-2 shadow-sm"
            >
              <span>Inoculate Terrarium</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
