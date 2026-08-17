'use client';

import React, { useEffect, useRef } from 'react';
import { VoiceState } from './AudioOrb';

interface LiveFluidWaveProps {
  state: VoiceState;
  audioLevel?: number; // 0.0 to 1.0
  className?: string;
}

export function LiveFluidWave({ state, audioLevel = 0, className = '' }: LiveFluidWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const smoothedLevelRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Smooth audio level
      const targetLevel = state === 'speaking' || state === 'listening' ? audioLevel : 0;
      smoothedLevelRef.current += (targetLevel - smoothedLevelRef.current) * 0.12;
      const level = smoothedLevelRef.current;

      const isSpeaking = state === 'speaking';
      const isListening = state === 'listening';
      const isThinking = state === 'thinking';

      // Wave height / amplitude
      const baseAmp = isSpeaking
        ? 40 + level * 90
        : isListening
        ? 24 + level * 45
        : isThinking
        ? 28 + Math.sin(phase * 2.5) * 10
        : 18;

      const speed = isSpeaking ? 0.04 : isListening ? 0.025 : 0.02;

      // ─── 1. Deep Ambient Radial Glows (Diffused Cloud Shimmer) ───
      // Left/Center Cyan Glow
      const cyanGlow = ctx.createRadialGradient(
        w * 0.35,
        h * 0.75,
        10,
        w * 0.35,
        h * 0.75,
        w * 0.45
      );
      cyanGlow.addColorStop(0, `rgba(0, 180, 255, ${0.45 + level * 0.35})`);
      cyanGlow.addColorStop(0.5, `rgba(30, 100, 240, ${0.25 + level * 0.2})`);
      cyanGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = cyanGlow;
      ctx.fillRect(0, 0, w, h);

      // Right Purple/Magenta Glow
      const purpleGlow = ctx.createRadialGradient(
        w * 0.85,
        h * 0.7,
        10,
        w * 0.85,
        h * 0.7,
        w * 0.4
      );
      purpleGlow.addColorStop(0, `rgba(168, 85, 247, ${0.5 + level * 0.3})`);
      purpleGlow.addColorStop(0.6, `rgba(99, 102, 241, ${0.2 + level * 0.15})`);
      purpleGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = purpleGlow;
      ctx.fillRect(0, 0, w, h);

      // Center Bright Blue Peak Glow
      const bluePeak = ctx.createRadialGradient(
        w * 0.55,
        h * 0.72,
        0,
        w * 0.55,
        h * 0.72,
        w * 0.35
      );
      bluePeak.addColorStop(0, `rgba(56, 189, 248, ${0.6 + level * 0.4})`);
      bluePeak.addColorStop(0.7, 'transparent');
      ctx.fillStyle = bluePeak;
      ctx.fillRect(0, 0, w, h);

      // ─── 2. Multi-Layered Ethereal Sine / Harmonics Waves ───
      const waveLayers = [
        {
          // Base Deep Indigo / Blue Wave
          fill: () => {
            const g = ctx.createLinearGradient(0, h * 0.3, 0, h);
            g.addColorStop(0, 'rgba(30, 64, 175, 0.85)');
            g.addColorStop(0.4, 'rgba(37, 99, 235, 0.7)');
            g.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
            return g;
          },
          freq: 0.007,
          phaseOffset: 0,
          ampMult: 1.1,
          yOffset: 0.52,
        },
        {
          // Mid Vibrant Cyan & Blue Wave
          fill: () => {
            const g = ctx.createLinearGradient(0, h * 0.35, 0, h);
            g.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
            g.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)');
            g.addColorStop(1, 'rgba(15, 23, 42, 0)');
            return g;
          },
          freq: 0.0095,
          phaseOffset: 1.8,
          ampMult: 0.95,
          yOffset: 0.58,
        },
        {
          // Right Purple Accent Wave
          fill: () => {
            const g = ctx.createLinearGradient(0, h * 0.4, 0, h);
            g.addColorStop(0, 'rgba(192, 132, 252, 0.8)');
            g.addColorStop(0.4, 'rgba(147, 51, 234, 0.5)');
            g.addColorStop(1, 'rgba(15, 23, 42, 0)');
            return g;
          },
          freq: 0.012,
          phaseOffset: 3.5,
          ampMult: 0.8,
          yOffset: 0.62,
        },
      ];

      waveLayers.forEach((layer) => {
        ctx.beginPath();
        const startY = h * layer.yOffset;
        ctx.moveTo(0, h);
        ctx.lineTo(0, startY);

        for (let x = 0; x <= w; x += 3) {
          const sin1 = Math.sin(x * layer.freq + phase + layer.phaseOffset);
          const sin2 = Math.cos(x * layer.freq * 0.6 + phase * 0.7);
          const waveHeight = (sin1 * 0.65 + sin2 * 0.35) * baseAmp * layer.ampMult;

          // Spatial window: smooth bell curve across the width with peaks around 30% - 75%
          const normalizedX = x / w;
          const bell = Math.sin(normalizedX * Math.PI);
          const y = startY - waveHeight * (0.3 + bell * 0.9);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = layer.fill();
        ctx.fill();
      });

      // ─── 3. Top Ethereal Highlight Crest ───
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const sin1 = Math.sin(x * 0.0085 + phase + 1.2);
        const sin2 = Math.cos(x * 0.005 + phase * 0.8);
        const normalizedX = x / w;
        const bell = Math.sin(normalizedX * Math.PI);
        const y = h * 0.55 - (sin1 * 0.65 + sin2 * 0.35) * baseAmp * (0.3 + bell * 0.9);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(186, 230, 253, ${isSpeaking ? 0.75 : 0.45})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
      ctx.shadowBlur = 12;
      ctx.stroke();

      ctx.restore();

      phase += speed;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [state, audioLevel]);

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-[36px] sm:rounded-[48px] ${className}`}>
      {/* Deep Obsidian Gradient Surface */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#181A20] via-[#12141A] to-[#0A0C10] rounded-[36px] sm:rounded-[48px] border border-white/10 shadow-2xl" />

      {/* Dynamic Fluid Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
}
