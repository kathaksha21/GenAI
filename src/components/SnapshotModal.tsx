import React from 'react';
import { Download, X, Camera } from 'lucide-react';
import { EnvironmentState } from '../types/xenobiology';

interface SnapshotModalProps {
  dataUrl: string | null;
  environment: EnvironmentState;
  onClose: () => void;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  dataUrl,
  environment,
  onClose
}) => {
  if (!dataUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `biolume-specimen-plate-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0b0e17] border border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-100 font-mono">
              Terrarium Micrographic Plate
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded border border-slate-800 bg-black overflow-hidden shadow-inner">
            <img src={dataUrl} alt="Terrarium Snapshot" className="w-full h-auto block" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono p-3 bg-[#07090e] rounded border border-slate-800 text-slate-400">
            <div>
              <span className="text-slate-500 block text-[10px]">TEMPERATURE</span>
              <span className="text-slate-200">{environment.temperature.toFixed(1)} K</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SALINITY</span>
              <span className="text-slate-200">{environment.salinity.toFixed(1)} PSU</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">VISCOSITY</span>
              <span className="text-slate-200">{environment.viscosity.toFixed(2)} mPa·s</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-[#07090e] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-xs font-semibold font-mono text-[#07090e] bg-cyan-400 hover:bg-cyan-300 rounded transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download High-Res Plate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
