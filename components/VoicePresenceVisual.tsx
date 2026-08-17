'use client';

import React, { useEffect, useRef } from 'react';
import { VoiceState } from './AudioOrb';

interface VoicePresenceVisualProps {
  state: VoiceState;
  audioLevel?: number; // 0.0 to 1.0 normalized real-time audio amplitude
  size?: number;
  className?: string;
}

export function VoicePresenceVisual({
  state,
  audioLevel = 0,
  size = 180,
  className = '',
}: VoicePresenceVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keep a smoothed audio level ref for natural fluid transitions
  const smoothedLevelRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      const cx = size / 2;
      const cy = size / 2;
      const baseRadius = size * 0.26; // ~47px radius for center badge

      // Smooth audio level with exponential moving average
      const targetLevel = state === 'speaking' || state === 'listening' ? audioLevel : 0;
      smoothedLevelRef.current += (targetLevel - smoothedLevelRef.current) * 0.2;
      const level = smoothedLevelRef.current;

      const isListening = state === 'listening';
      const isSpeaking = state === 'speaking';
      const isThinking = state === 'thinking';

      // Detect dark mode from document class
      const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
      
      const accentColor = isDark ? '34, 197, 94' : '22, 163, 74'; // Emerald green rgb
      const ringBaseColor = isDark ? '50, 50, 50' : '220, 220, 218';
      const centerBg = isDark ? '#171717' : '#FFFFFF';
      const centerBorder = isDark ? '#2E2E2E' : '#E5E5E3';
      const textPrimary = isDark ? '#F0F0F0' : '#111111';
      const textMuted = isDark ? '#888888' : '#737373';

      // ─── 1. Outermost Ambient Ring (Voice Signal Radius) ───
      const outerScale = isSpeaking
        ? 1 + level * 0.38 + Math.sin(phase * 3) * 0.02
        : isListening
        ? 1 + Math.sin(phase * 1.5) * 0.04 + level * 0.15
        : isThinking
        ? 1 + Math.sin(phase * 2) * 0.03
        : 1;

      const outerRadius = baseRadius * 1.75 * outerScale;

      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
      if (isSpeaking) {
        ctx.strokeStyle = `rgba(${accentColor}, ${Math.min(0.35, 0.1 + level * 0.35)})`;
        ctx.lineWidth = 1.2;
      } else if (isListening) {
        ctx.strokeStyle = `rgba(${accentColor}, 0.18)`;
        ctx.lineWidth = 1;
      } else if (isThinking) {
        ctx.strokeStyle = `rgba(${accentColor}, ${0.12 + Math.sin(phase * 2) * 0.08})`;
        ctx.lineWidth = 1;
      } else {
        ctx.strokeStyle = `rgba(${ringBaseColor}, 0.4)`;
        ctx.lineWidth = 1;
      }
      ctx.stroke();

      // ─── 2. Mid Ring (Audio Reactive Pulse) ───
      const midScale = isSpeaking
        ? 1 + level * 0.24 + Math.sin(phase * 2.5 + 1) * 0.015
        : isListening
        ? 1 + Math.sin(phase * 1.5 + 0.8) * 0.03 + level * 0.1
        : 1;

      const midRadius = baseRadius * 1.38 * midScale;

      ctx.beginPath();
      ctx.arc(cx, cy, midRadius, 0, Math.PI * 2);
      if (isSpeaking) {
        ctx.strokeStyle = `rgba(${accentColor}, ${Math.min(0.5, 0.15 + level * 0.45)})`;
        ctx.lineWidth = 1.5;
      } else if (isListening) {
        ctx.strokeStyle = `rgba(${accentColor}, 0.25)`;
        ctx.lineWidth = 1;
      } else if (isThinking) {
        // Subtle dotted or pulsing ring during thinking
        ctx.strokeStyle = `rgba(${accentColor}, ${0.2 + Math.sin(phase * 2.5) * 0.1})`;
        ctx.lineWidth = 1;
      } else {
        ctx.strokeStyle = `rgba(${ringBaseColor}, 0.6)`;
        ctx.lineWidth = 1;
      }
      ctx.stroke();

      // ─── 3. Subtle Signal Nodes / Concentric Accents (Quiet industrial feel) ───
      if (isSpeaking || isListening) {
        const signalNodeCount = 4;
        const nodeRadius = midRadius;
        for (let i = 0; i < signalNodeCount; i++) {
          const angle = (i * Math.PI * 2) / signalNodeCount + (isSpeaking ? phase * 0.5 : 0);
          const nx = cx + Math.cos(angle) * nodeRadius;
          const ny = cy + Math.sin(angle) * nodeRadius;
          const dotSize = isSpeaking ? 1.5 + level * 2 : 1.5;

          ctx.beginPath();
          ctx.arc(nx, ny, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${accentColor}, ${isSpeaking ? 0.6 + level * 0.4 : 0.4})`;
          ctx.fill();
        }
      }

      // ─── 4. Center Core Background Circle (SS Monogram Badge) ───
      const centerScale = isSpeaking ? 1 + level * 0.05 : 1;
      const coreR = baseRadius * centerScale;

      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = centerBg;
      ctx.fill();
      ctx.strokeStyle = isSpeaking
        ? `rgba(${accentColor}, 0.8)`
        : isListening
        ? `rgba(${accentColor}, 0.5)`
        : centerBorder;
      ctx.lineWidth = isSpeaking ? 1.75 : 1.25;
      ctx.stroke();

      // ─── 5. SS Monogram Typography (Centered, Minimal) ───
      ctx.fillStyle = isSpeaking || isListening ? textPrimary : textMuted;
      ctx.font = `600 ${Math.round(coreR * 0.68)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Slight vertical adjustment for baseline precision
      ctx.fillText('SS', cx, cy + 0.5);

      ctx.restore();

      phase += 0.03;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [state, audioLevel, size]);

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="w-full h-full"
      />
    </div>
  );
}
