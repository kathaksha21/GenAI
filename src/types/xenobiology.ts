export type DietType = 'chemosynthetic' | 'radiotrophic' | 'photonic' | 'piezoelectric';
export type BehavioralMode = 'flocking' | 'phototactic' | 'harmonic_resonance' | 'solitary_drifter' | 'apex_grazer';
export type SymmetryType = 'radial_3' | 'radial_5' | 'radial_8' | 'bilateral' | 'spiral';
export type LaboratoryTool = 'inspect' | 'feed' | 'current' | 'tuning_fork' | 'pulse' | 'extract_dna';

export interface SpecimenProfile {
  id: string;
  name: string;
  latinName: string;
  family: string;
  description: string;
  diet: DietType;
  wavelength: number; // in nm (e.g. 480nm)
  primaryColor: string;
  coreColor: string;
  flagellaCount: number;
  membraneRadius: number;
  pulsationRate: number;
  behavioralMode: BehavioralMode;
  symmetry: SymmetryType;
  rootFrequency: number; // in Hz (e.g. 261Hz)
  speculativeEcology: string;
  plateImage?: string;
  isCustom?: boolean;
}

export interface LiveOrganism {
  id: string;
  profileId: string;
  profile: SpecimenProfile;
  x: number;
  y: number;
  vx: number;
  vy: number;
  heading: number;
  energy: number;
  age: number;
  pulsePhase: number;
  flagellaPhase: number;
  tailHistory: Array<{ x: number; y: number; alpha: number }>;
}

export interface Nutrient {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'phosphor_nectar' | 'astral_brine' | 'cryo_salts' | 'piezo_dust';
  color: string;
  energy: number;
}

export interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  frequency?: number;
}

export interface EnvironmentState {
  viscosity: number; // 0.8 to 2.2
  temperature: number; // 270 - 320 K
  salinity: number; // 30 - 55 PSU
  uvRadiation: number; // 0.2 - 2.5
  magneticFlux: number; // 0.4 - 1.8 T
  osmoticPressure: number; // 1.2 - 3.8 MPa
}

export interface AudioSettings {
  muted: boolean;
  masterVolume: number;
  droneHarmonics: boolean;
  cymaticScale: 'just_intonation' | 'solfeggio' | 'pythagorean';
}
