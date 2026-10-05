import { SpecimenProfile } from '../types/xenobiology';

export async function requestSpecimenSynthesis(prompt: string, biome: string): Promise<SpecimenProfile> {
  try {
    const res = await fetch('/api/generate-specimen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, biome })
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    const s = data.specimen;

    return {
      id: `specimen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: s.name || 'Nova Hydromedusa',
      latinName: s.latinName || 'Hydromedusa novalis',
      family: s.family || 'Xenooidea',
      description: s.description || 'A luminous specimen with rhythmic fluid dynamics.',
      diet: s.diet || 'photonic',
      wavelength: Number(s.wavelength) || 490,
      primaryColor: s.primaryColor || '#06b6d4',
      coreColor: s.coreColor || '#67e8f9',
      flagellaCount: Number(s.flagellaCount) || 6,
      membraneRadius: Number(s.membraneRadius) || 24,
      pulsationRate: Number(s.pulsationRate) || 1.1,
      behavioralMode: s.behavioralMode || 'harmonic_resonance',
      symmetry: 'radial_8',
      rootFrequency: Number(s.rootFrequency) || 432,
      speculativeEcology: s.speculativeEcology || `Adapted to high hydrostatic pressure in ${biome}.`,
      isCustom: true
    };
  } catch (error) {
    console.warn('API request failed, generating client-side procedural specimen:', error);
    return generateClientProceduralSpecimen(prompt, biome);
  }
}

export function generateClientProceduralSpecimen(prompt: string, biome: string): SpecimenProfile {
  const titles = ['Abyssal Radiolaris', 'Cryo Aurelia', 'Aethel Siphonophore', 'Vespera Ctenophore', 'Prismatic Polyp'];
  const colors = [
    { p: '#06b6d4', c: '#67e8f9', w: 488 },
    { p: '#10b981', c: '#6ee7b7', w: 520 },
    { p: '#8b5cf6', c: '#c4b5fd', w: 415 },
    { p: '#f59e0b', c: '#fde68a', w: 590 },
    { p: '#ec4899', c: '#fbcfe8', w: 630 }
  ];
  const choice = colors[Math.floor(Math.random() * colors.length)];
  const name = titles[Math.floor(Math.random() * titles.length)];

  return {
    id: `specimen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: `${name} ${prompt ? `(${prompt.slice(0, 16)})` : ''}`.trim(),
    latinName: `${name.replace(' ', 'us ')} xenotica`,
    family: 'Extraterrestroidea',
    description: `Discovered during deep sounding in ${biome}. Demonstrates coordinated light pulsation and responsive swimming trajectories.`,
    diet: 'photonic',
    wavelength: choice.w,
    primaryColor: choice.p,
    coreColor: choice.c,
    flagellaCount: Math.floor(Math.random() * 5) + 5,
    membraneRadius: Math.floor(Math.random() * 10) + 20,
    pulsationRate: Number((Math.random() * 0.8 + 0.8).toFixed(2)),
    behavioralMode: 'harmonic_resonance',
    symmetry: 'radial_8',
    rootFrequency: Math.floor(Math.random() * 240) + 220,
    speculativeEcology: `Endemic to the ${biome} bathypelagic layer. Converts low-level chemosensory gradients into resonant cymatic propulsion.`,
    isCustom: true
  };
}
