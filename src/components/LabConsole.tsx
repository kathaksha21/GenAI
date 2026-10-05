import React from 'react';
import { 
  Crosshair, 
  Droplet, 
  Wind, 
  Radio, 
  Zap, 
  Dna, 
  Sliders, 
  Activity, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { LaboratoryTool, EnvironmentState, LiveOrganism, SpecimenProfile } from '../types/xenobiology';

interface LabConsoleProps {
  activeTool: LaboratoryTool;
  setActiveTool: (tool: LaboratoryTool) => void;
  environment: EnvironmentState;
  setEnvironment: React.Dispatch<React.SetStateAction<EnvironmentState>>;
  inspectedOrganism: LiveOrganism | null;
  onCloneOrganism: (profile: SpecimenProfile) => void;
  onOpenSequencerWithProfile: (profile: SpecimenProfile) => void;
  onResetEnvironment: () => void;
}

export const LabConsole: React.FC<LabConsoleProps> = ({
  activeTool,
  setActiveTool,
  environment,
  setEnvironment,
  inspectedOrganism,
  onCloneOrganism,
  onOpenSequencerWithProfile,
  onResetEnvironment
}) => {
  const tools: { id: LaboratoryTool; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'inspect', label: 'Biometric Probe', desc: 'Isolate & inspect cellular telemetry', icon: <Crosshair className="w-4 h-4" /> },
    { id: 'feed', label: 'Nutrient Dropper', desc: 'Disperse phosphor nectar & brine', icon: <Droplet className="w-4 h-4" /> },
    { id: 'current', label: 'Hydro Vortex', desc: 'Induce fluid vector shear currents', icon: <Wind className="w-4 h-4" /> },
    { id: 'tuning_fork', label: 'Cymatic Fork', desc: 'Emit 432Hz harmonic standing waves', icon: <Radio className="w-4 h-4" /> },
    { id: 'pulse', label: 'Photon Surge', desc: 'Trigger synchronous photophore wave', icon: <Zap className="w-4 h-4" /> },
    { id: 'extract_dna', label: 'Genome Extractor', desc: 'Extract genetic blueprint into Sequencer', icon: <Dna className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-80 md:w-88 border-r border-slate-800 bg-[#0b0e17] flex flex-col h-full shrink-0 overflow-y-auto">
      {/* Console Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-200 font-mono">
            Terrarium Controls
          </h2>
        </div>
        <button
          onClick={onResetEnvironment}
          className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 font-mono transition-colors"
          title="Reset environmental defaults"
        >
          <RotateCcw className="w-3 h-3" />
          <span>RESET</span>
        </button>
      </div>

      {/* 1. Laboratory Tool Matrix */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Interaction Tool
          </span>
          <span className="text-xs font-mono text-cyan-400 uppercase">
            {activeTool.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`p-2.5 rounded text-left transition-all border ${
                activeTool === t.id
                  ? 'bg-cyan-950/40 border-cyan-500/70 text-cyan-300 shadow-sm shadow-cyan-950/50'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={activeTool === t.id ? 'text-cyan-400' : 'text-slate-400'}>
                  {t.icon}
                </span>
                <span className="text-xs font-medium truncate">{t.label}</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Inspected Organism Live Biometrics */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${inspectedOrganism ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`}></span>
            Biometric Telemetry
          </span>
          {inspectedOrganism && (
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
              TRACKING
            </span>
          )}
        </div>

        {inspectedOrganism ? (
          <div className="space-y-3 bg-[#07090e] p-3 rounded border border-slate-800 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">{inspectedOrganism.profile.name}</h3>
                <p className="text-slate-400 italic text-[11px]">{inspectedOrganism.profile.latinName}</p>
              </div>
              <div
                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                style={{ backgroundColor: inspectedOrganism.profile.primaryColor }}
                title={`Wavelength: ${inspectedOrganism.profile.wavelength} nm`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800/60">
                <span className="text-slate-500 block">WAVELENGTH</span>
                <span className="text-cyan-400 font-semibold tabular-nums">{inspectedOrganism.profile.wavelength} nm</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800/60">
                <span className="text-slate-500 block">FREQUENCY</span>
                <span className="text-amber-400 font-semibold tabular-nums">{inspectedOrganism.profile.rootFrequency} Hz</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800/60">
                <span className="text-slate-500 block">METABOLISM</span>
                <span className="text-emerald-400 font-semibold capitalize">{inspectedOrganism.profile.diet}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800/60">
                <span className="text-slate-500 block">PULSE RATE</span>
                <span className="text-slate-200 font-semibold tabular-nums">{inspectedOrganism.profile.pulsationRate} Hz</span>
              </div>
            </div>

            {/* Energy Reserve Bar */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>CELLULAR ATP FLUX</span>
                <span className="text-slate-200 tabular-nums">{Math.round(inspectedOrganism.energy)}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, inspectedOrganism.energy)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onCloneOrganism(inspectedOrganism.profile)}
                className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-mono transition-colors text-center"
              >
                Duplicate
              </button>
              <button
                onClick={() => onOpenSequencerWithProfile(inspectedOrganism.profile)}
                className="flex-1 py-1.5 px-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 rounded text-[11px] font-mono transition-colors text-center"
              >
                Sequencer
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#07090e]/60 rounded border border-dashed border-slate-800 text-center text-xs text-slate-500">
            <p className="mb-1">No specimen selected.</p>
            <p className="text-[11px] text-slate-600">Activate Biometric Probe and click any swimming organism in the terrarium.</p>
          </div>
        )}
      </div>

      {/* 3. Environmental Parameters */}
      <div className="p-4 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Aqueous Medium
          </span>
          <span className="text-[11px] font-mono text-slate-500">EUROPA-04</span>
        </div>

        {/* Viscosity */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">FLUID VISCOSITY</span>
            <span className="text-cyan-400 tabular-nums">{environment.viscosity.toFixed(2)} mPa·s</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={environment.viscosity}
            onChange={(e) => setEnvironment((prev) => ({ ...prev, viscosity: parseFloat(e.target.value) }))}
            className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Temperature */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">TEMPERATURE</span>
            <span className="text-cyan-400 tabular-nums">{environment.temperature.toFixed(1)} K ({((environment.temperature - 273.15)).toFixed(1)} °C)</span>
          </div>
          <input
            type="range"
            min="260"
            max="330"
            step="0.5"
            value={environment.temperature}
            onChange={(e) => setEnvironment((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
            className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Salinity */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">SALINITY</span>
            <span className="text-cyan-400 tabular-nums">{environment.salinity.toFixed(1)} PSU</span>
          </div>
          <input
            type="range"
            min="15"
            max="70"
            step="1"
            value={environment.salinity}
            onChange={(e) => setEnvironment((prev) => ({ ...prev, salinity: parseFloat(e.target.value) }))}
            className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* UV Radiation */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">UV RADIATION</span>
            <span className="text-cyan-400 tabular-nums">{environment.uvRadiation.toFixed(2)} W/m²</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.1"
            value={environment.uvRadiation}
            onChange={(e) => setEnvironment((prev) => ({ ...prev, uvRadiation: parseFloat(e.target.value) }))}
            className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Osmotic Pressure */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">OSMOTIC PRESSURE</span>
            <span className="text-cyan-400 tabular-nums">{environment.osmoticPressure.toFixed(2)} MPa</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="4.5"
            step="0.1"
            value={environment.osmoticPressure}
            onChange={(e) => setEnvironment((prev) => ({ ...prev, osmoticPressure: parseFloat(e.target.value) }))}
            className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </aside>
  );
};
