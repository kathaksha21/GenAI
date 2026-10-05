import React, { useState } from 'react';
import { SpecimenProfile } from '../types/xenobiology';
import { soundEngine } from '../services/soundEngine';
import { Volume2, Plus, Dna, Info } from 'lucide-react';

interface SpecimenCodexProps {
  specimens: SpecimenProfile[];
  onSpawnSpecimen: (profile: SpecimenProfile) => void;
  onOpenSequencer: (profile: SpecimenProfile) => void;
}

export const SpecimenCodex: React.FC<SpecimenCodexProps> = ({
  specimens,
  onSpawnSpecimen,
  onOpenSequencer
}) => {
  const [selectedId, setSelectedId] = useState<string>(specimens[0]?.id || '');
  const activeSpecimen = specimens.find((s) => s.id === selectedId) || specimens[0];

  const handleAudition = (freq: number) => {
    soundEngine.init();
    soundEngine.playOrganismPulse(freq);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-[#07090e] overflow-hidden">
      {/* Specimen Index List (Left Column) */}
      <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-800 bg-[#0b0e17] flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 font-display">
            Xenobiological Codex
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Archived taxonomic plates and physical specimens
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {specimens.map((specimen) => {
            const isSelected = specimen.id === activeSpecimen?.id;
            return (
              <button
                key={specimen.id}
                onClick={() => setSelectedId(specimen.id)}
                className={`w-full text-left p-3.5 transition-colors flex items-center gap-3 ${
                  isSelected
                    ? 'bg-cyan-950/30 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                {/* Visual Thumbnail */}
                <div className="w-12 h-12 rounded border border-slate-800 bg-[#07090e] overflow-hidden shrink-0 flex items-center justify-center relative">
                  {specimen.plateImage ? (
                    <img
                      src={specimen.plateImage}
                      alt={specimen.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: specimen.primaryColor }}
                    />
                  )}
                  {specimen.isCustom && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-tl bg-cyan-400"></span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xs font-semibold truncate ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                      {specimen.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                      {specimen.wavelength}nm
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic truncate">
                    {specimen.latinName}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    <span className="capitalize">{specimen.diet}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{specimen.rootFrequency}Hz</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Specimen Deep Plate Inspection (Right Column) */}
      {activeSpecimen && (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col justify-between bg-[#07090e]">
          <div className="max-w-3xl space-y-6">
            {/* Header & Binomial nomenclature */}
            <div className="border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mb-2">
                <span>FAMILY: {activeSpecimen.family}</span>
                <span aria-hidden="true">·</span>
                <span>METABOLISM: {activeSpecimen.diet.toUpperCase()}</span>
                <span aria-hidden="true">·</span>
                <span className="text-cyan-400">STATUS: CULTIVATED</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-100 font-display">
                {activeSpecimen.name}
              </h1>
              <p className="text-sm text-cyan-400 italic font-mono mt-1">
                {activeSpecimen.latinName}
              </p>
            </div>

            {/* Scientific Specimen Plate Image & Morphology Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Illustration Plate */}
              <div className="rounded-lg border border-slate-800 bg-[#0b0e17] overflow-hidden p-2 shadow-lg">
                <div className="w-full aspect-4/3 rounded overflow-hidden bg-black flex items-center justify-center relative">
                  {activeSpecimen.plateImage ? (
                    <img
                      src={activeSpecimen.plateImage}
                      alt={activeSpecimen.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500">
                      <div
                        className="w-16 h-16 rounded-full blur-md mb-2"
                        style={{ backgroundColor: activeSpecimen.primaryColor }}
                      />
                      <span className="text-xs font-mono">SYNTHETIC IN-VITRO SPECIMEN</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono text-slate-300 border border-white/10">
                    PLATE REF: #{activeSpecimen.id.slice(-6).toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Morphology Data Table */}
              <div className="space-y-4">
                <div className="bg-[#0b0e17] p-4 rounded-lg border border-slate-800 space-y-3">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Morphological Indices
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="border-l-2 border-cyan-500 pl-2">
                      <span className="text-slate-500 block text-[10px]">PEAK WAVELENGTH</span>
                      <span className="text-slate-200 font-semibold">{activeSpecimen.wavelength} nm</span>
                    </div>
                    <div className="border-l-2 border-amber-500 pl-2">
                      <span className="text-slate-500 block text-[10px]">ACOUSTIC PITCH</span>
                      <span className="text-slate-200 font-semibold">{activeSpecimen.rootFrequency} Hz</span>
                    </div>
                    <div className="border-l-2 border-emerald-500 pl-2">
                      <span className="text-slate-500 block text-[10px]">MEMBRANE RADIUS</span>
                      <span className="text-slate-200 font-semibold">{activeSpecimen.membraneRadius} μm</span>
                    </div>
                    <div className="border-l-2 border-violet-500 pl-2">
                      <span className="text-slate-500 block text-[10px]">CILIA COUNT</span>
                      <span className="text-slate-200 font-semibold">{activeSpecimen.flagellaCount}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0b0e17] p-4 rounded-lg border border-slate-800">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Behavioral Directive
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed capitalize">
                    {activeSpecimen.behavioralMode.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Description & Ecological Notes */}
            <div className="space-y-3 bg-[#0b0e17] p-5 rounded-lg border border-slate-800">
              <h3 className="text-xs font-mono uppercase text-cyan-400 tracking-wider">
                Physiological & Ecological Analysis
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {activeSpecimen.description}
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                <strong className="text-slate-300 font-mono">HABITAT NICHE:</strong> {activeSpecimen.speculativeEcology}
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 mt-8">
            <button
              onClick={() => handleAudition(activeSpecimen.rootFrequency)}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-xs font-mono flex items-center gap-2 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Audition Pulse ({activeSpecimen.rootFrequency} Hz)</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenSequencer(activeSpecimen)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono flex items-center gap-2 transition-colors"
              >
                <Dna className="w-3.5 h-3.5 text-cyan-400" />
                <span>Open in Sequencer</span>
              </button>
              <button
                onClick={() => onSpawnSpecimen(activeSpecimen)}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-[#07090e] rounded text-xs font-semibold font-mono flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inoculate Terrarium</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
