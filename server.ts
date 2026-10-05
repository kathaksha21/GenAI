import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Server-side Gemini API endpoint
app.post('/api/generate-specimen', async (req, res) => {
  try {
    const { prompt, biome } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return procedural fallback data if no API key is configured
      return res.json({
        success: true,
        isFallback: true,
        specimen: generateProceduralSpecimen(prompt, biome)
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `You are a xenobiologist cataloging newly discovered extraterrestrial aquatic and aetheric organisms.
Respond ONLY with a valid JSON object (no markdown code blocks, no backticks, pure JSON) with the following structure:
{
  "name": "Common Name",
  "latinName": "Latin Genus species",
  "family": "Family Name",
  "description": "2-3 sentences of evocative scientific description detailing morphology and luminescence.",
  "diet": "chemosynthetic" | "radiotrophic" | "photonic" | "piezoelectric",
  "wavelength": number (400 to 680),
  "primaryColor": "hex color string like #06b6d4",
  "coreColor": "hex color string like #38bdf8",
  "flagellaCount": number (3 to 12),
  "membraneRadius": number (18 to 36),
  "pulsationRate": number (0.6 to 2.2),
  "behavioralMode": "flocking" | "phototactic" | "harmonic_resonance" | "solitary_drifter" | "apex_grazer",
  "rootFrequency": number (120 to 600),
  "speculativeEcology": "Short note on native environment (pressure, depth, thermal vents, radiation)."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Design a speculative xenobiological organism discovered in: ${biome || 'Deep Abyssal Cryo-Ocean'}. Observation notes: ${prompt || 'Bioluminescent pulsating organism with crystalline sensory cilia.'}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const text = response.text?.trim() || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = generateProceduralSpecimen(prompt, biome);
    }

    res.json({ success: true, isFallback: false, specimen: data });
  } catch (error: any) {
    console.warn('Gemini API call failed, falling back to procedural synthesis:', error?.message);
    res.json({
      success: true,
      isFallback: true,
      specimen: generateProceduralSpecimen(req.body.prompt, req.body.biome)
    });
  }
});

function generateProceduralSpecimen(prompt = '', biome = 'Europa Hydrothermal Trench') {
  const prefixes = ['Vespera', 'Aethel', 'Cryo', 'Pyros', 'Chrono', 'Lumin', 'Nadir', 'Astral', 'Zephyr', 'Synapt'];
  const suffixes = ['ctenophora', 'radiata', 'mycelis', 'medusa', 'helix', 'polypus', 'drifter', 'ciliata'];
  const diets = ['chemosynthetic', 'radiotrophic', 'photonic', 'piezoelectric'];
  const behaviors = ['flocking', 'phototactic', 'harmonic_resonance', 'solitary_drifter', 'apex_grazer'];
  const palettes = [
    { p: '#06b6d4', c: '#67e8f9', w: 485 }, // Cyan
    { p: '#10b981', c: '#6ee7b7', w: 520 }, // Emerald
    { p: '#8b5cf6', c: '#c4b5fd', w: 420 }, // Violet
    { p: '#f59e0b', c: '#fde68a', w: 590 }, // Amber
    { p: '#ec4899', c: '#fbcfe8', w: 640 }, // Rose
    { p: '#3b82f6', c: '#93c5fd', w: 450 }, // Cobalt
  ];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const pal = palettes[Math.floor(Math.random() * palettes.length)];
  const diet = diets[Math.floor(Math.random() * diets.length)];
  const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];

  return {
    name: `${prefix} ${suffix.charAt(0).toUpperCase() + suffix.slice(1)}`,
    latinName: `${prefix}ia ${suffix}`,
    family: `${prefix}oidea`,
    description: `A speculative xenoplanktonic organism recovered from ${biome}. Exhibits high membrane elasticity and rhythmic photophore discharge triggered by fluid shear dynamics.`,
    diet,
    wavelength: pal.w,
    primaryColor: pal.p,
    coreColor: pal.c,
    flagellaCount: Math.floor(Math.random() * 6) + 4,
    membraneRadius: Math.floor(Math.random() * 12) + 20,
    pulsationRate: Number((Math.random() * 1.2 + 0.8).toFixed(2)),
    behavioralMode: behavior,
    rootFrequency: Math.floor(Math.random() * 300) + 180,
    speculativeEcology: `Survives under extreme barometric pressure in ${biome}, harnessing acoustic vibrations and thermal ion flux for motility.`
  };
}

// Dev & Production mounting
if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Biolume Observatory running on http://0.0.0.0:${PORT}`);
});
