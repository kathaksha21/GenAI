import React from 'react';
import { Volume2, VolumeX, Sparkles, Compass } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface TopNavProps {
  activeView: 'terrarium' | 'sequencer' | 'expedition' | 'codex';
  setActiveView: (view: 'terrarium' | 'sequencer' | 'expedition' | 'codex') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenExpedition: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeView,
  setActiveView,
  isMuted,
  onToggleMute,
  onOpenExpedition,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-[#07090e] px-4 md:px-6 flex items-center justify-between z-20 shrink-0">
      {/* Zone 1: Single text element wordmark */}
      <span className="text-xl font-bold tracking-tight text-slate-100 font-display">
        Biolume
      </span>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveView('terrarium')}
          className={`transition-colors whitespace-nowrap ${
            activeView === 'terrarium'
              ? 'text-cyan-400 border-b border-cyan-400 pb-0.5'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Terrarium
        </button>
        <button
          onClick={() => setActiveView('sequencer')}
          className={`transition-colors whitespace-nowrap ${
            activeView === 'sequencer'
              ? 'text-cyan-400 border-b border-cyan-400 pb-0.5'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sequencer
        </button>
        <button
          onClick={() => setActiveView('expedition')}
          className={`transition-colors whitespace-nowrap ${
            activeView === 'expedition'
              ? 'text-cyan-400 border-b border-cyan-400 pb-0.5'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Expedition
        </button>
        <button
          onClick={() => setActiveView('codex')}
          className={`transition-colors whitespace-nowrap ${
            activeView === 'codex'
              ? 'text-cyan-400 border-b border-cyan-400 pb-0.5'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Codex
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMute}
          className="p-2 text-slate-400 hover:text-slate-100 rounded-md border border-slate-800 hover:border-slate-700 bg-slate-900/60 transition-colors"
          title={isMuted ? 'Unmute Soundscape' : 'Mute Soundscape'}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        <button
          onClick={onOpenExpedition}
          className="px-3.5 py-1.5 text-xs font-semibold text-[#07090e] bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm shadow-cyan-950"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Launch Expedition</span>
        </button>
      </div>
    </header>
  );
};
