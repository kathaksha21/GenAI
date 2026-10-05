import React, { useState, useCallback } from 'react';
import { TopNav } from './components/TopNav';
import { LabConsole } from './components/LabConsole';
import { TerrariumCanvas } from './components/TerrariumCanvas';
import { AcousticSpectrogram } from './components/AcousticSpectrogram';
import { XenogenesisSequencer } from './components/XenogenesisSequencer';
import { SpecimenCodex } from './components/SpecimenCodex';
import { DeepResearchModal } from './components/DeepResearchModal';
import { SnapshotModal } from './components/SnapshotModal';
import { INITIAL_SPECIMENS } from './data/defaultSpecimens';
import { 
  SpecimenProfile, 
  LaboratoryTool, 
  EnvironmentState, 
  LiveOrganism 
} from './types/xenobiology';
import { soundEngine } from './services/soundEngine';

const DEFAULT_ENVIRONMENT: EnvironmentState = {
  viscosity: 1.25,
  temperature: 278.2, // 5.0 °C
  salinity: 35.5,
  uvRadiation: 0.85,
  magneticFlux: 0.95,
  osmoticPressure: 2.4,
};

export default function App() {
  const [activeView, setActiveView] = useState<'terrarium' | 'sequencer' | 'expedition' | 'codex'>('terrarium');
  const [specimens, setSpecimens] = useState<SpecimenProfile[]>(INITIAL_SPECIMENS);
  const [activeTool, setActiveTool] = useState<LaboratoryTool>('inspect');
  const [environment, setEnvironment] = useState<EnvironmentState>(DEFAULT_ENVIRONMENT);
  const [inspectedOrganism, setInspectedOrganism] = useState<LiveOrganism | null>(null);
  const [sequencerProfile, setSequencerProfile] = useState<SpecimenProfile | null>(null);
  const [isExpeditionOpen, setIsExpeditionOpen] = useState<boolean>(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleMute = useCallback(() => {
    soundEngine.init();
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleSelectOrganism = useCallback((org: LiveOrganism | null) => {
    setInspectedOrganism(org);
  }, []);

  const handleExtractGenome = useCallback((profile: SpecimenProfile) => {
    setSequencerProfile(profile);
    setActiveView('sequencer');
    showNotification(`Extracted genome of ${profile.name} into Sequencer.`);
  }, []);

  const handleCloneOrganism = useCallback((profile: SpecimenProfile) => {
    soundEngine.playOrganismPulse(profile.rootFrequency);
    showNotification(`Cloned specimen of ${profile.name}.`);
  }, []);

  const handleOpenSequencerWithProfile = useCallback((profile: SpecimenProfile) => {
    setSequencerProfile(profile);
    setActiveView('sequencer');
  }, []);

  const handleSynthesizeSpecimen = useCallback((newSpecimen: SpecimenProfile) => {
    setSpecimens((prev) => [newSpecimen, ...prev]);
    setActiveView('terrarium');
    showNotification(`Synthesized and inoculated ${newSpecimen.name} into the terrarium!`);
  }, []);

  const handleSpecimenDiscovered = useCallback((specimen: SpecimenProfile) => {
    setSpecimens((prev) => [specimen, ...prev]);
    setActiveView('terrarium');
    showNotification(`Deep expedition recovered: ${specimen.name}`);
  }, []);

  const handleResetEnvironment = useCallback(() => {
    setEnvironment(DEFAULT_ENVIRONMENT);
    showNotification('Aqueous parameters recalibrated to Europa baseline.');
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07090e] text-slate-100 overflow-hidden font-sans">
      {/* Top Bar Contract (1 Row, 3 Zones) */}
      <TopNav
        activeView={activeView}
        setActiveView={(v) => {
          if (v === 'expedition') {
            setIsExpeditionOpen(true);
          } else {
            setActiveView(v);
          }
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenExpedition={() => setIsExpeditionOpen(true)}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeView === 'terrarium' && (
          <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
              {/* Left Asymmetric Control Console */}
              <LabConsole
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                environment={environment}
                setEnvironment={setEnvironment}
                inspectedOrganism={inspectedOrganism}
                onCloneOrganism={handleCloneOrganism}
                onOpenSequencerWithProfile={handleOpenSequencerWithProfile}
                onResetEnvironment={handleResetEnvironment}
              />

              {/* Main Fluid Terrarium Canvas Viewport */}
              <div className="flex-1 h-full relative overflow-hidden">
                <TerrariumCanvas
                  specimens={specimens}
                  activeTool={activeTool}
                  environment={environment}
                  inspectedOrganism={inspectedOrganism}
                  onSelectOrganism={handleSelectOrganism}
                  onExtractGenome={handleExtractGenome}
                  onSnapshotReady={(url) => setSnapshotUrl(url)}
                />
              </div>
            </div>

            {/* Bottom Real-Time Acoustic Spectrogram */}
            <AcousticSpectrogram
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
            />
          </div>
        )}

        {activeView === 'sequencer' && (
          <XenogenesisSequencer
            initialProfile={sequencerProfile}
            onSynthesize={handleSynthesizeSpecimen}
            onClose={() => setActiveView('terrarium')}
          />
        )}

        {activeView === 'codex' && (
          <SpecimenCodex
            specimens={specimens}
            onSpawnSpecimen={(profile) => {
              setActiveView('terrarium');
              showNotification(`Inoculated colony of ${profile.name}.`);
            }}
            onOpenSequencer={(profile) => {
              setSequencerProfile(profile);
              setActiveView('sequencer');
            }}
          />
        )}
      </main>

      {/* Deep Xenology Expedition Probe Modal */}
      <DeepResearchModal
        isOpen={isExpeditionOpen}
        onClose={() => setIsExpeditionOpen(false)}
        onSpecimenDiscovered={handleSpecimenDiscovered}
      />

      {/* Micrographic Snapshot Modal */}
      <SnapshotModal
        dataUrl={snapshotUrl}
        environment={environment}
        onClose={() => setSnapshotUrl(null)}
      />

      {/* Subtle Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-32 right-6 z-50 bg-[#0b0e17] border border-cyan-500/60 text-cyan-200 px-4 py-2.5 rounded shadow-lg text-xs font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
