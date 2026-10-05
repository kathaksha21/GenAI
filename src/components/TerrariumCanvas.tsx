import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LiveOrganism, Nutrient, Ripple, SpecimenProfile, LaboratoryTool, EnvironmentState } from '../types/xenobiology';
import { soundEngine } from '../services/soundEngine';

interface TerrariumCanvasProps {
  specimens: SpecimenProfile[];
  activeTool: LaboratoryTool;
  environment: EnvironmentState;
  inspectedOrganism: LiveOrganism | null;
  onSelectOrganism: (org: LiveOrganism | null) => void;
  onExtractGenome: (profile: SpecimenProfile) => void;
  onSnapshotReady?: (dataUrl: string) => void;
}

export const TerrariumCanvas: React.FC<TerrariumCanvasProps> = ({
  specimens,
  activeTool,
  environment,
  inspectedOrganism,
  onSelectOrganism,
  onExtractGenome,
  onSnapshotReady
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const organismsRef = useRef<LiveOrganism[]>([]);
  const nutrientsRef = useRef<Nutrient[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const mouseRef = useRef<{ x: number; y: number; isDown: boolean; vx: number; vy: number; lastX: number; lastY: number }>({
    x: 0,
    y: 0,
    isDown: false,
    vx: 0,
    vy: 0,
    lastX: 0,
    lastY: 0
  });

  const [fps, setFps] = useState<number>(60);
  const [organismCount, setOrganismCount] = useState<number>(0);
  const [activeNutrientsCount, setActiveNutrientsCount] = useState<number>(0);
  const [hoveredOrg, setHoveredOrg] = useState<LiveOrganism | null>(null);

  // Initialize organisms from specimen profiles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width || 900;
    const height = canvas.height || 600;

    // Spawn 1-3 organisms per specimen profile
    const initialOrgs: LiveOrganism[] = [];
    specimens.forEach((profile) => {
      const count = profile.isCustom ? 2 : 3;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.6 + Math.random() * 0.8;
        initialOrgs.push({
          id: `org-${profile.id}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          profileId: profile.id,
          profile,
          x: Math.random() * (width - 120) + 60,
          y: Math.random() * (height - 120) + 60,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          heading: angle,
          energy: 80 + Math.random() * 20,
          age: Math.random() * 500,
          pulsePhase: Math.random() * Math.PI * 2,
          flagellaPhase: Math.random() * Math.PI * 2,
          tailHistory: []
        });
      }
    });

    organismsRef.current = initialOrgs;
    setOrganismCount(initialOrgs.length);
  }, [specimens]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Spawn additional organism
  const spawnOrganismOfProfile = useCallback((profile: SpecimenProfile) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    const angle = Math.random() * Math.PI * 2;
    const newOrg: LiveOrganism = {
      id: `org-${profile.id}-${Date.now()}`,
      profileId: profile.id,
      profile,
      x: width / 2 + (Math.random() - 0.5) * 80,
      y: height / 2 + (Math.random() - 0.5) * 80,
      vx: Math.cos(angle) * 0.9,
      vy: Math.sin(angle) * 0.9,
      heading: angle,
      energy: 95,
      age: 0,
      pulsePhase: 0,
      flagellaPhase: 0,
      tailHistory: []
    };

    organismsRef.current.push(newOrg);
    setOrganismCount(organismsRef.current.length);

    // Visual ripple
    ripplesRef.current.push({
      x: newOrg.x,
      y: newOrg.y,
      radius: 5,
      maxRadius: 65,
      alpha: 0.9,
      color: profile.primaryColor
    });

    soundEngine.playOrganismPulse(profile.rootFrequency);
  }, []);

  // Tool Action execution on pointer down/drag
  const handlePointerAction = useCallback((x: number, y: number, isInitialClick: boolean) => {
    soundEngine.init();

    if (activeTool === 'inspect') {
      // Find closest organism within radius
      let closest: LiveOrganism | null = null;
      let minDist = 45;

      for (const org of organismsRef.current) {
        const dx = org.x - x;
        const dy = org.y - y;
        const dist = Math.hypot(dx, dy);
        if (dist < minDist) {
          closest = org;
          minDist = dist;
        }
      }

      onSelectOrganism(closest);
      if (closest && isInitialClick) {
        soundEngine.playOrganismPulse(closest.profile.rootFrequency);
      }
    } else if (activeTool === 'feed') {
      // Drop nutrient particles
      if (isInitialClick || Math.random() < 0.3) {
        const nutrientColors = ['#67e8f9', '#a7f3d0', '#fde68a', '#c4b5fd'];
        const types: Nutrient['type'][] = ['phosphor_nectar', 'astral_brine', 'cryo_salts', 'piezo_dust'];
        const chosenIdx = Math.floor(Math.random() * types.length);

        for (let i = 0; i < (isInitialClick ? 3 : 1); i++) {
          nutrientsRef.current.push({
            id: `nutr-${Date.now()}-${Math.random()}`,
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            type: types[chosenIdx],
            color: nutrientColors[chosenIdx],
            energy: 25 + Math.random() * 20
          });
        }
        setActiveNutrientsCount(nutrientsRef.current.length);
        if (isInitialClick) {
          soundEngine.playFeedingChime(660);
        }
      }
    } else if (activeTool === 'current') {
      // Generate fluid vortex
      const dx = mouseRef.current.vx;
      const dy = mouseRef.current.vy;
      const forceMag = Math.hypot(dx, dy);

      if (forceMag > 0.5) {
        ripplesRef.current.push({
          x,
          y,
          radius: 10,
          maxRadius: 40 + forceMag * 4,
          alpha: 0.5,
          color: '#38bdf8'
        });

        // Push nearby organisms
        organismsRef.current.forEach((org) => {
          const dist = Math.hypot(org.x - x, org.y - y);
          if (dist < 120) {
            const factor = (1 - dist / 120) * 0.8;
            org.vx += dx * factor * 0.2;
            org.vy += dy * factor * 0.2;
          }
        });
      }
    } else if (activeTool === 'tuning_fork') {
      // Create cymatic harmonic ripple & sound
      if (isInitialClick || Math.random() < 0.15) {
        const forkFreq = 432;
        ripplesRef.current.push({
          x,
          y,
          radius: 6,
          maxRadius: 160,
          alpha: 0.8,
          color: '#a855f7',
          frequency: forkFreq
        });
        soundEngine.playTuningForkTone(forkFreq, 0.7);

        // Attract organisms toward harmonic center
        organismsRef.current.forEach((org) => {
          const dist = Math.hypot(org.x - x, org.y - y);
          if (dist > 15) {
            const pull = 0.6 / (1 + dist * 0.02);
            org.vx += ((x - org.x) / dist) * pull;
            org.vy += ((y - org.y) / dist) * pull;
          }
        });
      }
    } else if (activeTool === 'pulse') {
      if (isInitialClick) {
        // Trigger electromagnetic photophore surge
        soundEngine.playBioPulseWave();
        ripplesRef.current.push({
          x,
          y,
          radius: 10,
          maxRadius: 380,
          alpha: 0.95,
          color: '#06b6d4'
        });

        organismsRef.current.forEach((org) => {
          org.pulsePhase = 0;
          org.energy = Math.min(100, org.energy + 15);
          // Scatter outwards briefly
          const angle = Math.atan2(org.y - y, org.x - x);
          org.vx += Math.cos(angle) * 1.8;
          org.vy += Math.sin(angle) * 1.8;
        });
      }
    } else if (activeTool === 'extract_dna') {
      if (isInitialClick) {
        let closest: LiveOrganism | null = null;
        let minDist = 50;

        for (const org of organismsRef.current) {
          const dist = Math.hypot(org.x - x, org.y - y);
          if (dist < minDist) {
            closest = org;
            minDist = dist;
          }
        }

        if (closest) {
          onExtractGenome(closest.profile);
          soundEngine.playFeedingChime(closest.profile.rootFrequency);
          ripplesRef.current.push({
            x: closest.x,
            y: closest.y,
            radius: 8,
            maxRadius: 55,
            alpha: 0.9,
            color: '#10b981'
          });
        }
      }
    }
  }, [activeTool, onSelectOrganism, onExtractGenome]);

  // Pointer events
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseRef.current.isDown = true;
    mouseRef.current.x = x;
    mouseRef.current.y = y;
    mouseRef.current.lastX = x;
    mouseRef.current.lastY = y;
    mouseRef.current.vx = 0;
    mouseRef.current.vy = 0;

    handlePointerAction(x, y, true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseRef.current.vx = x - mouseRef.current.lastX;
    mouseRef.current.vy = y - mouseRef.current.lastY;
    mouseRef.current.lastX = x;
    mouseRef.current.lastY = y;
    mouseRef.current.x = x;
    mouseRef.current.y = y;

    // Check hover for inspector tool
    let foundHover: LiveOrganism | null = null;
    for (const org of organismsRef.current) {
      if (Math.hypot(org.x - x, org.y - y) < org.profile.membraneRadius + 12) {
        foundHover = org;
        break;
      }
    }
    setHoveredOrg(foundHover);

    if (mouseRef.current.isDown) {
      handlePointerAction(x, y, false);
    }
  };

  const handlePointerUp = () => {
    mouseRef.current.isDown = false;
  };

  // Main 60fps simulation & rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      frameCount++;
      if (time - fpsTimer > 500) {
        setFps(Math.round((frameCount * 1000) / (time - fpsTimer)));
        frameCount = 0;
        fpsTimer = time;
      }

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep fluid background fade with subtle trail retention
      ctx.fillStyle = 'rgba(7, 9, 14, 0.45)';
      ctx.fillRect(0, 0, width, height);

      // Draw faint fluid grid coordinate lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.25)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // --- 1. UPDATE & DRAW RIPPLES ---
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rip = ripplesRef.current[i];
        rip.radius += 1.8;
        rip.alpha -= 0.018;

        if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = rip.color;
        ctx.globalAlpha = rip.alpha;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.stroke();

        if (rip.frequency) {
          // Secondary harmonic ring
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius * 0.65, 0, Math.PI * 2);
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        ctx.restore();
      }

      // --- 2. UPDATE & DRAW NUTRIENTS ---
      for (let i = nutrientsRef.current.length - 1; i >= 0; i--) {
        const nut = nutrientsRef.current[i];
        nut.x += nut.vx;
        nut.y += nut.vy;
        nut.vx *= 0.98;
        nut.vy *= 0.98;

        // Draw nutrient glow
        ctx.save();
        ctx.fillStyle = nut.color;
        ctx.shadowColor = nut.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(nut.x, nut.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Expire if depleted
        if (nut.energy <= 0) {
          nutrientsRef.current.splice(i, 1);
        }
      }

      // --- 3. UPDATE & DRAW ORGANISMS ---
      const organisms = organismsRef.current;
      const viscosityFactor = 1 / (environment.viscosity || 1);

      organisms.forEach((org, index) => {
        // Flocking / movement calculations
        let fx = 0;
        let fy = 0;

        // Separation from peers
        organisms.forEach((other, otherIdx) => {
          if (index === otherIdx) return;
          const dx = org.x - other.x;
          const dy = org.y - other.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < 50) {
            const repulse = (1 - dist / 50) * 0.6;
            fx += (dx / dist) * repulse;
            fy += (dy / dist) * repulse;
          }
        });

        // Attraction towards closest nutrient if hungry
        if (nutrientsRef.current.length > 0) {
          let closestNut: Nutrient | null = null;
          let minNutDist = 180;

          for (const nut of nutrientsRef.current) {
            const d = Math.hypot(org.x - nut.x, org.y - nut.y);
            if (d < minNutDist) {
              closestNut = nut;
              minNutDist = d;
            }
          }

          if (closestNut) {
            const nutTarget: Nutrient = closestNut;
            const d = minNutDist;
            const pull = 0.45;
            fx += ((nutTarget.x - org.x) / d) * pull;
            fy += ((nutTarget.y - org.y) / d) * pull;

            // Consume nutrient
            if (d < org.profile.membraneRadius + 5) {
              nutTarget.energy -= 10;
              org.energy = Math.min(100, org.energy + 12);
              soundEngine.playFeedingChime(org.profile.rootFrequency);
              ripplesRef.current.push({
                x: org.x,
                y: org.y,
                radius: 4,
                maxRadius: 28,
                alpha: 0.7,
                color: org.profile.primaryColor
              });
            }
          }
        }

        // Apply forces
        org.vx = (org.vx + fx * dt * 2) * (0.97 * viscosityFactor);
        org.vy = (org.vy + fy * dt * 2) * (0.97 * viscosityFactor);

        // Minimum gentle drift
        const speed = Math.hypot(org.vx, org.vy);
        if (speed < 0.25) {
          org.vx += (Math.random() - 0.5) * 0.15;
          org.vy += (Math.random() - 0.5) * 0.15;
        } else if (speed > 2.8) {
          org.vx = (org.vx / speed) * 2.8;
          org.vy = (org.vy / speed) * 2.8;
        }

        org.x += org.vx;
        org.y += org.vy;

        // Smooth heading towards velocity
        if (speed > 0.1) {
          const targetHeading = Math.atan2(org.vy, org.vx);
          let diff = targetHeading - org.heading;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          org.heading += diff * 0.1;
        }

        // Boundary bounce with soft padding
        const pad = org.profile.membraneRadius + 10;
        if (org.x < pad) { org.x = pad; org.vx *= -0.7; }
        if (org.x > width - pad) { org.x = width - pad; org.vx *= -0.7; }
        if (org.y < pad) { org.y = pad; org.vy *= -0.7; }
        if (org.y > height - pad) { org.y = height - pad; org.vy *= -0.7; }

        // Biological phases
        org.age += dt;
        org.pulsePhase += dt * org.profile.pulsationRate * 3.5;
        org.flagellaPhase += dt * (2 + speed * 3.5);

        // Record tail history for luminous trail
        if (frameCount % 3 === 0) {
          org.tailHistory.unshift({ x: org.x, y: org.y, alpha: 0.6 });
          if (org.tailHistory.length > 8) org.tailHistory.pop();
        }
        org.tailHistory.forEach((pt) => { pt.alpha *= 0.92; });

        // DRAW ORGANISM
        ctx.save();
        ctx.translate(org.x, org.y);
        ctx.rotate(org.heading);

        const pulseScale = 1 + Math.sin(org.pulsePhase) * 0.08;
        const rad = org.profile.membraneRadius * pulseScale;

        // 1. Draw Flagella / Undulating Cilia
        const flagellaCount = org.profile.flagellaCount;
        ctx.strokeStyle = org.profile.primaryColor;
        ctx.lineWidth = 1.2;

        for (let f = 0; f < flagellaCount; f++) {
          const baseAngle = Math.PI - 0.7 + (f / Math.max(1, flagellaCount - 1)) * 1.4;
          const tentacleLen = rad * 1.6;
          ctx.beginPath();
          const startX = Math.cos(baseAngle) * (rad * 0.85);
          const startY = Math.sin(baseAngle) * (rad * 0.85);
          ctx.moveTo(startX, startY);

          // 3-point waving spline
          const wave = Math.sin(org.flagellaPhase + f * 0.8) * 6;
          const midX = startX - tentacleLen * 0.5;
          const midY = startY + wave;
          const endX = startX - tentacleLen;
          const endY = startY + wave * 1.5;

          ctx.quadraticCurveTo(midX, midY, endX, endY);
          ctx.stroke();

          // Luminous tip spark
          ctx.fillStyle = org.profile.coreColor;
          ctx.fillRect(endX - 1, endY - 1, 2, 2);
        }

        // 2. Outer Luminescent Membrane Glow
        const grad = ctx.createRadialGradient(0, 0, rad * 0.2, 0, 0, rad * 1.3);
        grad.addColorStop(0, org.profile.coreColor);
        grad.addColorStop(0.4, org.profile.primaryColor);
        grad.addColorStop(0.85, 'rgba(6, 182, 212, 0.15)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();

        // Draw organic polygon contour based on symmetry
        const symmetrySides = org.profile.symmetry === 'radial_8' ? 8 : org.profile.symmetry === 'radial_5' ? 5 : 6;
        for (let s = 0; s < symmetrySides; s++) {
          const a = (s / symmetrySides) * Math.PI * 2;
          const rVar = rad * (1 + Math.sin(org.pulsePhase + s) * 0.05);
          const px = Math.cos(a) * rVar;
          const py = Math.sin(a) * rVar;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // 3. Delicate Cell Membrane Border
        ctx.strokeStyle = org.profile.primaryColor;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // 4. Inner Nucleus & Organelle Core
        ctx.fillStyle = org.profile.coreColor;
        ctx.shadowColor = org.profile.coreColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, rad * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Internal crystalline nodes
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(rad * 0.08, -rad * 0.08, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Draw Selection / Inspection Target Reticle if active
        const isSelected = inspectedOrganism?.id === org.id;
        const isHovered = hoveredOrg?.id === org.id;

        if (isSelected || isHovered) {
          ctx.save();
          ctx.strokeStyle = isSelected ? '#06b6d4' : 'rgba(100, 116, 139, 0.6)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);

          const boxSize = rad * 2.2;
          ctx.strokeRect(org.x - boxSize / 2, org.y - boxSize / 2, boxSize, boxSize);

          // Reticle corner marks
          ctx.setLineDash([]);
          ctx.strokeStyle = isSelected ? '#38bdf8' : '#94a3b8';
          const cornerLen = 6;
          const bx = org.x - boxSize / 2;
          const by = org.y - boxSize / 2;

          // Top-left
          ctx.beginPath();
          ctx.moveTo(bx, by + cornerLen);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx + cornerLen, by);
          ctx.stroke();

          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(bx + boxSize, by + boxSize - cornerLen);
          ctx.lineTo(bx + boxSize, by + boxSize);
          ctx.lineTo(bx + boxSize - cornerLen, by + boxSize);
          ctx.stroke();

          // Floating mini-tag
          ctx.fillStyle = 'rgba(11, 14, 23, 0.85)';
          ctx.fillRect(org.x + boxSize / 2 + 6, org.y - 10, 85, 20);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.strokeRect(org.x + boxSize / 2 + 6, org.y - 10, 85, 20);

          ctx.fillStyle = '#f1f5f9';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText(`${org.profile.name.slice(0, 10)}`, org.x + boxSize / 2 + 10, org.y + 4);

          ctx.restore();
        }
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [environment, inspectedOrganism, hoveredOrg]);

  // Expose snapshot handler
  const captureSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (onSnapshotReady) {
      onSnapshotReady(dataUrl);
    }
  }, [onSnapshotReady]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#07090e]">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-full h-full block ${
          activeTool === 'inspect'
            ? 'cursor-crosshair'
            : activeTool === 'feed'
            ? 'cursor-copy'
            : activeTool === 'current'
            ? 'cursor-grab active:cursor-grabbing'
            : activeTool === 'tuning_fork'
            ? 'cursor-pointer'
            : 'cursor-default'
        }`}
      />

      {/* Viewport Floating HUD - Scientific Metadata */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-1.5 bg-[#0b0e17]/85 backdrop-blur-md px-2.5 py-1 rounded border border-slate-800">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>TERRARIUM SIMULATION</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-200 tabular-nums">{fps} FPS</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-[#0b0e17]/85 backdrop-blur-md px-2.5 py-1 rounded border border-slate-800 text-xs">
          <span>POPULATION:</span>
          <span className="text-cyan-400 font-semibold tabular-nums">{organismsRef.current.length}</span>
          <span className="text-slate-600">·</span>
          <span>NUTRIENTS:</span>
          <span className="text-amber-400 font-semibold tabular-nums">{activeNutrientsCount}</span>
        </div>
      </div>

      {/* Floating Canvas Quick Actions */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <button
          onClick={captureSnapshot}
          className="px-2.5 py-1 text-xs font-mono bg-[#0b0e17]/90 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/50 rounded transition-colors flex items-center gap-1.5 shadow-sm"
          title="Capture Micrographic Plate"
        >
          <span>📸</span>
          <span className="hidden sm:inline">SNAPSHOT</span>
        </button>

        <button
          onClick={() => {
            if (specimens.length > 0) {
              const randomProf = specimens[Math.floor(Math.random() * specimens.length)];
              spawnOrganismOfProfile(randomProf);
            }
          }}
          className="px-2.5 py-1 text-xs font-mono bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 rounded transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span>+</span>
          <span>SPAWN SPECIMEN</span>
        </button>
      </div>

      {/* Active Tool Directive Ribbon */}
      <div className="absolute bottom-3 left-3 pointer-events-none text-xs text-slate-400 bg-[#0b0e17]/80 backdrop-blur-sm px-3 py-1 rounded border border-slate-800/80">
        {activeTool === 'inspect' && <span>CLICK ANY SPECIMEN TO ANALYZE BIOMETRICS</span>}
        {activeTool === 'feed' && <span>CLICK OR DRAG TO DISPERSE PHOSPHOR NUTRIENTS</span>}
        {activeTool === 'current' && <span>DRAG TO CREATE FLUID HYDRO-VORTICES</span>}
        {activeTool === 'tuning_fork' && <span>CLICK TO EMIT CYMATIC 432Hz HARMONIC RIPPLE</span>}
        {activeTool === 'pulse' && <span>CLICK TO TRIGGER SYNCHRONOUS BIO-PHOTOPHORE PULSE</span>}
        {activeTool === 'extract_dna' && <span>CLICK AN ORGANISM TO EXTRACT GENOME INTO SEQUENCER</span>}
      </div>
    </div>
  );
};
