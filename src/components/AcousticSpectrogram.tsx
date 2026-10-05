import React, { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX, Music, Waves, Radio } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface AcousticSpectrogramProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export const AcousticSpectrogram: React.FC<AcousticSpectrogramProps> = ({
  isMuted,
  onToggleMute
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [volume, setVolume] = useState<number>(0.55);
  const [selectedCymaticFreq, setSelectedCymaticFreq] = useState<number>(432);

  // 60fps Audio FFT Visualizer Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const data = soundEngine.getFrequencyData();
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#07090e';
      ctx.fillRect(0, 0, width, height);

      // Subtle horizontal baseline grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height - 1);
      ctx.lineTo(width, height - 1);
      ctx.stroke();

      const barCount = 48;
      const barWidth = width / barCount;
      const step = Math.floor(data.length / barCount) || 1;

      for (let i = 0; i < barCount; i++) {
        const val = isMuted ? 0 : data[i * step] || 0;
        const normalized = val / 255;
        const barHeight = Math.max(2, normalized * (height - 10));

        // Color gradient from cyan to amber based on frequency intensity
        const hue = 185 + (i / barCount) * 75; // cyan to purple
        ctx.fillStyle = isMuted ? 'rgba(51, 65, 85, 0.3)' : `hsla(${hue}, 85%, 55%, ${0.3 + normalized * 0.7})`;
        
        ctx.fillRect(
          i * barWidth + 1,
          height - barHeight,
          barWidth - 2,
          barHeight
        );
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isMuted]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundEngine.setVolume(newVol);
  };

  const playCymaticTone = (freq: number) => {
    setSelectedCymaticFreq(freq);
    soundEngine.playTuningForkTone(freq, 1.2);
  };

  return (
    <div className="h-28 border-t border-slate-800 bg-[#0b0e17] px-4 py-2 flex items-center gap-6 shrink-0 z-10">
      {/* 1. Acoustic Resonance Controls */}
      <div className="w-56 shrink-0 flex flex-col justify-between h-full py-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            Bio-Acoustics
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {isMuted ? 'MUTED' : 'RESONATING'}
          </span>
        </div>

        {/* Volume Fader */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-mono text-slate-400 w-8 text-right tabular-nums">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Quick Cymatic Harmonic Presets */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="text-slate-500">CYMATIC:</span>
          {[288, 432, 528].map((f) => (
            <button
              key={f}
              onClick={() => playCymaticTone(f)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                selectedCymaticFreq === f
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}Hz
            </button>
          ))}
        </div>
      </div>

      {/* 2. Real-Time Audio Waterfall / FFT Spectrogram Canvas */}
      <div className="flex-1 h-full flex flex-col justify-between py-1 min-w-0">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>HARMONIC SPECTRUM (FFT 256)</span>
          <div className="flex gap-4">
            <span>55Hz</span>
            <span>110Hz</span>
            <span>432Hz</span>
            <span>1.2kHz</span>
            <span>3.5kHz</span>
          </div>
        </div>

        <div className="w-full h-12 rounded overflow-hidden border border-slate-800/90 bg-[#07090e]">
          <canvas
            ref={canvasRef}
            width={600}
            height={48}
            className="w-full h-full block"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>ABYSSAL DRONE (55Hz / 110Hz LFO FILTERED)</span>
          <span className="text-cyan-500/80">RESONANCE PEAK: {selectedCymaticFreq} Hz</span>
        </div>
      </div>
    </div>
  );
};
